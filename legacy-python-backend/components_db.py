"""
Component Database - Contains specifications for all PC components
Used for filtering and recommendation logic
"""

# CPU Database with socket info and images
CPUs = {
    "Intel Core i3-12100F": {
        "price": 8500,
        "socket": "LGA1700",
        "cores": 4,
        "threads": 8,
        "tdp": 60,
        "tier": "budget",
        "use_cases": ["Coding", "Casual Gaming"],
        "brand": "Intel",
        "image": "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400"
    },
    "Intel Core i5-12400F": {
        "price": 15500,
        "socket": "LGA1700",
        "cores": 6,
        "threads": 12,
        "tdp": 65,
        "tier": "mid",
        "use_cases": ["Coding", "Gaming", "Graphics"],
        "brand": "Intel",
        "image": "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400"
    },
    "AMD Ryzen 5 5500": {
        "price": 12000,
        "socket": "AM4",
        "cores": 6,
        "threads": 12,
        "tdp": 65,
        "tier": "mid",
        "use_cases": ["Coding", "Gaming"],
        "brand": "AMD",
        "image": "https://images.unsplash.com/photo-1591799265444-d66432b91588?w=400"
    },
    "AMD Ryzen 7 5700X": {
        "price": 18500,
        "socket": "AM4",
        "cores": 8,
        "threads": 16,
        "tdp": 105,
        "tier": "high",
        "use_cases": ["Gaming", "Graphics", "Streaming"],
        "brand": "AMD",
        "image": "https://images.unsplash.com/photo-1591799265444-d66432b91588?w=400"
    }
}

# Motherboard Database with socket and RAM type
MOTHERBOARDs = {
    "MSI B660M DS3H": {
        "price": 8000,
        "socket": "LGA1700",
        "ram_type": "DDR4",
        "max_ram": 64,
        "form_factor": "Micro-ATX",
        "pcie_slots": 2,
        "tier": "budget",
        "brand": "MSI",
        "image": "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400"
    },
    "ASUS ROG STRIX B660-F": {
        "price": 15000,
        "socket": "LGA1700",
        "ram_type": "DDR4",
        "max_ram": 128,
        "form_factor": "ATX",
        "pcie_slots": 3,
        "tier": "mid",
        "brand": "ASUS",
        "image": "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400"
    },
    "MSI B550-A PRO": {
        "price": 10000,
        "socket": "AM4",
        "ram_type": "DDR4",
        "max_ram": 128,
        "form_factor": "ATX",
        "pcie_slots": 3,
        "tier": "mid",
        "brand": "MSI",
        "image": "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400"
    },
    "ASRock B550M Steel Legend": {
        "price": 9500,
        "socket": "AM4",
        "ram_type": "DDR4",
        "max_ram": 64,
        "form_factor": "Micro-ATX",
        "pcie_slots": 2,
        "tier": "budget",
        "brand": "ASRock",
        "image": "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400"
    }
}

# RAM Database
RAMs = {
    "Kingston ValueRAM 8GB DDR4": {
        "price": 2500,
        "capacity": 8,
        "type": "DDR4",
        "speed": 2666,
        "availability": "high",
        "brand": "Kingston",
        "image": "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400"
    },
    "Corsair Vengeance LPX 16GB DDR4": {
        "price": 6500,
        "capacity": 16,
        "type": "DDR4",
        "speed": 3200,
        "availability": "high",
        "brand": "Corsair",
        "image": "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400"
    },
    "G.Skill Ripjaws V 16GB DDR4": {
        "price": 5800,
        "capacity": 16,
        "type": "DDR4",
        "speed": 3600,
        "availability": "medium",
        "brand": "G.Skill",
        "image": "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400"
    },
    "Kingston 32GB DDR4 3200": {
        "price": 11000,
        "capacity": 32,
        "type": "DDR4",
        "speed": 3200,
        "availability": "high",
        "brand": "Kingston",
        "image": "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400"
    }
}

