"""
Component Reference Data Summary
Quick reference for all components organized from computer_prices_all.csv
"""

REFERENCE_DATA = {
    "dataset_stats": {
        "total_systems": 100,
        "date_generated": "2025-04-03",
        "csv_source": "computer_prices_all.csv"
    },
    
    "processors_summary": {
        "total_unique": 68,
        "by_brand": {
            "Intel": 35,
            "AMD": 25,
            "Apple": 8
        },
        "price_ranges": {
            "budget": {"min": 980, "max": 1410, "labels": ["i3", "Ryzen 3", "M2"]},
            "mid": {"min": 1251, "max": 1879, "labels": ["i5", "Ryzen 5", "M2 Pro"]},
            "high": {"min": 1641, "max": 2681, "labels": ["i7", "Ryzen 7", "M1 Pro"]},
            "premium": {"min": 2953, "max": 3546, "labels": ["i9", "Ryzen 9", "M1 Max", "M3 Pro"]}
        }
    },
    
    "gpu_summary": {
        "total_unique": 32,
        "by_brand": {
            "NVIDIA": 18,
            "AMD": 8,
            "Apple": 6
        },
        "popular_models": {
            "RTX 30 80": "₹1500-2500",
            "RTX 40 60": "₹1200-1800",
            "RTX 40 80": "₹2000-2500",
            "RX 7000 60": "₹1300-1700",
            "RX 7000 80": "₹2000-2500",
            "Apple Integrated": "Tier 1-6"
        }
    },
    
    "ram_summary": {
        "total_variants": 8,
        "capacities": {
            "8GB": {"type": "Entry", "price": "₹1500-1700"},
            "16GB": {"type": "Standard", "price": "₹1800-2000"},
            "32GB": {"type": "Gaming", "price": "₹2000-2200"},
            "64GB": {"type": "Creator", "price": "₹2200-2500"},
            "96GB": {"type": "Workstation", "price": "₹2500-3000"},
            "128GB": {"type": "Premium Workstation", "price": "₹3000-3200"},
            "144GB": {"type": "Ultra Premium", "price": "₹3500+"}
        }
    },
    
    "storage_summary": {
        "types": {
            "SSD": {"speeds": "500-700 MB/s", "capacities": [256, 512, 1024, 2048], "use": "Gaming/Office"},
            "NVMe": {"speeds": "2000-3500 MB/s", "capacities": [256, 512, 1024, 2048], "use": "Gaming/Creator"},
            "HDD": {"speeds": "150-200 MB/s", "capacities": [512, 1024], "use": "Backup/Storage"},
            "Hybrid": {"speeds": "Combined", "capacities": [1024, 2048], "use": "Mobile/All-in-one"}
        }
    },
    
    "display_summary": {
        "resolutions": {
            "1920x1080 (1080p)": {
                "type": "Full HD",
                "device_sizes": [13.3, 15.6, 17.3, 24, 27, 32],
                "refresh_rates": [60, 90, 120, 144, 165, 240],
                "typical_price": 1200,
                "use_case": "Office/Gaming"
            },
            "2560x1440 (1440p)": {
                "type": "QHD",
                "device_sizes": [15.6, 16, 27, 32, 34],
                "refresh_rates": [60, 90, 120, 144, 165],
                "typical_price": 2000,
                "use_case": "Gaming/Creator"
            },
            "2560x1600 (WQHD)": {
                "type": "Wide QHD",
                "device_sizes": [14, 15.6, 16],
                "refresh_rates": [60, 90, 120, 240],
                "typical_price": 2500,
                "use_case": "Creator/Gaming"
            },
            "3440x1440 (Ultrawide)": {
                "type": "Ultrawide",
                "device_sizes": [32, 34],
                "refresh_rates": [60, 120],
                "typical_price": 2200,
                "use_case": "Productivity/Gaming"
            },
            "3840x2160 (4K)": {
                "type": "Ultra HD",
                "device_sizes": [14, 15.6, 17.3, 24, 32],
                "refresh_rates": [60, 90, 240],
                "typical_price": 3150,
                "use_case": "Professional/Creator"
            }
        }
    },
    
    "brands_summary": {
        "laptop_brands": ["Apple", "ASUS", "Acer", "Dell", "HP", "Lenovo", "MSI", "Samsung"],
        "desktop_brands": ["ASUS", "Acer", "Apple", "Dell", "HP", "Lenovo", "MSI", "Samsung"],
        "cpu_manufacturers": ["Intel", "AMD", "Apple"],
        "gpu_manufacturers": ["NVIDIA", "AMD", "Apple"]
    },
    
    "system_distribution": {
        "total": 100,
        "by_type": {
            "Laptop": 60,
            "Desktop": 40
        },
        "by_os": {
            "Windows": 70,
            "macOS": 15,
            "Linux": 10,
            "ChromeOS": 5
        },
        "by_price_range": {
            "Budget (₹980-1500)": 25,
            "Mid-Range (₹1500-2500)": 45,
            "Premium (₹2500-3500)": 25,
            "Ultra Premium (₹3500+)": 5
        }
    },
    
    "processor_reference": {
        "Intel": {
            "i3": {"cores": "4-8", "threads": "8-16", "tier": 1, "price_range": "₹980-1410"},
            "i5": {"cores": "8-12", "threads": "16-22", "tier": 2, "price_range": "₹1123-1503"},
            "i7": {"cores": "12-18", "threads": "24-36", "tier": 4, "price_range": "₹1507-2560"},
            "i9": {"cores": "26", "threads": "52", "tier": 6, "price_range": "₹2953-3039"}
        },
        "AMD": {
            "Ryzen 3": {"cores": "4", "threads": "8", "tier": 1, "price_range": "₹1653"},
            "Ryzen 5": {"cores": "6-8", "threads": "10-16", "tier": 2, "price_range": "₹1251-1879"},
            "Ryzen 7": {"cores": "12-18", "threads": "24-36", "tier": 4, "price_range": "₹1641-2681"},
            "Ryzen 9": {"cores": "24", "threads": "48", "tier": 6, "price_range": "₹3173"}
        },
        "Apple": {
            "M1": {"cores": "8-16", "threads": "16-26", "tier": 5, "price_range": "₹2530-3546"},
            "M2": {"cores": "6-8", "threads": "6-8", "tier": 2, "price_range": "₹1609-2139"},
            "M3": {"cores": "18", "threads": "18", "tier": 5, "price_range": "₹3421"}
        }
    },
    
    "recommendations": {
        "gaming_laptop_budget": "RTX 30 60 + Ryzen 5 + 16GB + SSD",
        "gaming_laptop_mid": "RTX 30 80 + i7 + 32GB + NVMe",
        "gaming_laptop_high": "RTX 40 80 + i9 + 64GB + NVMe",
        "content_creation": "RTX 40 90 + i9/Ryzen 9 + 96-128GB + NVMe",
        "office_work": "i5/Ryzen 5 + 16GB + SSD",
        "3d_rendering": "RTX 30 90 Ti + i9 Xeon + 128GB + Multi-NVMe"
    }
}

