#!/usr/bin/env python3
"""
DEMO: PC Builder System - Complete 5-Step Pipeline

This demo shows all 7 specialized roles working together to generate
the best PC builds for different use cases and budgets.

Requirements:
    python3
    
Usage:
    python3 pc_builder_demo.py
"""

from typing import Dict
from app.services.pc_builder import (
    PCBuildOrchestrator, Component, UseCase, ComponentType,
    BuildExplainer, UpgradeAdvisor, BuildDebugger
)


# ========================== SAMPLE COMPONENT DATABASE ==========================

def get_demo_components() -> Dict[str, Component]:
    """Create a sample component database for demonstration"""
    
    components = {}
    
    # CPUs - Intel
    cpus = [
        ('i3-13100', 'i3-13100', 'Intel', 8000, 4, 8, 50),
        ('i5-13600', 'i5-13600', 'Intel', 22000, 8, 12, 65),
        ('i7-13700', 'i7-13700', 'Intel', 35000, 16, 24, 85),
    ]
    
    for model_id, model, brand, price, cores, threads, perf in cpus:
        components[model_id] = Component(
            id=model_id,
            name=f"{brand} {model}",
            brand=brand,
            model=model,
            component_type=ComponentType.CPU,
            price=price,
            specs={
                'socket': 'LGA1700',
                'cores': cores,
                'threads': threads,
                'base_ghz': 3.0,
                'boost_ghz': 5.0
            },
            performance_score=perf,
            release_year=2023
        )
    
    # CPUs - AMD
    amd_cpus = [
        ('ryzen3-5100', 'Ryzen 3 5100', 'AMD', 6500, 4, 8, 48),
        ('ryzen5-5600x', 'Ryzen 5 5600X', 'AMD', 18000, 6, 12, 70),
        ('ryzen7-7700x', 'Ryzen 7 7700X', 'AMD', 32000, 8, 16, 80),
    ]
    
    for model_id, model, brand, price, cores, threads, perf in amd_cpus:
        components[model_id] = Component(
            id=model_id,
            name=f"{brand} {model}",
            brand=brand,
            model=model,
            component_type=ComponentType.CPU,
            price=price,
            specs={
                'socket': 'AM5' if '7700' in model_id else 'AM4',
                'cores': cores,
                'threads': threads,
                'base_ghz': 3.5,
                'boost_ghz': 5.6
            },
            performance_score=perf,
            release_year=2023
        )
    
    # GPUs
    gpus = [
        ('rtx4060ti', 'RTX 4060 Ti', 'NVIDIA', 38000, 8, 68),
        ('rtx4070', 'RTX 4070', 'NVIDIA', 55000, 12, 82),
        ('rtx4070ti', 'RTX 4070 Ti', 'NVIDIA', 85000, 12, 92),
        ('rx7600', 'RX 7600', 'AMD', 25000, 8, 60),
    ]
    
    for model_id, model, brand, price, vram, perf in gpus:
        components[model_id] = Component(
            id=model_id,
            name=f"{brand} {model}",
            brand=brand,
            model=model,
            component_type=ComponentType.GPU,
            price=price,
            specs={
                'vram_gb': vram,
                'memory_type': 'GDDR6',
                'tdp': 120 if '4060' in model else 200
            },
            performance_score=perf,
            release_year=2023
        )
    
    # RAM
    ram_options = [
        ('ddr4-16gb', 'DDR4 16GB', 'Corsair', 5500, 16, 'DDR4', 60),
        ('ddr4-32gb', 'DDR4 32GB', 'Corsair', 11000, 32, 'DDR4', 70),
        ('ddr5-16gb', 'DDR5 16GB', 'Kingston', 8000, 16, 'DDR5', 75),
        ('ddr5-32gb', 'DDR5 32GB', 'Kingston', 16000, 32, 'DDR5', 85),
    ]
    
    for model_id, model, brand, price, capacity, ram_type, perf in ram_options:
        components[model_id] = Component(
            id=model_id,
            name=f"{brand} {model}",
            brand=brand,
            model=model,
            component_type=ComponentType.RAM,
            price=price,
            specs={
                'capacity_gb': capacity,
                'type': ram_type,
                'speed_mhz': 6000 if 'DDR5' in ram_type else 3600
            },
            performance_score=perf,
            release_year=2023 if 'DDR5' in ram_type else 2021
        )
    
    # SSDs
    ssd_options = [
        ('ssd500', '500GB SSD', 'Samsung', 4000, 500, 'NVMe', 65),
        ('ssd1tb', '1TB SSD', 'Samsung', 8500, 1000, 'NVMe', 75),
        ('ssd2tb', '2TB SSD', 'Samsung', 18000, 2000, 'NVMe', 80),
    ]
    
    for model_id, model, brand, price, capacity, ssd_type, perf in ssd_options:
        components[model_id] = Component(
            id=model_id,
            name=f"{brand} {model}",
            brand=brand,
            model=model,
            component_type=ComponentType.SSD,
            price=price,
            specs={
                'capacity_gb': capacity,
                'type': ssd_type,
                'form_factor': 'M.2'
            },
            performance_score=perf,
            release_year=2023
        )
    
    # PSUs
    psu_options = [
        ('psu550w', '550W Gold', 'Corsair', 5500, 550, 75),
        ('psu750w', '750W Gold', 'Corsair', 8000, 750, 80),
        ('psu1000w', '1000W Gold', 'Corsair', 12000, 1000, 85),
    ]
    
    for model_id, model, brand, price, wattage, perf in psu_options:
        components[model_id] = Component(
            id=model_id,
            name=f"{brand} {model}",
            brand=brand,
            model=model,
            component_type=ComponentType.PSU,
            price=price,
            specs={
                'wattage': wattage,
                'certification': 'Gold',
                'modular': True
            },
            performance_score=perf,
            release_year=2023
        )
    
    # Motherboards
    mobos = [
        ('b550-pro', 'B550-A PRO', 'MSI', 9000, 'AM4', ['DDR4'], 70),
        ('x670e', 'X670E HERO', 'ASUS', 28000, 'AM5', ['DDR5'], 90),
        ('z790', 'Z790-A HERO', 'ASUS', 25000, 'LGA1700', ['DDR5'], 88),
    ]
    
    for model_id, model, brand, price, socket, ram_types, perf in mobos:
        components[model_id] = Component(
            id=model_id,
            name=f"{brand} {model}",
            brand=brand,
            model=model,
            component_type=ComponentType.MOTHERBOARD,
            price=price,
            specs={
                'socket': socket,
                'supported_ram_types': ram_types,
                'form_factor': 'ATX'
            },
            performance_score=perf,
            release_year=2023
        )
    
    return components


