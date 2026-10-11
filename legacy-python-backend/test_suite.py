"""
Comprehensive Test Suite for PC Builder Assistant
Tests compatibility, build generation, and upgrade suggestions
"""

import unittest
from recommendation_engine import PCBuilderAssistant, BuildRecommender
from compatibility import CompatibilityValidator
from components_db import CPUs, MOTHERBOARDs, RAMs, GPUs, PSUs


class TestCompatibilityValidator(unittest.TestCase):
    """Test compatibility validation rules"""
    
    def setUp(self):
        self.validator = CompatibilityValidator()
    
    def test_valid_cpu_mobo_compatibility(self):
        """Test valid CPU-Mobo socket match"""
        is_valid, msg = self.validator.check_cpu_mobo_compatibility(
            "Intel Core i5-12400F",
            "ASUS ROG STRIX B660-F"
        )
        self.assertTrue(is_valid)
        self.assertEqual(msg, "Compatible")
    
    def test_invalid_cpu_mobo_socket_mismatch(self):
        """Test invalid CPU-Mobo socket mismatch"""
        is_valid, msg = self.validator.check_cpu_mobo_compatibility(
            "Intel Core i5-12400F",
            "MSI B550-A PRO"  # AM4 socket, not LGA1700
        )
        self.assertFalse(is_valid)
        self.assertIn("Socket mismatch", msg)
    
    def test_valid_ram_compatibility(self):
        """Test valid RAM-Mobo compatibility"""
        is_valid, msg = self.validator.check_ram_compatibility(
            "Corsair Vengeance LPX 16GB DDR4",
            "ASUS ROG STRIX B660-F"
        )
        self.assertTrue(is_valid)
    
    def test_valid_psu_sufficiency(self):
        """Test PSU has enough wattage"""
        is_valid, msg = self.validator.check_psu_sufficiency(
            "Intel Core i5-12400F",
            "NVIDIA RTX 3050",
            "Corsair RM750x"
        )
        self.assertTrue(is_valid)
    
    def test_invalid_psu_insufficient(self):
        """Test PSU is insufficient"""
        # i5: 65W + RTX 3050: 130W + overhead 150W = 345W required
        # 450W PSU * 0.8 = 360W safe capacity
        # This is actually sufficient, so let's use a more demanding combo
        # i5: 65W + RTX 4060: 140W + overhead 150W = 355W
        # VS 450W still works, so use a more powerful combo:
        is_valid, msg = self.validator.check_psu_sufficiency(
            "AMD Ryzen 7 5700X",  # 105W
            "NVIDIA RTX 4060",     # 140W
            "Corsair VS 450W"      # 450W * 0.8 = 360W safe - needs 105+140+150=395W - should fail
        )
        # 105 + 140 + 150 = 395W needed > 360W safe = insufficient
        self.assertFalse(is_valid)
    
    def test_complete_build_validation_valid(self):
        """Test complete valid build"""
        is_valid, issues = self.validator.validate_complete_build(
            "Intel Core i5-12400F",
            "ASUS ROG STRIX B660-F",
            "Corsair Vengeance LPX 16GB DDR4",
            "NVIDIA RTX 3050",
            "Corsair RM750x"
        )
        self.assertTrue(is_valid)
    
    def test_complete_build_validation_invalid(self):
        """Test complete invalid build (socket + PSU mismatch)"""
        is_valid, issues = self.validator.validate_complete_build(
            "Intel Core i5-12400F",  # LGA1700
            "MSI B550-A PRO",  # AM4 - socket mismatch
            "Corsair Vengeance LPX 16GB DDR4",
            "NVIDIA RTX 3050",
            "Corsair VS 450W"  # PSU insufficient
        )
        self.assertFalse(is_valid)
        self.assertGreater(len(issues), 0)


class TestBuildGeneration(unittest.TestCase):
    """Test build generation algorithms"""
    
    def setUp(self):
        self.assistant = PCBuilderAssistant()
    
    def test_balanced_build_30k_gaming(self):
        """Test 30k gaming build generation"""
        recommendations = self.assistant.get_build_recommendations(
            budget=30000,
            with_monitor=False,
            use_case="Gaming",
            gpu_heavy=True
        )
        
        # Check balanced build exists
        self.assertIsNotNone(recommendations["balanced"]["build"])
        build = recommendations["balanced"]["build"]
        
        # Check total price within budget
        self.assertLessEqual(build["total_price"], 30000)
        
        # Check all components present
        required_keys = ["cpu", "mobo", "ram", "storage", "gpu", "psu", "case"]
        for key in required_keys:
            self.assertIn(key, build)
    
    def test_upgrade_friendly_build_40k(self):
        """Test 40k upgrade-friendly build"""
        recommendations = self.assistant.get_build_recommendations(
            budget=40000,
            with_monitor=False,
            use_case="Gaming"
        )
        
        upgrade_friendly = recommendations["upgrade_friendly"]["build"]
        self.assertIsNotNone(upgrade_friendly)
        self.assertLessEqual(upgrade_friendly["total_price"], 40000)
    
    def test_build_with_monitor(self):
        """Test build generation with monitor"""
        recommendations = self.assistant.get_build_recommendations(
            budget=50000,
            with_monitor=True,
            use_case="Coding"
        )
        
        balanced = recommendations["balanced"]["build"]
        if balanced:
            # Monitor should be included
            self.assertIn("monitor", balanced)
    
    def test_build_respects_use_case(self):
        """Test that builds respect use case preferences"""
        gaming_build = self.assistant.get_build_recommendations(
            budget=35000,
            use_case="Gaming"
        )
        
        coding_build = self.assistant.get_build_recommendations(
            budget=35000,
            use_case="Coding"
        )
        
        # Both should generate valid builds
        self.assertIsNotNone(gaming_build["balanced"]["build"])
        self.assertIsNotNone(coding_build["balanced"]["build"])


