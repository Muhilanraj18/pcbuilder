"""
Build Generation & Recommendations Engine
Generates Balanced and Upgrade-Friendly builds with explanations
"""

from ranker import ComponentRanker
from compatibility import CompatibilityValidator
from components_db import CPUs, MOTHERBOARDs, RAMs, STORAGE, GPUs, PSUs, CASES, MONITORS


class UpgradeRecommender:
    """Generates upgrade recommendations for existing PCs"""

    @staticmethod
    def _component_name(component_value):
        """Return a component name whether the value is a dict or a plain string."""
        if isinstance(component_value, dict):
            return component_value.get("name")
        return component_value

    @staticmethod
    def _first_matching_component(current_pc, keys):
        """Return the first matching component entry from a list of aliases."""
        for key in keys:
            if key in current_pc:
                return current_pc[key]
        return None

    @staticmethod
    def _infer_current_specs(component_type, current_name):
        """Infer a minimal spec for unknown components so upgrade analysis can still run."""
        name = (current_name or "").lower()

        if component_type == "processor":
            if any(token in name for token in ["i3", "ryzen 3", "pentium", "celeron"]):
                return {"cores": 4, "threads": 8, "price": 8000, "tier": "budget", "socket": "LGA1700"}
            if any(token in name for token in ["i5", "ryzen 5"]):
                return {"cores": 6, "threads": 12, "price": 18000, "tier": "mid", "socket": "LGA1700"}
            if any(token in name for token in ["i7", "ryzen 7"]):
                return {"cores": 8, "threads": 16, "price": 30000, "tier": "upper-mid", "socket": "LGA1700"}
            return {"cores": 4, "threads": 8, "price": 10000, "tier": "budget", "socket": "LGA1700"}

        if component_type == "graphicscard":
            if any(token in name for token in ["gtx 1650", "gtx 1050", "rx 6400", "budget", "entry"]):
                return {"vram": 4, "price": 12000, "tier": "budget", "power_draw": 75}
            if any(token in name for token in ["rtx 3050", "rx 6600"]):
                return {"vram": 6, "price": 18000, "tier": "entry", "power_draw": 130}
            return {"vram": 8, "price": 22000, "tier": "mid", "power_draw": 150}

        if component_type == "ram":
            if "8gb" in name:
                return {"capacity": 8, "price": 3000, "speed": 2666, "type": "DDR4"}
            if "16gb" in name:
                return {"capacity": 16, "price": 5500, "speed": 3200, "type": "DDR4"}
            return {"capacity": 8, "price": 3000, "speed": 2666, "type": "DDR4"}

        if component_type == "storage":
            return {"capacity": 512, "price": 3500, "type": "HDD" if "hdd" in name else "SSD"}

        if component_type == "powersupply":
            return {"wattage": 450, "price": 3500}

        return {"price": 0}
    
    @staticmethod
    def get_upgrade_suggestions(current_pc, budget=None):
        """
        Analyze current PC and suggest upgrades
        Returns list of recommended upgrades with compatibility checks
        """
        suggestions = []
        
        # Get component priorities based on current specs
        priorities = UpgradeRecommender._analyze_bottlenecks(current_pc)
        
        # Generate upgrade recommendations for each weak component
        for component_type, priority in priorities:
            if budget and budget <= 0:
                break
                
            recommendation = UpgradeRecommender._get_component_upgrade(
                component_type, 
                current_pc, 
                budget
            )
            
            if recommendation:
                suggestions.append(recommendation)
        
        return suggestions
    
    @staticmethod
    def _analyze_bottlenecks(current_pc):
        """Identify which components need upgrades most"""
        priorities = []
        
        # Check CPU
        cpu_entry = UpgradeRecommender._first_matching_component(current_pc, ["processor", "cpu"])
        if cpu_entry is not None:
            cpu_name = UpgradeRecommender._component_name(cpu_entry)
            if cpu_name in CPUs:
                cpu = CPUs[cpu_name]
                if cpu.get("tier") == "budget" or cpu["cores"] < 6:
                    priorities.append(("processor", 8))
            elif any(token in (cpu_name or "").lower() for token in ["i3", "ryzen 3", "pentium", "celeron", "budget"]):
                priorities.append(("processor", 8))
        
        # Check RAM
        ram_entry = UpgradeRecommender._first_matching_component(current_pc, ["ram"])
        if ram_entry is not None:
            ram_name = UpgradeRecommender._component_name(ram_entry)
            if ram_name in RAMs:
                ram = RAMs[ram_name]
                if ram["capacity"] < 16:
                    priorities.append(("ram", 9))  # RAM upgrade is usually easy
        
        # Check GPU
        gpu_entry = UpgradeRecommender._first_matching_component(current_pc, ["graphicscard", "gpu"])
        if gpu_entry is not None:
            gpu_name = UpgradeRecommender._component_name(gpu_entry)
            if gpu_name in GPUs:
                gpu = GPUs[gpu_name]
                if gpu.get("tier") in ["budget", "entry"] or gpu["vram"] < 6:
                    priorities.append(("graphicscard", 10))  # GPU has highest impact
            elif any(token in (gpu_name or "").lower() for token in ["gtx 1650", "gtx 1050", "budget", "entry"]):
                priorities.append(("graphicscard", 10))
        
        # Check Storage
        storage_entry = UpgradeRecommender._first_matching_component(current_pc, ["storage"])
        if storage_entry is not None:
            storage_name = UpgradeRecommender._component_name(storage_entry)
            if storage_name in STORAGE:
                storage = STORAGE[storage_name]
                if storage["type"] == "HDD":
                    priorities.append(("storage", 7))  # SSD upgrade is very impactful
        
        # Sort by priority (highest first)
        priorities.sort(key=lambda x: x[1], reverse=True)
        return priorities
    
    @staticmethod
    def _get_component_upgrade(component_type, current_pc, budget):
        """Get specific component upgrade recommendation"""
        
        # Map component types to data sources
        component_map = {
            "processor": (CPUs, "CPU"),
            "graphicscard": (GPUs, "GPU"),
            "ram": (RAMs, "RAM"),
            "storage": (STORAGE, "Storage"),
            "powersupply": (PSUs, "PSU")
        }
        
        if component_type not in component_map:
            return None
        
        db, display_name = component_map[component_type]
        alias_map = {
            "processor": ["processor", "cpu"],
            "graphicscard": ["graphicscard", "gpu"],
            "ram": ["ram"],
            "storage": ["storage"],
            "powersupply": ["powersupply", "psu"]
        }
        current_part = UpgradeRecommender._first_matching_component(current_pc, alias_map.get(component_type, [component_type]))

        if current_part is None:
            return None

        current_name = UpgradeRecommender._component_name(current_part)
        current_part_record = current_part if isinstance(current_part, dict) else {"name": current_name}

        if current_name in db:
            current_spec = db[current_name]
            current_price = current_spec["price"]
        else:
            current_spec = UpgradeRecommender._infer_current_specs(component_type, current_name)
            current_price = current_spec.get("price", 0)
        
        # Find better alternatives
        better_options = []
        for name, specs in db.items():
            if specs["price"] > current_price:
                # Check if it's actually better
                is_better = UpgradeRecommender._is_better_component(
                    component_type, current_spec, specs
                )
                
                if is_better:
                    performance_gain = UpgradeRecommender._calculate_performance_gain(
                        component_type, current_spec, specs
                    )
                    better_options.append({
                        "name": name,
                        "specs": specs,
                        "performance_gain": performance_gain,
                        "price": specs["price"]
                    })
        
        if not better_options:
            return None
        
        # Filter by budget if provided
        if budget:
            budget_friendly_options = [opt for opt in better_options if opt["price"] <= budget]
            if budget_friendly_options:
                better_options = budget_friendly_options
        
        if not better_options:
            return None
        
        # Sort by best value (performance gain / price)
        better_options.sort(
            key=lambda x: x["performance_gain"] / x["price"],
            reverse=True
        )
        
        best_upgrade = better_options[0]
        
        # Check compatibility
        compatibility, reason = UpgradeRecommender._check_upgrade_compatibility(
            component_type, best_upgrade["name"], current_pc
        )
        
        # Build recommendation
        recommendation = {
            "currentPart": {
                "id": current_part_record.get("id", "current"),
                "name": current_name,
                "category": display_name,
                "price": current_price,
                "specs": UpgradeRecommender._format_specs(component_type, current_spec)
            },
            "component": display_name,
            "recommendedPart": {
                "id": f"upgrade-{component_type}",
                "name": best_upgrade["name"],
                "category": display_name,
                "price": best_upgrade["price"],
                "specs": UpgradeRecommender._format_specs(component_type, best_upgrade["specs"]),
                "whyRecommended": UpgradeRecommender._get_why_recommended(
                    component_type, current_spec, best_upgrade["specs"]
                ),
                "easyExplanation": UpgradeRecommender._get_easy_explanation(
                    component_type, best_upgrade["specs"]
                )
            },
            "performance": f"+{best_upgrade['performance_gain']}% performance",
            "estimated_improvement": f"+{best_upgrade['performance_gain']}%",
            "reason": UpgradeRecommender._get_upgrade_reason(
                component_type, current_spec, best_upgrade["specs"]
            ),
            "compatibility": "compatible" if compatibility else "incompatible",
            "incompatibilityReason": reason if not compatibility else None
        }
        
        return recommendation
    
    @staticmethod
    def _is_better_component(component_type, current, new):
        """Check if new component is objectively better"""
        if component_type == "processor":
            return new["cores"] >= current["cores"] and new["threads"] >= current["threads"]
        elif component_type == "graphicscard":
            return new["vram"] > current["vram"] or new.get("tier") != "budget"
        elif component_type == "ram":
            return new["capacity"] > current["capacity"] or new["speed"] > current["speed"]
        elif component_type == "storage":
            return new["capacity"] >= current["capacity"] or (
                current["type"] == "HDD" and new["type"] in ["SSD", "NVMe"]
            )
        elif component_type == "powersupply":
            return new["wattage"] > current["wattage"]
        return True
    
    @staticmethod
    def _calculate_performance_gain(component_type, current, new):
        """Estimate performance improvement percentage"""
        if component_type == "processor":
            gain = ((new["cores"] / current["cores"]) - 1) * 100
            return min(int(gain + 20), 80)  # Cap at 80%
        elif component_type == "graphicscard":
            gain = ((new["vram"] / max(current["vram"], 1)) - 1) * 100
            return min(int(gain + 30), 100)
        elif component_type == "ram":
            gain = ((new["capacity"] / current["capacity"]) - 1) * 100
            speed_gain = ((new["speed"] / current["speed"]) - 1) * 20
            return min(int(gain + speed_gain), 75)
        elif component_type == "storage":
            if current["type"] == "HDD" and new["type"] in ["SSD", "NVMe"]:
                return 200  # Huge improvement
            return 30
        elif component_type == "powersupply":
            return 10  # PSU doesn't affect performance directly
        return 25
    
    @staticmethod
    def _check_upgrade_compatibility(component_type, new_component_name, current_pc):
        """Check if upgrade is compatible with existing PC"""
        
        if component_type == "processor":
            # Check motherboard socket compatibility
            if "motherboard" in current_pc:
                mobo_name = current_pc["motherboard"]["name"]
                if mobo_name in MOTHERBOARDs and new_component_name in CPUs:
                    mobo_socket = MOTHERBOARDs[mobo_name]["socket"]
                    cpu_socket = CPUs[new_component_name]["socket"]
                    
                    if mobo_socket != cpu_socket:
                        return False, f"Motherboard socket {mobo_socket} is not compatible with CPU socket {cpu_socket}. You would need to upgrade your motherboard too."
        
        elif component_type == "ram":
            # Check RAM type compatibility
            if "motherboard" in current_pc:
                mobo_name = current_pc["motherboard"]["name"]
                if mobo_name in MOTHERBOARDs and new_component_name in RAMs:
                    mobo_ram_type = MOTHERBOARDs[mobo_name]["ram_type"]
                    ram_type = RAMs[new_component_name]["type"]
                    
                    if mobo_ram_type != ram_type:
                        return False, f"Motherboard supports {mobo_ram_type} but this RAM is {ram_type}."
        
        elif component_type == "graphicscard":
            # Check if PSU has enough wattage
            if "powersupply" in current_pc and new_component_name in GPUs:
                psu_name = current_pc["powersupply"]["name"]
                if psu_name in PSUs:
                    psu_wattage = PSUs[psu_name]["wattage"]
                    gpu_power = GPUs[new_component_name]["power_draw"]
                    
                    # Rough estimation: System needs GPU power + 150W for rest
                    required_wattage = gpu_power + 150
                    
                    if psu_wattage < required_wattage:
                        return False, f"Your {psu_wattage}W PSU is not powerful enough. This GPU needs at least {required_wattage}W total system power."
        
        return True, None
    
    @staticmethod
    def _format_specs(component_type, specs):
        """Format specs for display"""
        if component_type == "processor":
            return {
                "Cores": f"{specs['cores']} Cores",
                "Threads": f"{specs['threads']} Threads",
                "TDP": f"{specs['tdp']}W"
            }
        elif component_type == "graphicscard":
            return {
                "VRAM": f"{specs['vram']}GB",
                "Power": f"{specs['power_draw']}W",
                "Performance": specs["performance"]
            }
        elif component_type == "ram":
            return {
                "Capacity": f"{specs['capacity']}GB",
                "Type": specs["type"],
                "Speed": f"{specs['speed']}MHz"
            }
        elif component_type == "storage":
            return {
                "Capacity": f"{specs['capacity']}GB",
                "Type": specs["type"],
                "Speed": specs.get("speed", "N/A")
            }
        elif component_type == "powersupply":
            return {
                "Wattage": f"{specs['wattage']}W",
                "Efficiency": specs["efficiency"],
                "Certification": specs["certification"]
            }
        return {}
    
    @staticmethod
    def _get_why_recommended(component_type, current, new):
        """Generate why recommended text"""
        if component_type == "processor":
            return f"Upgrade from {current['cores']} to {new['cores']} cores for better multitasking and performance"
        elif component_type == "graphicscard":
            return f"Significantly better graphics with {new['vram']}GB VRAM for modern games and applications"
        elif component_type == "ram":
            return f"More RAM ({new['capacity']}GB) means smoother multitasking and faster application loading"
        elif component_type == "storage":
            if current["type"] == "HDD" and new["type"] in ["SSD", "NVMe"]:
                return "Upgrading to SSD will make your PC boot in seconds and apps load instantly"
            return f"More storage space and faster read/write speeds"
        elif component_type == "powersupply":
            return f"More wattage ({new['wattage']}W) allows for future GPU upgrades and better stability"
        return "Better performance and future-proofing"
    
    @staticmethod
    def _get_easy_explanation(component_type, specs):
        """Generate beginner-friendly explanation"""
        if component_type == "processor":
            return f"This CPU has {specs['cores']} cores, which means it can handle multiple tasks at once much better. Great for gaming, programming, and productivity."
        elif component_type == "graphicscard":
            return f"This graphics card has {specs['vram']}GB of video memory, perfect for {specs['performance'].lower()}. Makes games look beautiful and run smoothly."
        elif component_type == "ram":
            return f"With {specs['capacity']}GB RAM, you can run many programs at once without slowdowns. Like having a bigger desk to work on."
        elif component_type == "storage":
            if specs["type"] in ["SSD", "NVMe"]:
                return f"This {specs['type']} is super fast - your PC will boot in seconds instead of minutes. {specs['capacity']}GB is enough for your OS and important programs."
            return f"{specs['capacity']}GB for storing all your files, games, and media."
        elif component_type == "powersupply":
            return f"This {specs['wattage']}W power supply has enough power for your current PC and future upgrades like a better graphics card."
        return "A solid upgrade for better overall performance."
    
    @staticmethod
    def _get_upgrade_reason(component_type, current, new):
        """Generate detailed upgrade reasoning"""
        if component_type == "processor":
            return f"Your current CPU has {current['cores']} cores. Upgrading to {new['cores']} cores will improve performance in multi-threaded tasks like video editing, 3D rendering, and modern games that use more cores."
        elif component_type == "graphicscard":
            return f"The new GPU has {new['vram']}GB VRAM compared to your current {current['vram']}GB. This means better performance at higher resolutions and with more detailed graphics settings. You'll notice smoother frame rates in games."
        elif component_type == "ram":
            return f"Upgrading from {current['capacity']}GB to {new['capacity']}GB RAM will eliminate slowdowns when running multiple applications. Your PC will feel much snappier."
        elif component_type == "storage":
            if current["type"] == "HDD" and new["type"] in ["SSD", "NVMe"]:
                return f"Moving from HDD to {new['type']} is one of the most noticeable upgrades. Windows will boot in 10-15 seconds instead of minutes, and programs will open instantly."
            return "More storage space and improved read/write performance."
        elif component_type == "powersupply":
            return f"Upgrading to a {new['wattage']}W PSU ensures you have enough power headroom for future component upgrades, especially if you plan to add a powerful graphics card."
        return "This upgrade will improve your PC's capabilities."