# ========================== DEMO SCENARIOS ==========================

def demo_gaming_build(orchestrator: PCBuildOrchestrator):
    """Demo 1: Gaming build with 5-step pipeline"""
    print("\n" + "="*70)
    print("DEMO 1: Gaming Build (₹80,000 Budget)")
    print("="*70)
    
    result = orchestrator.generate_recommendations(
        budget=80000,
        use_case=UseCase.GAMING,
        top_n=2
    )
    
    print_result(result)


def demo_coding_build(orchestrator: PCBuildOrchestrator):
    """Demo 2: Coding build"""
    print("\n" + "="*70)
    print("DEMO 2: Coding Build (₹120,000 Budget)")
    print("="*70)
    
    result = orchestrator.generate_recommendations(
        budget=120000,
        use_case=UseCase.CODING,
        top_n=2
    )
    
    print_result(result)


def demo_editing_build(orchestrator: PCBuildOrchestrator):
    """Demo 3: Editing build"""
    print("\n" + "="*70)
    print("DEMO 3: Video Editing Build (₹150,000 Budget)")
    print("="*70)
    
    result = orchestrator.generate_recommendations(
        budget=150000,
        use_case=UseCase.EDITING,
        top_n=2
    )
    
    print_result(result)


def demo_budget_build(orchestrator: PCBuildOrchestrator):
    """Demo 4: Budget build"""
    print("\n" + "="*70)
    print("DEMO 4: Budget Build (₹45,000 Budget)")
    print("="*70)
    
    result = orchestrator.generate_recommendations(
        budget=45000,
        use_case=UseCase.GAMING,
        top_n=2
    )
    
    print_result(result)