class TestUpgradeSuggestions(unittest.TestCase):
    """Test upgrade suggestion logic"""
    
    def setUp(self):
        self.assistant = PCBuilderAssistant()
    
    def test_cpu_upgrade_suggestion(self):
        """Test CPU upgrade is suggested for budget CPUs"""
        current_pc = {
            "cpu": "Intel Core i3-12100F",  # Budget CPU
            "mobo": "MSI B660M DS3H",
            "gpu": "NVIDIA GTX 1650",
            "ram": "Kingston ValueRAM 8GB DDR4",
            "psu": "Corsair VS 450W"
        }
        
        upgrades = self.assistant.get_upgrade_suggestions(current_pc, 15000)
        
        # Should suggest CPU upgrade
        cpu_upgrades = [u for u in upgrades if u["component"] == "CPU"]
        self.assertGreater(len(cpu_upgrades), 0)
    
    def test_ram_upgrade_suggestion(self):
        """Test RAM upgrade is suggested for 8GB"""
        current_pc = {
            "cpu": "Intel Core i5-12400F",
            "mobo": "ASUS ROG STRIX B660-F",
            "gpu": "NVIDIA RTX 3050",
            "ram": "Kingston ValueRAM 8GB DDR4",  # Only 8GB
            "psu": "Corsair RM750x"
        }
        
        upgrades = self.assistant.get_upgrade_suggestions(current_pc, 10000)
        
        # Should suggest RAM upgrade
        ram_upgrades = [u for u in upgrades if u["component"] == "RAM"]
        self.assertGreater(len(ram_upgrades), 0)
    
    def test_gpu_upgrade_suggestion(self):
        """Test GPU upgrade is suggested for entry-level GPUs"""
        current_pc = {
            "cpu": "Intel Core i5-12400F",
            "gpu": "NVIDIA GTX 1650",  # Entry-level
            "ram": "Kingston ValueRAM 8GB DDR4",
            "psu": "Corsair VS 450W"
        }
        
        upgrades = self.assistant.get_upgrade_suggestions(current_pc, 15000)
        
        # Should suggest GPU upgrade
        gpu_upgrades = [u for u in upgrades if "GPU" in u["component"]]
        self.assertGreater(len(gpu_upgrades), 0)


class TestComponentConsistency(unittest.TestCase):
    """Test that generated builds use real components"""
    
    def setUp(self):
        self.assistant = PCBuilderAssistant()
    
    def test_all_cpus_valid(self):
        """Verify all CPUs in database are valid"""
        for cpu_name in CPUs:
            cpu = CPUs[cpu_name]
            self.assertIn("price", cpu)
            self.assertIn("socket", cpu)
            self.assertIn("cores", cpu)
            self.assertGreater(cpu["price"], 0)
    
    def test_all_mobos_valid(self):
        """Verify all motherboards in database are valid"""
        for mobo_name in MOTHERBOARDs:
            mobo = MOTHERBOARDs[mobo_name]
            self.assertIn("price", mobo)
            self.assertIn("socket", mobo)
            self.assertIn("ram_type", mobo)
            self.assertGreater(mobo["price"], 0)
    
    def test_budget_allocation(self):
        """Test that budget allocation is reasonable"""
        build = self.assistant.get_build_recommendations(
            budget=30000,
            with_monitor=False
        )
        
        balanced = build["balanced"]["build"]
        if balanced:
            total = balanced["total_price"]
            self.assertLessEqual(total, 30000)
            # Build should use most of budget (at least 50%)
            self.assertGreater(total, 30000 * 0.5)


class TestErrorHandling(unittest.TestCase):
    """Test error handling and edge cases"""
    
    def test_invalid_component_names(self):
        """Test handling of invalid component names"""
        validator = CompatibilityValidator()
        
        is_valid, msg = validator.check_cpu_mobo_compatibility(
            "Invalid CPU",
            "Invalid Mobo"
        )
        self.assertFalse(is_valid)
    
    def test_zero_budget(self):
        """Test handling of zero budget"""
        assistant = PCBuilderAssistant()
        
        recs = assistant.get_build_recommendations(0)
        
        # Should handle gracefully
        self.assertIsNone(recs["balanced"]["build"])
    
    def test_negative_budget(self):
        """Test handling of negative budget"""
        assistant = PCBuilderAssistant()
        
        recs = assistant.get_build_recommendations(-5000)
        
        self.assertIsNone(recs["balanced"]["build"])


def run_tests():
    """Run all tests"""
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    suite.addTests(loader.loadTestsFromTestCase(TestCompatibilityValidator))
    suite.addTests(loader.loadTestsFromTestCase(TestBuildGeneration))
    suite.addTests(loader.loadTestsFromTestCase(TestUpgradeSuggestions))
    suite.addTests(loader.loadTestsFromTestCase(TestComponentConsistency))
    suite.addTests(loader.loadTestsFromTestCase(TestErrorHandling))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    return result.wasSuccessful()


if __name__ == "__main__":
    print("=" * 70)
    print("PC BUILDER ASSISTANT - TEST SUITE")
    print("=" * 70)
    success = run_tests()
    print("\n" + "=" * 70)
    if success:
        print("✓ ALL TESTS PASSED")
    else:
        print("✗ SOME TESTS FAILED")
    print("=" * 70)