class BuildRecommender:
    """Generates optimized PC builds with detailed explanations"""
    
    @staticmethod
    def generate_balanced_build(budget, use_case=None, gpu_heavy=False, include_monitor=False):
        """
        Generate Build A: Balanced
        Optimizes for overall performance/price ratio
        """
        ranker = ComponentRanker()
        builds = ranker.rank_compatible_combinations(budget, use_case, gpu_heavy, include_monitor)
        
        if not builds:
            return None, "No compatible builds found within budget"
        
        # Top ranked build is most balanced
        best_build = builds[0]
        
        explanation = BuildRecommender._generate_explanation(best_build, "Balanced")
        
        return best_build, explanation
    
    @staticmethod
    def generate_upgrade_friendly_build(budget, use_case=None, gpu_heavy=False, include_monitor=False):
        """
        Generate Build B: Upgrade-Friendly
        Prioritizes mid-tier components with good upgrade paths
        """
        ranker = ComponentRanker()
        builds = ranker.rank_compatible_combinations(budget, use_case, gpu_heavy, include_monitor)
        
        if not builds:
            return None, "No compatible builds found within budget"
        
        # Filter for mid-tier components with good upgrade potential
        def upgrade_score(build):
            cpu_tier = CPUs[build["cpu"]].get("tier", "budget")
            mobo_tier = MOTHERBOARDs[build["mobo"]].get("tier", "budget")
            gpu_tier = GPUs[build["gpu"]].get("tier", "entry")
            psu_rating = PSUs[build["psu"]]["wattage"]
            
            # Prefer mid-tier with high wattage PSU for upgrades
            score = 0
            if cpu_tier == "mid":
                score += 3
            elif cpu_tier == "budget":
                score += 1
            elif cpu_tier == "high":
                score += 2
            
            if mobo_tier == "mid":
                score += 3
            elif mobo_tier == "budget":
                score += 1
            
            if gpu_tier == "mid":
                score += 2
            elif gpu_tier == "entry":
                score += 1
            
            if psu_rating >= 700:
                score += 2  # Room for GPU upgrades
            
            return score
        
        # Sort by upgrade potential
        builds_by_upgrade = sorted(builds, key=upgrade_score, reverse=True)
        upgrade_friendly = builds_by_upgrade[0]
        
        explanation = BuildRecommender._generate_explanation(upgrade_friendly, "Upgrade-Friendly")
        
        return upgrade_friendly, explanation
    
    @staticmethod
    def _generate_explanation(build, build_type):
        """Generate detailed explanation for component choices"""
        explanation = f"\n### {build_type} Build Explanation\n"
        
        cpu_name = build["cpu"]
        mobo_name = build["mobo"]
        gpu_name = build["gpu"]
        psu_name = build["psu"]
        
        cpu = CPUs[cpu_name]
        mobo = MOTHERBOARDs[mobo_name]
        gpu = GPUs[gpu_name]
        psu = PSUs[psu_name]
        
        explanation += f"\n**CPU: {cpu_name}** (₹{cpu['price']})\n"
        explanation += f"- {cpu['cores']} cores, {cpu['threads']} threads, {cpu['tdp']}W TDP\n"
        explanation += f"- Why: Excellent price/performance for {', '.join(cpu['use_cases'])}\n"
        
        explanation += f"\n**Motherboard: {mobo_name}** (₹{mobo['price']})\n"
        explanation += f"- Socket {mobo['socket']}, {mobo['pcie_slots']} PCIe slots, Max {mobo['max_ram']}GB RAM\n"
        explanation += f"- Why: Perfect socket match for {cpu_name}, {mobo['tier']}-tier with growth potential\n"
        
        explanation += f"\n**GPU: {gpu_name}** (₹{gpu['price']})\n"
        explanation += f"- {gpu['vram']}GB VRAM, {gpu['power_draw']}W, {gpu['performance']}\n"
        explanation += f"- Why: Best value for performance, excellent availability\n"
        
        explanation += f"\n**PSU: {psu_name}** (₹{psu['price']})\n"
        explanation += f"- {psu['wattage']}W, {psu['certification']} certification\n"
        explanation += f"- Why: Sufficient headroom (safe at 80% load) + future upgrade potential\n"
        
        explanation += f"\n**Storage: {build['storage']}** (₹{STORAGE[build['storage']]['price']})\n"
        explanation += f"\n**RAM: {build['ram']}** (₹{RAMs[build['ram']]['price']})\n"
        explanation += f"\n**Case: {build['case']}** (₹{CASES[build['case']]['price']})\n"
        
        if "monitor" in build and build["monitor"]:
            explanation += f"\n**Monitor: {build['monitor']}** (₹{MONITORS[build['monitor']]['price']})\n"
        
        explanation += f"\n**Total Price: ₹{build['total_price']}**\n"
        
        return explanation
    
    @staticmethod
    def suggest_upgrades(current_pc_specs, budget):
        """
        Provide upgrade suggestions for existing PCs
        current_pc_specs: dict with 'cpu', 'mobo', 'gpu', 'ram', 'psu' keys
        """
        upgrades = []
        
        # Check if CPU is bottleneck
        cpu = current_pc_specs.get("cpu")
        if cpu in CPUs:
            cpu_tier = CPUs[cpu].get("tier", "budget")
            if cpu_tier == "budget":
                upgrades.append({
                    "component": "CPU",
                    "reason": f"Current {cpu} is entry-level. Upgrade for better performance.",
                    "estimated_improvement": "30-50% FPS/gaming improvement"
                })
        
        # Check if GPU needs upgrade
        gpu = current_pc_specs.get("gpu")
        if gpu in GPUs:
            gpu_tier = GPUs[gpu].get("tier", "entry")
            if gpu_tier == "entry":
                upgrades.append({
                    "component": "GPU",
                    "reason": f"Current {gpu} is entry-level. Upgrade for significant performance gains.",
                    "estimated_improvement": "50-100% FPS improvement"
                })
            
            gpu_power = GPUs[gpu]["power_draw"]
            psu = current_pc_specs.get("psu", "")
            if psu in PSUs:
                psu_wattage = PSUs[psu]["wattage"]
                if gpu_power > psu_wattage * 0.4:  # If GPU is using 40%+ of PSU
                    upgrades.append({
                        "component": "PSU + GPU",
                        "reason": f"Current PSU ({psu}) may limit GPU upgrade potential.",
                        "estimated_improvement": "Enable 2-3x more powerful GPU"
                    })
        
        # Check RAM
        ram = current_pc_specs.get("ram")
        if ram in RAMs:
            ram_cap = RAMs[ram]["capacity"]
            if ram_cap < 16:
                upgrades.append({
                    "component": "RAM",
                    "reason": f"Current {ram_cap}GB RAM is limiting for modern gaming/content creation.",
                    "estimated_improvement": "Smoother gameplay, better multitasking"
                })
        
        return upgrades