# Storage Database
STORAGE = {
    "Seagate Barracuda 1TB HDD": {
        "price": 3500,
        "capacity": 1000,
        "type": "HDD",
        "speed": "5400RPM",
        "availability": "high"
    },
    "Kingston A400 240GB SSD": {
        "price": 2000,
        "capacity": 240,
        "type": "SSD",
        "speed": "500MB/s",
        "availability": "high"
    },
    "WD Green 240GB SSD": {
        "price": 1800,
        "capacity": 240,
        "type": "SSD",
        "speed": "545MB/s",
        "availability": "high"
    },
    "Kingston A2000 500GB NVMe": {
        "price": 3500,
        "capacity": 500,
        "type": "NVMe",
        "speed": "2000MB/s",
        "availability": "high"
    },
    "Samsung 970 EVO Plus 1TB": {
        "price": 8500,
        "capacity": 1000,
        "type": "NVMe",
        "speed": "3500MB/s",
        "availability": "high"
    }
}

# GPU Database
GPUs = {
    "Intel UHD 730 (Integrated)": {
        "price": 0,
        "vram": 0,
        "power_draw": 35,
        "performance": "Basic 1080p Browsing",
        "availability": "high",
        "tier": "budget"
    },
    "NVIDIA GTX 1650": {
        "price": 13000,
        "vram": 4,
        "power_draw": 75,
        "performance": "1080p Gaming",
        "availability": "high",
        "tier": "entry"
    },
    "NVIDIA RTX 3050": {
        "price": 18000,
        "vram": 6,
        "power_draw": 130,
        "performance": "1440p Gaming, Light Graphics",
        "availability": "medium",
        "tier": "mid"
    },
    "NVIDIA RTX 4060": {
        "price": 20000,
        "vram": 8,
        "power_draw": 140,
        "performance": "1440p Gaming, Graphics",
        "availability": "high",
        "tier": "mid"
    },
    "AMD RX 6600": {
        "price": 16000,
        "vram": 8,
        "power_draw": 110,
        "performance": "1080p/1440p Gaming",
        "availability": "medium",
        "tier": "mid"
    }
}

# PSU Database
PSUs = {
    "VIP 450W Basic": {
        "price": 2200,
        "wattage": 450,
        "efficiency": "80+",
        "certification": "Basic",
        "availability": "high"
    },
    "Corsair VS 450W": {
        "price": 3000,
        "wattage": 450,
        "efficiency": "80+",
        "certification": "Bronze",
        "availability": "high"
    },
    "Seasonic S12III-550W": {
        "price": 4000,
        "wattage": 550,
        "efficiency": "80+",
        "certification": "Bronze",
        "availability": "high"
    },
    "Corsair RM750x": {
        "price": 7500,
        "wattage": 750,
        "efficiency": "80+",
        "certification": "Gold",
        "availability": "high"
    },
    "MSI MPG A750GL": {
        "price": 6500,
        "wattage": 750,
        "efficiency": "80+",
        "certification": "Gold",
        "availability": "medium"
    }
}

# Case Database
CASES = {
    "Generic Mid-Tower": {
        "price": 2000,
        "form_factor": "Mid-Tower",
        "availability": "high",
        "cooling": "1 fan included"
    },
    "Antec NX410": {
        "price": 3500,
        "form_factor": "Mid-Tower",
        "availability": "high",
        "cooling": "2 fans included"
    },
    "Corsair Carbide Series SPEC-05": {
        "price": 4000,
        "form_factor": "Mid-Tower",
        "availability": "high",
        "cooling": "2 fans included"
    },
    "NZXT H510": {
        "price": 5500,
        "form_factor": "Mid-Tower",
        "availability": "high",
        "cooling": "2 fans included"
    }
}

# Monitor Database (for with_monitor builds)
MONITORS = {
    "Dell D2423D 24\" (1080p)": {
        "price": 9000,
        "resolution": "1920x1080",
        "refresh_rate": 60,
        "panel": "IPS",
        "availability": "high"
    },
    "LG 27GP850 27\" (1440p)": {
        "price": 18000,
        "resolution": "2560x1440",
        "refresh_rate": 144,
        "panel": "IPS",
        "availability": "high"
    },
    "ASUS VA24EHE 24\" (1080p)": {
        "price": 7500,
        "resolution": "1920x1080",
        "refresh_rate": 60,
        "panel": "VA",
        "availability": "high"
    }
}


# ===== COMPONENT DATABASE CLASS =====