# Quick access functions
def get_processor_specs(brand: str, model: str) -> dict:
    """Get processor specifications"""
    if brand in REFERENCE_DATA["processor_reference"]:
        return REFERENCE_DATA["processor_reference"][brand].get(model, {})
    return {}

def get_price_category(price: float) -> str:
    """Get price category from amount"""
    ranges = [
        (980, 1500, "Budget"),
        (1500, 2500, "Mid-Range"),
        (2500, 3500, "Premium"),
        (3500, 10000, "Ultra Premium")
    ]
    for min_p, max_p, label in ranges:
        if min_p <= price < max_p:
            return label
    return "Ultra Premium"

def get_display_specs(resolution: str) -> dict:
    """Get display specifications"""
    displays = REFERENCE_DATA["display_summary"]["resolutions"]
    return displays.get(resolution, {})

if __name__ == "__main__":
    import json
    
    print("=" * 70)
    print("COMPONENT REFERENCE DATA SUMMARY")
    print("=" * 70)
    print(f"\n📊 DATASET STATISTICS")
    print(f"  • Total Systems: {REFERENCE_DATA['system_distribution']['total']}")
    print(f"  • Unique Processors: {REFERENCE_DATA['processors_summary']['total_unique']}")
    print(f"  • Unique GPUs: {REFERENCE_DATA['gpu_summary']['total_unique']}")
    
    print(f"\n🏢 BRANDS AVAILABLE")
    print(f"  • CPU Brands: {', '.join(REFERENCE_DATA['brands_summary']['cpu_manufacturers'])}")
    print(f"  • GPU Brands: {', '.join(REFERENCE_DATA['brands_summary']['gpu_manufacturers'])}")
    print(f"  • System Brands: {', '.join(REFERENCE_DATA['brands_summary']['laptop_brands'][:4])}...")
    
    print(f"\n💻 SYSTEM DISTRIBUTION")
    for key, value in REFERENCE_DATA['system_distribution']['by_type'].items():
        print(f"  • {key}: {value} systems")
    
    print(f"\n💰 PRICE DISTRIBUTION")
    for range_label, count in REFERENCE_DATA['system_distribution']['by_price_range'].items():
        print(f"  • {range_label}: {count} systems")
    
    print(f"\n🎮 POPULAR GPUs")
    for gpu, price in list(REFERENCE_DATA['gpu_summary']['popular_models'].items())[:5]:
        print(f"  • {gpu}: {price}")
    
    print(f"\n💾 STORAGE TYPES")
    for storage_type, specs in REFERENCE_DATA['storage_summary']['types'].items():
        print(f"  • {storage_type}: {specs['speeds']} - {specs['use']}")
    
    print("\n" + "=" * 70)
    print("✅ Reference data loaded successfully!")
    print("=" * 70)
    
    # Print JSON format for easy import
    print("\n📋 JSON Export Available")
    print("Location: component_reference.json")
    print("Includes full component reference data organized by category")