# Main recommendation system
class PCBuilderAssistant:
    """Main interface for PC Builder recommendations"""
    
    def __init__(self):
        self.recommender = BuildRecommender()
    
    def get_build_recommendations(self, budget, with_monitor=False, use_case=None, gpu_heavy=False):
        """Get both Balanced and Upgrade-Friendly builds"""
        
        # Generate both builds
        balanced_build, balanced_explain = BuildRecommender.generate_balanced_build(
            budget, use_case, gpu_heavy, with_monitor
        )
        
        upgrade_friendly_build, upgrade_explain = BuildRecommender.generate_upgrade_friendly_build(
            budget, use_case, gpu_heavy, with_monitor
        )
        
        return {
            "balanced": {
                "build": balanced_build,
                "explanation": balanced_explain
            },
            "upgrade_friendly": {
                "build": upgrade_friendly_build,
                "explanation": upgrade_explain
            }
        }
    
    def get_upgrade_suggestions(self, current_pc, budget=None):
        """Get upgrade path suggestions with compatibility checks"""
        return UpgradeRecommender.get_upgrade_suggestions(current_pc, budget)


# Example usage
if __name__ == "__main__":
    assistant = PCBuilderAssistant()
    
    print("=" * 60)
    print("PC BUILDER & UPGRADE ASSISTANT")
    print("=" * 60)
    
    # Test 1: Gaming build at 30k without monitor
    print("\n[BUILD REQUEST] Budget: ₹30,000 | Gaming | No Monitor")
    recs = assistant.get_build_recommendations(30000, with_monitor=False, use_case="Gaming", gpu_heavy=True)
    
    if recs["balanced"]["build"]:
        print(recs["balanced"]["explanation"])
    else:
        print("No builds found")
    
    # Test 2: Coding build at 40k with monitor
    print("\n" + "=" * 60)
    print("\n[BUILD REQUEST] Budget: ₹40,000 | Coding | With Monitor")
    recs = assistant.get_build_recommendations(40000, with_monitor=True, use_case="Coding", gpu_heavy=False)
    
    if recs["upgrade_friendly"]["build"]:
        print(recs["upgrade_friendly"]["explanation"])
    
    # Test 3: Upgrade suggestions
    print("\n" + "=" * 60)
    print("\n[UPGRADE SUGGESTIONS] Current PC: i3 + GTX 1650 + 8GB RAM")
    current_pc = {
        "cpu": "Intel Core i3-12100F",
        "mobo": "MSI B660M DS3H",
        "gpu": "NVIDIA GTX 1650",
        "ram": "Kingston ValueRAM 8GB DDR4",
        "psu": "Corsair VS 450W"
    }
    
    upgrades = assistant.get_upgrade_suggestions(current_pc, budget=15000)
    for upgrade in upgrades:
        print(f"\n• {upgrade['component']}: {upgrade['reason']}")
        print(f"  Expected improvement: {upgrade['estimated_improvement']}")