class ComponentDatabase:
    """Database interface for querying components"""
    
    def __init__(self):
        self.processors = CPUs
        self.graphics_cards = GPUs
        self.motherboards = MOTHERBOARDs
        self.ram = RAMs
        self.storage = STORAGE
        self.power_supplies = PSUs
        self.monitors = MONITORS
        self.cases = CASES
    
    def _filter_by_budget(self, items, budget):
        """Filter items by budget"""
        if not budget:
            return items
        return {k: v for k, v in items.items() if v.get("price", 0) <= budget}
    
    def _filter_by_search(self, items, search_term):
        """Filter items by search term"""
        if not search_term:
            return items
        search_lower = search_term.lower()
        return {k: v for k, v in items.items() if search_lower in k.lower()}
    
    def _dict_to_list(self, items_dict, limit=20):
        """Convert dict to list of items with IDs"""
        result = []
        for idx, (name, specs) in enumerate(items_dict.items()):
            if idx >= limit:
                break
            item = {"id": f"comp_{idx}", "name": name, **specs}
            result.append(item)
        return result
    
    def get_processors(self, search="", budget=None, limit=20):
        """Get filtered processors"""
        items = self.processors
        items = self._filter_by_search(items, search)
        items = self._filter_by_budget(items, budget)
        return self._dict_to_list(items, limit)
    
    def get_graphics_cards(self, search="", budget=None, limit=20):
        """Get filtered graphics cards"""
        items = self.graphics_cards
        items = self._filter_by_search(items, search)
        items = self._filter_by_budget(items, budget)
        return self._dict_to_list(items, limit)
    
    def get_motherboards(self, search="", socket="", budget=None, limit=20):
        """Get filtered motherboards"""
        items = self.motherboards
        items = self._filter_by_search(items, search)
        if socket:
            items = {k: v for k, v in items.items() if v.get("socket", "").upper() == socket.upper()}
        items = self._filter_by_budget(items, budget)
        return self._dict_to_list(items, limit)
    
    def get_ram(self, search="", ram_type="", capacity="", budget=None, limit=20):
        """Get filtered RAM"""
        items = self.ram
        items = self._filter_by_search(items, search)
        if ram_type:
            items = {k: v for k, v in items.items() if v.get("type", "").lower() == ram_type.lower()}
        if capacity:
            try:
                cap_int = int(capacity.replace("GB", "").strip())
                items = {k: v for k, v in items.items() if v.get("capacity", 0) == cap_int}
            except:
                pass
        items = self._filter_by_budget(items, budget)
        return self._dict_to_list(items, limit)
    
    def get_storage(self, search="", storage_type="", capacity="", budget=None, limit=20):
        """Get filtered storage devices"""
        items = self.storage
        items = self._filter_by_search(items, search)
        if storage_type:
            items = {k: v for k, v in items.items() if v.get("type", "").lower() == storage_type.lower()}
        if capacity:
            try:
                cap_int = int(capacity.replace("GB", "").replace("TB", "000").strip())
                items = {k: v for k, v in items.items() if v.get("capacity", 0) == cap_int}
            except:
                pass
        items = self._filter_by_budget(items, budget)
        return self._dict_to_list(items, limit)
    
    def get_power_supplies(self, search="", wattage="", budget=None, limit=20):
        """Get filtered power supplies"""
        items = self.power_supplies
        items = self._filter_by_search(items, search)
        if wattage:
            try:
                watt_int = int(wattage.replace("W", "").strip())
                items = {k: v for k, v in items.items() if v.get("wattage", 0) == watt_int}
            except:
                pass
        items = self._filter_by_budget(items, budget)
        return self._dict_to_list(items, limit)
    
    def get_monitors(self, search="", resolution="", budget=None, limit=20):
        """Get filtered monitors"""
        items = self.monitors
        items = self._filter_by_search(items, search)
        if resolution:
            items = {k: v for k, v in items.items() if v.get("resolution", "").lower() == resolution.lower()}
        items = self._filter_by_budget(items, budget)
        return self._dict_to_list(items, limit)
    
    def get_component_by_id(self, component_id):
        """Get a component by its ID"""
        # This is a simple implementation that searches all databases
        # In production, you'd want a more efficient lookup
        all_items = {
            **self.processors,
            **self.graphics_cards,
            **self.motherboards,
            **self.ram,
            **self.storage,
            **self.power_supplies,
            **self.monitors,
            **self.cases
        }
        
        # Get item by index (ID format: comp_0, comp_1, etc.)
        try:
            if component_id.startswith("comp_"):
                idx = int(component_id.split("_")[1])
                for i, (name, specs) in enumerate(all_items.items()):
                    if i == idx:
                        return {"id": component_id, "name": name, **specs}
        except:
            pass
        
        return None
