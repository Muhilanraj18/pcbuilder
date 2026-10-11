"""
Component Reference Database
Generated from computer_prices_all.csv
Organized by component type for easy lookups
"""

import pandas as pd
from typing import Dict, List, Tuple

# Read the CSV data
csv_path = "computer_prices_all.csv"
df = pd.read_csv(csv_path)

class ComponentReferenceDB:
    """Organized component database with search and filter capabilities"""
    
    def __init__(self):
        self.df = df
        self.processors = self._extract_processors()
        self.graphics_cards = self._extract_graphics_cards()
        self.RAM_configs = self._extract_ram_configs()
        self.storage_configs = self._extract_storage_configs()
        self.displays = self._extract_displays()
        self.systems = self._extract_systems()
        
    def _extract_processors(self) -> Dict[str, Dict]:
        """Extract unique processors with specifications"""
        processors = {}
        cpu_cols = ['cpu_brand', 'cpu_model', 'cpu_tier', 'cpu_cores', 'cpu_threads', 'cpu_base_ghz', 'cpu_boost_ghz']
        
        for _, row in self.df[cpu_cols].drop_duplicates().iterrows():
            key = f"{row['cpu_brand']} {row['cpu_model']}"
            processors[key] = {
                'brand': row['cpu_brand'],
                'model': row['cpu_model'],
                'tier': row['cpu_tier'],
                'cores': int(row['cpu_cores']),
                'threads': int(row['cpu_threads']),
                'base_ghz': float(row['cpu_base_ghz']),
                'boost_ghz': float(row['cpu_boost_ghz']),
                'avg_price': self._get_avg_price_for_cpu(key)
            }
        return processors
    
    def _extract_graphics_cards(self) -> Dict[str, Dict]:
        """Extract unique GPU configurations"""
        gpus = {}
        gpu_cols = ['gpu_brand', 'gpu_model', 'gpu_tier', 'vram_gb']
        
        for _, row in self.df[gpu_cols].drop_duplicates().iterrows():
            key = f"{row['gpu_brand']} {row['gpu_model']}"
            gpus[key] = {
                'brand': row['gpu_brand'],
                'model': row['gpu_model'],
                'tier': row['gpu_tier'],
                'vram_gb': int(row['vram_gb']),
                'avg_price': self._get_avg_price_for_gpu(key)
            }
        return gpus
    
    def _extract_ram_configs(self) -> Dict[str, Dict]:
        """Extract RAM configurations"""
        ram_configs = {}
        ram_cols = ['ram_gb', 'storage_type']
        
        for _, row in self.df[ram_cols].drop_duplicates().iterrows():
            key = f"{int(row['ram_gb'])}GB"
            if key not in ram_configs:
                ram_configs[key] = {
                    'capacity_gb': int(row['ram_gb']),
                    'common_configs': []
                }
                ram_configs[key]['common_configs'].append({
                    'storage_type': row['storage_type'],
                    'avg_price': self._get_avg_price_for_ram(int(row['ram_gb']))
                })
        return ram_configs
    
    def _extract_storage_configs(self) -> Dict[str, Dict]:
        """Extract storage configurations"""
        storage_configs = {}
        storage_cols = ['storage_type', 'storage_gb', 'storage_drive_count']
        
        for _, row in self.df[storage_cols].drop_duplicates().iterrows():
            key = f"{row['storage_type']} {int(row['storage_gb'])}GB"
            storage_configs[key] = {
                'type': row['storage_type'],
                'capacity_gb': int(row['storage_gb']),
                'drive_count': int(row['storage_drive_count']),
                'avg_price': self._get_avg_price_for_storage(row['storage_type'], int(row['storage_gb']))
            }
        return storage_configs
    
    def _extract_displays(self) -> Dict[str, Dict]:
        """Extract display specifications"""
        displays = {}
        display_cols = ['display_type', 'display_size_in', 'resolution', 'refresh_hz']
        
        for _, row in self.df[display_cols].drop_duplicates().iterrows():
            key = f"{row['display_type']} {row['display_size_in']}in"
            displays[key] = {
                'type': row['display_type'],
                'size_inches': float(row['display_size_in']),
                'resolution': row['resolution'],
                'refresh_hz': int(row['refresh_hz']),
                'avg_price': self._get_avg_price_for_display(row['display_type'], float(row['display_size_in']))
            }
        return displays
    
    def _extract_systems(self) -> Dict[str, Dict]:
        """Extract complete system configurations"""
        systems = {}
        
        for idx, row in self.df.iterrows():
            key = f"{row['brand']} {row['model']}"
            systems[key] = {
                'device_type': row['device_type'],
                'brand': row['brand'],
                'model': row['model'],
                'release_year': int(row['release_year']),
                'price': float(row['price']),
                'os': row['os'],
                'form_factor': row['form_factor'],
                'cpu': f"{row['cpu_brand']} {row['cpu_model']}",
                'gpu': f"{row['gpu_brand']} {row['gpu_model']}",
                'ram_gb': int(row['ram_gb']),
                'storage': f"{row['storage_type']} {int(row['storage_gb'])}GB x{int(row['storage_drive_count'])}",
                'display': f"{row['display_type']} {row['display_size_in']}in {row['resolution']} {int(row['refresh_hz'])}Hz",
                'weight_kg': float(row['weight_kg']),
                'warranty_months': int(row['warranty_months'])
            }
        return systems
    
    # Helper price functions
    def _get_avg_price_for_cpu(self, cpu_name: str) -> float:
        matching = self.df[self.df['cpu_model'].str.contains(cpu_name.split()[-1], na=False)]
        return matching['price'].mean() if len(matching) > 0 else 0
    
    def _get_avg_price_for_gpu(self, gpu_name: str) -> float:
        matching = self.df[self.df['gpu_model'] == gpu_name.split()[-1]]
        return matching['price'].mean() if len(matching) > 0 else 0
    
    def _get_avg_price_for_ram(self, ram_gb: int) -> float:
        matching = self.df[self.df['ram_gb'] == ram_gb]
        return matching['price'].mean() if len(matching) > 0 else 0
    
    def _get_avg_price_for_storage(self, storage_type: str, storage_gb: int) -> float:
        matching = self.df[(self.df['storage_type'] == storage_type) & (self.df['storage_gb'] == storage_gb)]
        return matching['price'].mean() if len(matching) > 0 else 0
    
    def _get_avg_price_for_display(self, display_type: str, size: float) -> float:
        matching = self.df[(self.df['display_type'] == display_type) & (self.df['display_size_in'] == size)]
        return matching['price'].mean() if len(matching) > 0 else 0
    
    # Search methods
    def search_processor(self, brand: str = None, tier: int = None) -> Dict:
        """Search for processors by brand or tier"""
        results = {}
        for name, specs in self.processors.items():
            if brand and brand.lower() not in specs['brand'].lower():
                continue
            if tier and specs['tier'] != tier:
                continue
            results[name] = specs
        return results
    
    def search_gpu(self, brand: str = None, min_vram: int = None) -> Dict:
        """Search for GPUs by brand or VRAM"""
        results = {}
        for name, specs in self.graphics_cards.items():
            if brand and brand.lower() not in specs['brand'].lower():
                continue
            if min_vram and specs['vram_gb'] < min_vram:
                continue
            results[name] = specs
        return results
    
    def search_systems(self, device_type: str = None, brand: str = None, min_price: float = None, max_price: float = None) -> Dict:
        """Search for complete systems"""
        results = {}
        for name, specs in self.systems.items():
            if device_type and specs['device_type'] != device_type:
                continue
            if brand and brand.lower() not in specs['brand'].lower():
                continue
            if min_price and specs['price'] < min_price:
                continue
            if max_price and specs['price'] > max_price:
                continue
            results[name] = specs
        return results
    
    def get_price_range(self, component_type: str) -> Tuple[float, float]:
        """Get min and max prices for a component type"""
        if component_type == 'processor':
            prices = [spec['avg_price'] for spec in self.processors.values()]
        elif component_type == 'gpu':
            prices = [spec['avg_price'] for spec in self.graphics_cards.values()]
        elif component_type == 'system':
            prices = [spec['price'] for spec in self.systems.values()]
        else:
            return (0, 0)
        
        return (min(prices), max(prices)) if prices else (0, 0)
    
    def get_statistics(self) -> Dict:
        """Get overall statistics"""
        return {
            'total_systems': len(self.systems),
            'total_unique_processors': len(self.processors),
            'total_unique_gpus': len(self.graphics_cards),
            'total_unique_ram_configs': len(self.RAM_configs),
            'total_unique_storage_configs': len(self.storage_configs),
            'total_unique_displays': len(self.displays),
            'price_range_systems': self.get_price_range('system'),
            'average_system_price': self.df['price'].mean(),
            'brands': self.df['brand'].unique().tolist(),
            'device_types': self.df['device_type'].unique().tolist(),
        }


