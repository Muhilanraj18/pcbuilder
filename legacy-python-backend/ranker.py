"""
Component Filtering & Ranking Module
Filters compatible components and ranks them using logic scoring
"""

from components_db import CPUs, MOTHERBOARDs, RAMs, STORAGE, GPUs, PSUs, CASES, MONITORS
from compatibility import CompatibilityValidator


class ComponentRanker:
    """Ranks components using logic scoring: price/performance, upgrade-friendliness, availability"""
    
    @staticmethod
    def calculate_cpu_score(cpu_name, use_case=None, gpu_heavy=False):
        """Score CPU based on performance, price, and use case alignment"""
        cpu = CPUs[cpu_name]
        base_score = (cpu["cores"] * cpu["threads"]) / cpu["price"]  # Performance per rupee
        
        use_case_bonus = 0
        if use_case and use_case in cpu["use_cases"]:
            use_case_bonus = 0.2
        
        gpu_heavy_bonus = 0.1 if gpu_heavy else 0  # If GPU-heavy, cheaper CPU is fine
        
        return base_score * (1 + use_case_bonus + gpu_heavy_bonus)
    
    @staticmethod
    def calculate_mobo_score(mobo_name, cpu_socket, upgrade_friendly=False):
        """Score motherboard based on features and upgrade potential"""
        mobo = MOTHERBOARDs[mobo_name]
        
        # Check socket compatibility
        if mobo["socket"] != cpu_socket:
            return 0
        
        base_score = mobo["pcie_slots"] / mobo["price"]  # Expandability per rupee
        upgrade_bonus = 0.15 if upgrade_friendly and mobo["tier"] != "budget" else 0
        
        return base_score * (1 + upgrade_bonus)
    
    @staticmethod
    def calculate_ram_score(ram_name, use_case=None):
        """Score RAM based on capacity, speed, and price"""
        ram = RAMs[ram_name]
        
        base_score = ram["capacity"] / ram["price"]  # Capacity per rupee
        
        # Speed bonus
        speed_bonus = 0
        if ram["speed"] >= 3600:
            speed_bonus = 0.15
        elif ram["speed"] >= 3200:
            speed_bonus = 0.1
        
        # Availability bonus
        availability_bonus = 0.1 if ram["availability"] == "high" else 0.05
        
        return base_score * (1 + speed_bonus + availability_bonus)
    
    @staticmethod
    def calculate_gpu_score(gpu_name, use_case=None, budget_conscious=False):
        """Score GPU based on performance, VRAM, and use case"""
        gpu = GPUs[gpu_name]
        
        # Skip integrated GPUs (price is 0)
        if gpu["price"] == 0:
            return 0
        
        base_score = gpu["vram"] / gpu["price"]  # VRAM per rupee
        
        use_case_bonus = 0
        if use_case == "Graphics" and "Graphics" in gpu["performance"]:
            use_case_bonus = 0.2
        elif use_case == "Gaming" and "Gaming" in gpu["performance"]:
            use_case_bonus = 0.15
        
        # Availability bonus
        availability_bonus = 0.1 if gpu["availability"] == "high" else 0.05
        
        # Budget consciousness favors lower power draw
        power_efficiency = 1 - (gpu["power_draw"] / 200) * 0.1 if budget_conscious else 1
        
        return base_score * (1 + use_case_bonus + availability_bonus) * power_efficiency
    
    @staticmethod
    def filter_components_by_budget(budget, include_monitor=False):
        """Filter all components that fit within budget constraints"""
        # Allocate portions of budget for each component
        # Without monitor: CPU(20%) + Mobo(15%) + RAM(12%) + Storage(10%) + GPU(30%) + PSU(8%) + Case(5%)
        if include_monitor:
            # With monitor, reduce GPU allocation
            budget_without_monitor = budget * 0.7  # Save 30% for monitor
            available_components = {
                "cpus": {name: cpu for name, cpu in CPUs.items() if cpu["price"] <= budget_without_monitor * 0.28},
                "mobos": {name: mobo for name, mobo in MOTHERBOARDs.items() if mobo["price"] <= budget_without_monitor * 0.22},
                "ram": {name: ram for name, ram in RAMs.items() if ram["price"] <= budget_without_monitor * 0.17},
                "storage": {name: storage for name, storage in STORAGE.items() if storage["price"] <= budget_without_monitor * 0.15},
                "gpus": {name: gpu for name, gpu in GPUs.items() if gpu["price"] <= budget_without_monitor * 0.12},
                "psu": {name: psu for name, psu in PSUs.items() if psu["price"] <= budget_without_monitor * 0.03},
                "case": {name: case for name, case in CASES.items() if case["price"] <= budget_without_monitor * 0.03},
                "monitor": {name: mon for name, mon in MONITORS.items() if mon["price"] <= budget * 0.25}
            }
        else:
            available_components = {
                "cpus": {name: cpu for name, cpu in CPUs.items() if cpu["price"] <= budget * 0.25},
                "mobos": {name: mobo for name, mobo in MOTHERBOARDs.items() if mobo["price"] <= budget * 0.20},
                "ram": {name: ram for name, ram in RAMs.items() if ram["price"] <= budget * 0.15},
                "storage": {name: storage for name, storage in STORAGE.items() if storage["price"] <= budget * 0.12},
                "gpus": {name: gpu for name, gpu in GPUs.items() if gpu["price"] <= budget * 0.20},
                "psu": {name: psu for name, psu in PSUs.items() if psu["price"] <= budget * 0.05},
                "case": {name: case for name, case in CASES.items() if case["price"] <= budget * 0.03},
                "monitor": {}
            }
        
        return available_components
    
    @staticmethod
    def rank_compatible_combinations(budget, use_case=None, gpu_heavy=False, include_monitor=False):
        """Find and rank all valid component combinations using intelligent selection"""
        valid_builds = []
        
        # Determine budget allocation for monitor
        if include_monitor:
            core_budget = budget * 0.65
            monitor_budget = budget * 0.35
        else:
            core_budget = budget
            monitor_budget = 0
        
        # Get all CPUs
        suitable_cpus = [(name, cpu) for name, cpu in CPUs.items()]
        
        # Try CPU-Mobo combinations
        for cpu_name, cpu in suitable_cpus:
            # Find compatible mobos
            compatible_mobos = [
                (name, mobo) for name, mobo in MOTHERBOARDs.items()
                if mobo["socket"] == cpu["socket"]
            ]
            
            for mobo_name, mobo in compatible_mobos:
                # Find compatible RAM
                compatible_ram = [
                    (name, ram) for name, ram in RAMs.items()
                    if ram["type"] == mobo["ram_type"]
                ]
                
                for ram_name, ram in compatible_ram:
                    # Try all storage
                    for storage_name, storage in STORAGE.items():
                        # Try all GPUs
                        for gpu_name, gpu in GPUs.items():
                            # Find PSU with sufficient wattage
                            required_power = cpu["tdp"] + gpu["power_draw"] + 150
                            safe_psu_wattage = required_power / 0.8
                            
                            compatible_psu = [
                                (name, psu) for name, psu in PSUs.items()
                                if psu["wattage"] >= safe_psu_wattage
                            ]
                            
                            for psu_name, psu in compatible_psu:
                                # Try all cases
                                for case_name, case in CASES.items():
                                    total_price = (cpu["price"] + mobo["price"] + ram["price"] +
                                                 storage["price"] + gpu["price"] + psu["price"] + case["price"])
                                    
                                    if include_monitor:
                                        # Try all monitors
                                        for monitor_name, monitor in MONITORS.items():
                                            monitor_total = total_price + monitor["price"]
                                            
                                            if monitor_total <= budget:
                                                score = (ComponentRanker.calculate_cpu_score(cpu_name, use_case, gpu_heavy) +
                                                        ComponentRanker.calculate_mobo_score(mobo_name, cpu["socket"]) +
                                                        ComponentRanker.calculate_ram_score(ram_name, use_case) +
                                                        ComponentRanker.calculate_gpu_score(gpu_name, use_case, gpu_heavy))
                                                
                                                valid_builds.append({
                                                    "cpu": cpu_name,
                                                    "mobo": mobo_name,
                                                    "ram": ram_name,
                                                    "storage": storage_name,
                                                    "gpu": gpu_name,
                                                    "psu": psu_name,
                                                    "case": case_name,
                                                    "monitor": monitor_name,
                                                    "total_price": monitor_total,
                                                    "score": score
                                                })
                                    else:
                                        if total_price <= budget:
                                            score = (ComponentRanker.calculate_cpu_score(cpu_name, use_case, gpu_heavy) +
                                                    ComponentRanker.calculate_mobo_score(mobo_name, cpu["socket"]) +
                                                    ComponentRanker.calculate_ram_score(ram_name, use_case) +
                                                    ComponentRanker.calculate_gpu_score(gpu_name, use_case, gpu_heavy))
                                            
                                            valid_builds.append({
                                                "cpu": cpu_name,
                                                "mobo": mobo_name,
                                                "ram": ram_name,
                                                "storage": storage_name,
                                                "gpu": gpu_name,
                                                "psu": psu_name,
                                                "case": case_name,
                                                "total_price": total_price,
                                                "score": score
                                            })
        
        # Sort by score descending and remove duplicates
        valid_builds_dedup = {}
        for build in valid_builds:
            key = (build["cpu"], build["mobo"], build["ram"], build["gpu"])
            if key not in valid_builds_dedup or valid_builds_dedup[key]["score"] < build["score"]:
                valid_builds_dedup[key] = build
        
        valid_builds_final = list(valid_builds_dedup.values())
        valid_builds_final.sort(key=lambda x: x["score"], reverse=True)
        
        return valid_builds_final


# Test
if __name__ == "__main__":
    ranker = ComponentRanker()
    
    print("=== Testing 30k Budget Build (Gaming) ===")
    builds = ranker.rank_compatible_combinations(30000, use_case="Gaming", gpu_heavy=True)
    if builds:
        print(f"Found {len(builds)} valid builds")
        top_build = builds[0]
        print(f"Top build (Score: {top_build['score']:.2f}):")
        for key, value in top_build.items():
            if key != "score":
                print(f"  {key}: {value}")
