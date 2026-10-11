"""
Integration Test - Verify API Endpoints
Tests that all API endpoints work correctly without starting the Flask server
"""

import json
from recommendation_engine import PCBuilderAssistant
from compatibility import CompatibilityValidator


def test_build_endpoint():
    """Test /api/v1/builds endpoint logic"""
    assistant = PCBuilderAssistant()
    
    # Simulate POST /api/v1/builds
    recommendations = assistant.get_build_recommendations(
        budget=30000,
        use_case="Gaming",
        gpu_heavy=True,
        with_monitor=False
    )
    
    assert recommendations["balanced"]["build"] is not None
    assert recommendations["upgrade_friendly"]["build"] is not None
    assert "₹" in recommendations["balanced"]["explanation"] or "INR" in str(recommendations["balanced"])
    
    print("✓ /api/v1/builds endpoint test passed")
    return True


def test_cpu_mobo_validation():
    """Test /api/v1/validate/cpu-mobo endpoint logic"""
    validator = CompatibilityValidator()
    
    # Valid combo
    valid, msg = validator.check_cpu_mobo_compatibility(
        "Intel Core i5-12400F",
        "ASUS ROG STRIX B660-F"
    )
    assert valid == True
    assert "Compatible" in msg
    
    # Invalid combo
    valid, msg = validator.check_cpu_mobo_compatibility(
        "Intel Core i5-12400F",
        "MSI B550-A PRO"
    )
    assert valid == False
    assert "Socket mismatch" in msg
    
    print("✓ /api/v1/validate/cpu-mobo endpoint test passed")
    return True


def test_ram_validation():
    """Test /api/v1/validate/ram endpoint logic"""
    validator = CompatibilityValidator()
    
    # Valid RAM
    valid, msg = validator.check_ram_compatibility(
        "Corsair Vengeance LPX 16GB DDR4",
        "ASUS ROG STRIX B660-F"
    )
    assert valid == True
    
    print("✓ /api/v1/validate/ram endpoint test passed")
    return True


def test_psu_validation():
    """Test /api/v1/validate/psu endpoint logic"""
    validator = CompatibilityValidator()
    
    # Valid PSU
    valid, msg = validator.check_psu_sufficiency(
        "Intel Core i5-12400F",
        "NVIDIA RTX 3050",
        "Corsair RM750x"
    )
    assert valid == True
    assert "sufficient" in msg.lower()
    
    # Invalid PSU
    valid, msg = validator.check_psu_sufficiency(
        "AMD Ryzen 7 5700X",
        "NVIDIA RTX 4060",
        "Corsair VS 450W"
    )
    assert valid == False
    assert "insufficient" in msg.lower()
    
    print("✓ /api/v1/validate/psu endpoint test passed")
    return True


def test_complete_build_validation():
    """Test /api/v1/validate/complete-build endpoint logic"""
    validator = CompatibilityValidator()
    
    # Valid build
    valid, issues = validator.validate_complete_build(
        "Intel Core i5-12400F",
        "ASUS ROG STRIX B660-F",
        "Corsair Vengeance LPX 16GB DDR4",
        "NVIDIA RTX 3050",
        "Corsair RM750x"
    )
    assert valid == True
    assert len(issues) > 0
    
    # Invalid build
    valid, issues = validator.validate_complete_build(
        "Intel Core i5-12400F",
        "MSI B550-A PRO",
        "Corsair Vengeance LPX 16GB DDR4",
        "NVIDIA RTX 3050",
        "Corsair VS 450W"
    )
    assert valid == False
    assert len(issues) > 0
    
    print("✓ /api/v1/validate/complete-build endpoint test passed")
    return True


def test_upgrades_endpoint():
    """Test /api/v1/upgrades endpoint logic"""
    assistant = PCBuilderAssistant()
    
    current_pc = {
        "cpu": "Intel Core i3-12100F",
        "gpu": "NVIDIA GTX 1650",
        "ram": "Kingston ValueRAM 8GB DDR4",
        "psu": "Corsair VS 450W"
    }
    
    upgrades = assistant.get_upgrade_suggestions(current_pc, budget=15000)
    
    assert isinstance(upgrades, list)
    assert len(upgrades) > 0
    
    for upgrade in upgrades:
        assert "component" in upgrade
        assert "reason" in upgrade
        assert "estimated_improvement" in upgrade
    
    print("✓ /api/v1/upgrades endpoint test passed")
    return True


def main():
    """Run all integration tests"""
    print("=" * 70)
    print("PC BUILDER ASSISTANT - INTEGRATION TESTS")
    print("=" * 70)
    print()
    
    tests = [
        test_build_endpoint,
        test_cpu_mobo_validation,
        test_ram_validation,
        test_psu_validation,
        test_complete_build_validation,
        test_upgrades_endpoint
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
        except AssertionError as e:
            failed += 1
            print(f"✗ {test.__name__} FAILED: {e}")
        except Exception as e:
            failed += 1
            print(f"✗ {test.__name__} ERROR: {e}")
    
    print()
    print("=" * 70)
    print(f"Results: {passed} passed, {failed} failed")
    if failed == 0:
        print("✓ ALL INTEGRATION TESTS PASSED")
    else:
        print("✗ SOME TESTS FAILED")
    print("=" * 70)
    
    return failed == 0


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