# Initialize the database
db = ComponentReferenceDB()


if __name__ == "__main__":
    # Print statistics
    print("=" * 60)
    print("COMPONENT REFERENCE DATABASE")
    print("=" * 60)
    
    stats = db.get_statistics()
    print(f"\n📊 STATISTICS:")
    print(f"  Total Systems: {stats['total_systems']}")
    print(f"  Unique Processors: {stats['total_unique_processors']}")
    print(f"  Unique GPUs: {stats['total_unique_gpus']}")
    print(f"  Unique RAM Configs: {stats['total_unique_ram_configs']}")
    print(f"  Unique Storage Configs: {stats['total_unique_storage_configs']}")
    print(f"  Unique Displays: {stats['total_unique_displays']}")
    print(f"  Brands Available: {len(stats['brands'])}")
    print(f"  Device Types: {stats['device_types']}")
    print(f"  Avg System Price: ₹{stats['average_system_price']:.2f}")
    print(f"  Price Range: ₹{stats['price_range_systems'][0]:.2f} - ₹{stats['price_range_systems'][1]:.2f}")
    
    print(f"\n🔧 SAMPLE PROCESSORS:")
    for i, (name, specs) in enumerate(list(db.processors.items())[:5]):
        print(f"  {name}: {specs['cores']}C/{specs['threads']}T @ {specs['boost_ghz']}GHz")
    
    print(f"\n🎮 SAMPLE GPUs:")
    for i, (name, specs) in enumerate(list(db.graphics_cards.items())[:5]):
        print(f"  {name}: {specs['vram_gb']}GB VRAM (Tier {specs['tier']})")
    
    print(f"\n💾 SAMPLE STORAGE CONFIGS:")
    for i, (name, specs) in enumerate(list(db.storage_configs.items())[:5]):
        print(f"  {name}")
    
    print("\n" + "=" * 60)
    print("Database loaded successfully!")
    print("=" * 60)
