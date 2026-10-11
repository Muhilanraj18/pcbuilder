"""
Compatibility Validation Module
Ensures CPU-Mobo socket match, RAM type compatibility, PSU sufficiency
"""

from components_db import CPUs, MOTHERBOARDs, RAMs, PSUs, GPUs


class CompatibilityValidator:
    """Validates component compatibility - NON-NEGOTIABLE rules enforced"""
    
    @staticmethod
    def check_cpu_mobo_compatibility(cpu_name, mobo_name):
        """Verify CPU socket matches motherboard socket"""
        if cpu_name not in CPUs or mobo_name not in MOTHERBOARDs:
            return False, "Invalid CPU or Motherboard"
        
        cpu_socket = CPUs[cpu_name]["socket"]
        mobo_socket = MOTHERBOARDs[mobo_name]["socket"]
        
        if cpu_socket != mobo_socket:
            return False, f"Socket mismatch: CPU needs {cpu_socket}, Mobo has {mobo_socket}"
        
        return True, "Compatible"
    
    @staticmethod
    def check_ram_compatibility(ram_name, mobo_name):
        """Verify RAM type matches motherboard (DDR4 only for MVP)"""
        if ram_name not in RAMs or mobo_name not in MOTHERBOARDs:
            return False, "Invalid RAM or Motherboard"
        
        ram_type = RAMs[ram_name]["type"]
        mobo_ram_type = MOTHERBOARDs[mobo_name]["ram_type"]
        
        if ram_type != mobo_ram_type:
            return False, f"RAM type mismatch: RAM is {ram_type}, Mobo supports {mobo_ram_type}"
        
        return True, "Compatible"
    
    @staticmethod
    def check_psu_sufficiency(cpu_name, gpu_name, psu_name):
        """Verify PSU wattage is sufficient for system power draw"""
        if cpu_name not in CPUs or gpu_name not in GPUs or psu_name not in PSUs:
            return False, "Invalid component"
        
        cpu_tdp = CPUs[cpu_name]["tdp"]
        gpu_power = GPUs[gpu_name]["power_draw"]
        
        # System power draw = CPU TDP + GPU power + overhead (150W)
        required_power = cpu_tdp + gpu_power + 150
        psu_wattage = PSUs[psu_name]["wattage"]
        
        # PSU should handle 80% of its rated wattage safely
        safe_psu_wattage = psu_wattage * 0.8
        
        if required_power > safe_psu_wattage:
            return False, f"PSU insufficient: Need {required_power}W, PSU provides safe {safe_psu_wattage:.0f}W"
        
        return True, f"PSU sufficient ({psu_wattage}W for {required_power}W load)"
    
    @staticmethod
    def validate_complete_build(cpu_name, mobo_name, ram_name, gpu_name, psu_name):
        """Comprehensive validation of entire build"""
        issues = []
        
        # Check CPU-Mobo
        is_valid, msg = CompatibilityValidator.check_cpu_mobo_compatibility(cpu_name, mobo_name)
        if not is_valid:
            issues.append(msg)
        
        # Check RAM compatibility
        is_valid, msg = CompatibilityValidator.check_ram_compatibility(ram_name, mobo_name)
        if not is_valid:
            issues.append(msg)
        
        # Check PSU
        is_valid, msg = CompatibilityValidator.check_psu_sufficiency(cpu_name, gpu_name, psu_name)
        if not is_valid:
            issues.append(msg)
        
        if issues:
            return False, issues
        
        return True, ["All components compatible"]


# Test compatibility checks
if __name__ == "__main__":
    validator = CompatibilityValidator()
    
    # Valid build
    print("=== Valid Build ===")
    print(validator.check_cpu_mobo_compatibility("Intel Core i5-12400F", "ASUS ROG STRIX B660-F"))
    print(validator.check_ram_compatibility("Corsair Vengeance LPX 16GB DDR4", "ASUS ROG STRIX B660-F"))
    print(validator.check_psu_sufficiency("Intel Core i5-12400F", "NVIDIA RTX 3050", "Corsair RM750x"))
    
    # Invalid build (socket mismatch)
    print("\n=== Invalid Build (Socket Mismatch) ===")
    print(validator.check_cpu_mobo_compatibility("Intel Core i5-12400F", "MSI B550-A PRO"))
    
    # Invalid build (RAM type mismatch) - would fail if different DDR type existed
    print("\n=== PSU Check ===")
    print(validator.check_psu_sufficiency("Intel Core i5-12400F", "NVIDIA RTX 3050", "Corsair VS 450W"))