# ========================== HELPER FUNCTIONS ==========================

def print_result(result: dict):
    """Print pipeline execution result nicely"""
    
    print(f"\n📊 Pipeline Status: {result['pipeline_status']}")
    print(f"   Generated: {result.get('step1_generated', 0)} candidates")
    print(f"   Scored: {result.get('step2_scored', 0)} builds")
    print(f"   Valid: {result.get('step3_valid', 0)} builds")
    print(f"   Final: {len(result['recommendations'])} recommendations\n")
    
    for idx, build in enumerate(result['recommendations'], 1):
        print_build(build, idx)


def print_build(build_data: dict, rank: int):
    """Print a single build recommendation"""
    
    print(f"\n🏆 BUILD #{rank} - Score: {build_data.get('total_score', 0):.1f}/100")
    print(f"   Total Price: ₹{build_data.get('total_price', 0):,.0f}")
    
    print(f"\n   📈 Scores:")
    print(f"      Performance:    {build_data.get('performance_score', 0):.0f}/100")
    print(f"      Value:          {build_data.get('value_score', 0):.0f}/100")
    print(f"      Compatibility:  {build_data.get('compatibility_score', 0):.0f}/100")
    print(f"      Use-Case Match: {build_data.get('usecase_match', 0):.0f}/100")
    
    components = build_data.get('components', {})
    if components:
        print(f"\n   🖥️  Components:")
        for comp_type, comp_data in components.items():
            if isinstance(comp_data, dict):
                name = comp_data.get('name', 'Unknown')
                price = comp_data.get('price', 0)
                print(f"      {comp_type:15} {name:30} ₹{price:>8,.0f}")
    
    if build_data.get('explanation'):
        print(f"\n   💬 Explanation:")
        print(f"      {build_data['explanation'][:200]}...")
    
    optimization = build_data.get('price_optimization', {})
    if optimization and optimization.get('potential_savings', 0) > 0:
        print(f"\n   💰 Price Optimization:")
        print(f"      Potential Savings: ₹{optimization['potential_savings']:,.0f}")


# ========================== MAIN ==========================

def main():
    """Run all demos"""
    
    print("""
╔══════════════════════════════════════════════════════════════════════════════╗
║           🖥️  PC BUILDER SYSTEM - COMPLETE DEMO                             ║
║                                                                              ║
║  This demo showcases all 7 specialized roles working together in a          ║
║  complete 5-step pipeline to generate the best PC builds.                   ║
║                                                                              ║
║  Pipeline:                                                                   ║
║    1. Generation - Create valid builds                                      ║
║    2. Scoring - 6 probabilistic algorithms                                  ║
║    3. Validation - Compatibility checks                                     ║
║    4. Pricing - Cost optimization                                           ║
║    5. Explanation - Friendly descriptions                                   ║
║                                                                              ║
║  7 Specialized Roles:                                                        ║
║    1. BuildGenerator - Generate valid combinations                          ║
║    2. ScoringEngine - 6-layer probabilistic scoring                         ║
║    3. BuildValidator - Compatibility validation                             ║
║    4. PriceOptimizer - Find best sources                                    ║
║    5. BuildExplainer - Friendly explanations                                ║
║    6. UpgradeAdvisor - Recommend improvements                               ║
║    7. BuildDebugger - Analyze issues                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
    """)
    
    # Initialize
    print("⚙️  Initializing PC Builder System...")
    components_db = get_demo_components()
    print(f"   ✓ Loaded {len(components_db)} components")
    
    orchestrator = PCBuildOrchestrator(components_db)
    print(f"   ✓ Orchestrator ready with all 7 roles\n")
    
    # Run demos
    try:
        demo_gaming_build(orchestrator)
        demo_coding_build(orchestrator)
        demo_editing_build(orchestrator)
        demo_budget_build(orchestrator)
        
        print("\n" + "="*70)
        print("✅ All demos completed successfully!")
        print("="*70 + "\n")
        
    except Exception as e:
        print(f"❌ Error during demo: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
