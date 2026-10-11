"""
API Endpoints & Integration Layer
RESTful API for the PC Builder Assistant
With component-specific routes and web scraping support
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from recommendation_engine import PCBuilderAssistant
from compatibility import CompatibilityValidator
from components_db import ComponentDatabase
from live_pricing_engine import run_build as run_live_build
from live_pricing_engine import run_component as run_live_component
from live_pricing_engine import run_controller as run_scraper_controller
import requests
from bs4 import BeautifulSoup
import logging
from pathlib import Path


def _load_env_file(file_name: str = ".env.local") -> None:
    """Load simple KEY=VALUE pairs from a local env file if present."""
    env_path = Path(__file__).resolve().parent / file_name
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_env_file()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend
assistant = PCBuilderAssistant()
component_db = ComponentDatabase()


# ===== BUILD GENERATION ENDPOINTS =====

@app.route("/api/v1/builds", methods=["POST"])
def get_builds():
    """
    Generate Balanced & Upgrade-Friendly PC builds
    
    Request Body:
    {
        "budget": 30000,
        "with_monitor": false,
        "use_case": "Gaming" | "Coding" | "Graphics",
        "gpu_heavy": true
    }
    
    Response: Both builds with full specs and explanations
    """
    try:
        data = request.json
        budget = data.get("budget")
        with_monitor = data.get("with_monitor", False)
        use_case = data.get("use_case")
        gpu_heavy = data.get("gpu_heavy", False)
        
        if not budget or budget <= 0:
            return jsonify({"error": "Invalid budget"}), 400
        
        recommendations = assistant.get_build_recommendations(
            budget=budget,
            with_monitor=with_monitor,
            use_case=use_case,
            gpu_heavy=gpu_heavy
        )
        
        return jsonify({
            "status": "success",
            "budget": budget,
            "builds": {
                "balanced": recommendations["balanced"]["build"],
                "upgrade_friendly": recommendations["upgrade_friendly"]["build"]
            },
            "explanations": {
                "balanced": recommendations["balanced"]["explanation"],
                "upgrade_friendly": recommendations["upgrade_friendly"]["explanation"]
            }
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===== LIVE PRICING ENGINE ENDPOINTS =====

@app.route("/api/v1/live-pricing/component", methods=["POST"])
def live_pricing_component():
    """
    Fetch and analyze a single component across all supported sources in parallel.

    Request:
    {
      "component": "NVIDIA RTX 4060",
      "component_type": "gpu"
    }
    """
    try:
        data = request.json or {}
        component = data.get("component")
        component_type = data.get("component_type")

        if not component:
            return jsonify({"error": "Missing component name"}), 400

        result = run_live_component(component_name=component, component_type=component_type)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Live pricing component error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/live-pricing/build", methods=["POST"])
def live_pricing_build():
    """
    Fetch and analyze full build components in parallel and auto-update live cache.

    Request:
    {
      "configuration": {
        "cpu": "Intel Core i5-12400F",
        "gpu": "NVIDIA RTX 4060",
        "ram": "Corsair Vengeance LPX 16GB DDR4",
        "motherboard": "ASUS ROG STRIX B660-F",
        "storage": "Samsung 970 EVO Plus 1TB",
        "psu": "Corsair RM750x"
      },
      "auto_update": true
    }
    """
    try:
        data = request.json or {}
        configuration = data.get("configuration") or {}
        auto_update = data.get("auto_update", True)

        if not isinstance(configuration, dict) or not configuration:
            return jsonify({"error": "configuration must be a non-empty object"}), 400

        result = run_live_build(configuration=configuration, auto_update=auto_update)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Live pricing build error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/live-pricing/controller", methods=["POST"])
def live_pricing_controller():
    """
    Scraping controller endpoint for query-generation + clean extraction JSON.

    Request:
    {
      "component": "RTX 4060"
    }
    """
    try:
        data = request.json or {}
        component = data.get("component")
        if not component:
            return jsonify({"error": "Missing component"}), 400

        result = run_scraper_controller(component_name=component)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Live pricing controller error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ===== COMPATIBILITY CHECK ENDPOINTS =====

@app.route("/api/v1/validate/cpu-mobo", methods=["POST"])
def validate_cpu_mobo():
    """
    Check CPU and Motherboard compatibility
    
    Request: {"cpu": "Intel Core i5-12400F", "mobo": "ASUS ROG STRIX B660-F"}
    """
    try:
        data = request.json
        cpu = data.get("cpu")
        mobo = data.get("mobo")
        
        is_valid, message = CompatibilityValidator.check_cpu_mobo_compatibility(cpu, mobo)
        
        return jsonify({
            "compatible": is_valid,
            "message": message
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/validate/ram", methods=["POST"])
def validate_ram():
    """
    Check RAM and Motherboard compatibility
    
    Request: {"ram": "Corsair Vengeance LPX 16GB DDR4", "mobo": "ASUS ROG STRIX B660-F"}
    """
    try:
        data = request.json
        ram = data.get("ram")
        mobo = data.get("mobo")
        
        is_valid, message = CompatibilityValidator.check_ram_compatibility(ram, mobo)
        
        return jsonify({
            "compatible": is_valid,
            "message": message
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/validate/psu", methods=["POST"])
def validate_psu():
    """
    Check PSU sufficiency
    
    Request: {
        "cpu": "Intel Core i5-12400F",
        "gpu": "NVIDIA RTX 3050",
        "psu": "Corsair RM750x"
    }
    """
    try:
        data = request.json
        cpu = data.get("cpu")
        gpu = data.get("gpu")
        psu = data.get("psu")
        
        is_valid, message = CompatibilityValidator.check_psu_sufficiency(cpu, gpu, psu)
        
        return jsonify({
            "sufficient": is_valid,
            "message": message
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/validate/complete-build", methods=["POST"])
def validate_complete_build():
    """
    Validate entire build
    
    Request: {
        "cpu": "Intel Core i5-12400F",
        "mobo": "ASUS ROG STRIX B660-F",
        "ram": "Corsair Vengeance LPX 16GB DDR4",
        "gpu": "NVIDIA RTX 3050",
        "psu": "Corsair RM750x"
    }
    """
    try:
        data = request.json
        is_valid, issues = CompatibilityValidator.validate_complete_build(
            data.get("cpu"),
            data.get("mobo"),
            data.get("ram"),
            data.get("gpu"),
            data.get("psu")
        )
        
        return jsonify({
            "valid": is_valid,
            "issues": issues
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===== UPGRADE SUGGESTION ENDPOINTS =====

@app.route("/api/v1/upgrades", methods=["POST"])
def get_upgrades():
    """
    Get upgrade suggestions for current PC
    
    Request: {
        "current_pc": {
            "processor": {"name": "Intel Core i3-12100F", "id": "1"},
            "graphicscard": {"name": "NVIDIA GTX 1650", "id": "2"},
            "ram": {"name": "Kingston ValueRAM 8GB DDR4", "id": "3"},
            "powersupply": {"name": "Corsair VS 450W", "id": "4"},
            "motherboard": {"name": "MSI B660M DS3H", "id": "5"}
        },
        "budget": 15000
    }
    """
    try:
        data = request.json
        current_pc = data.get("current_pc")
        budget = data.get("budget")
        
        if not current_pc:
            return jsonify({"error": "Missing current_pc"}), 400
        
        upgrades = assistant.get_upgrade_suggestions(current_pc, budget)
        
        return jsonify({
            "status": "success",
            "current_pc": current_pc,
            "budget": budget,
            "upgrade_suggestions": upgrades
        }), 200
    
    except Exception as e:
        print(f"Error in upgrade suggestions: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ===== COMPONENT-SPECIFIC ENDPOINTS =====

@app.route("/api/v1/components/processors", methods=["GET"])
def get_processors():
    """
    Fetch all processors with search filter
    
    Query params:
        - search: Search by name
        - budget: Max price filter
        - limit: Number of results (default: 20)
    """
    try:
        search = request.args.get("search", "")
        budget = request.args.get("budget", type=float)
        limit = request.args.get("limit", 20, type=int)
        
        processors = component_db.get_processors(search=search, budget=budget, limit=limit)
        
        return jsonify({
            "status": "success",
            "component_type": "Processor",
            "count": len(processors),
            "data": processors
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching processors: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/components/graphics-cards", methods=["GET"])
def get_graphics_cards():
    """
    Fetch all graphics cards with search filter
    
    Query params:
        - search: Search by name
        - budget: Max price filter
        - limit: Number of results (default: 20)
    """
    try:
        search = request.args.get("search", "")
        budget = request.args.get("budget", type=float)
        limit = request.args.get("limit", 20, type=int)
        
        gpus = component_db.get_graphics_cards(search=search, budget=budget, limit=limit)
        
        return jsonify({
            "status": "success",
            "component_type": "Graphics Card",
            "count": len(gpus),
            "data": gpus
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching graphics cards: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/components/motherboards", methods=["GET"])
def get_motherboards():
    """
    Fetch all motherboards with search filter
    
    Query params:
        - search: Search by name
        - socket: Filter by socket type
        - budget: Max price filter
        - limit: Number of results (default: 20)
    """
    try:
        search = request.args.get("search", "")
        socket = request.args.get("socket", "")
        budget = request.args.get("budget", type=float)
        limit = request.args.get("limit", 20, type=int)
        
        mobos = component_db.get_motherboards(search=search, socket=socket, budget=budget, limit=limit)
        
        return jsonify({
            "status": "success",
            "component_type": "Motherboard",
            "count": len(mobos),
            "data": mobos
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching motherboards: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/components/ram", methods=["GET"])
def get_ram():
    """
    Fetch all RAM modules with search filter
    
    Query params:
        - search: Search by name
        - type: DDR4, DDR5, etc.
        - capacity: 8GB, 16GB, 32GB, etc.
        - budget: Max price filter
        - limit: Number of results (default: 20)
    """
    try:
        search = request.args.get("search", "")
        ram_type = request.args.get("type", "")
        capacity = request.args.get("capacity", "")
        budget = request.args.get("budget", type=float)
        limit = request.args.get("limit", 20, type=int)
        
        ram = component_db.get_ram(search=search, ram_type=ram_type, capacity=capacity, budget=budget, limit=limit)
        
        return jsonify({
            "status": "success",
            "component_type": "RAM",
            "count": len(ram),
            "data": ram
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching RAM: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/components/storage", methods=["GET"])
def get_storage():
    """
    Fetch all storage devices with search filter
    
    Query params:
        - search: Search by name
        - type: SSD, NVMe, HDD, etc.
        - capacity: Capacity filter
        - budget: Max price filter
        - limit: Number of results (default: 20)
    """
    try:
        search = request.args.get("search", "")
        storage_type = request.args.get("type", "")
        capacity = request.args.get("capacity", "")
        budget = request.args.get("budget", type=float)
        limit = request.args.get("limit", 20, type=int)
        
        storage = component_db.get_storage(search=search, storage_type=storage_type, capacity=capacity, budget=budget, limit=limit)
        
        return jsonify({
            "status": "success",
            "component_type": "Storage",
            "count": len(storage),
            "data": storage
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching storage: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/components/power-supplies", methods=["GET"])
def get_power_supplies():
    """
    Fetch all power supplies with search filter
    
    Query params:
        - search: Search by name
        - wattage: Wattage filter
        - budget: Max price filter
        - limit: Number of results (default: 20)
    """
    try:
        search = request.args.get("search", "")
        wattage = request.args.get("wattage", "")
        budget = request.args.get("budget", type=float)
        limit = request.args.get("limit", 20, type=int)
        
        psus = component_db.get_power_supplies(search=search, wattage=wattage, budget=budget, limit=limit)
        
        return jsonify({
            "status": "success",
            "component_type": "Power Supply",
            "count": len(psus),
            "data": psus
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching power supplies: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/components/monitors", methods=["GET"])
def get_monitors():
    """
    Fetch all monitors with search filter
    
    Query params:
        - search: Search by name
        - resolution: 1080p, 1440p, 4K, etc.
        - budget: Max price filter
        - limit: Number of results (default: 20)
    """
    try:
        search = request.args.get("search", "")
        resolution = request.args.get("resolution", "")
        budget = request.args.get("budget", type=float)
        limit = request.args.get("limit", 20, type=int)
        
        monitors = component_db.get_monitors(search=search, resolution=resolution, budget=budget, limit=limit)
        
        return jsonify({
            "status": "success",
            "component_type": "Monitor",
            "count": len(monitors),
            "data": monitors
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching monitors: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/components/by-id/<component_id>", methods=["GET"])
def get_component_by_id(component_id):
    """
    Get detailed information about a specific component
    
    Path params:
        - component_id: Component ID
    """
    try:
        component = component_db.get_component_by_id(component_id)
        
        if not component:
            return jsonify({"error": "Component not found"}), 404
        
        return jsonify({
            "status": "success",
            "data": component
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching component: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ===== WEB SCRAPING ENDPOINTS =====

@app.route("/api/v1/scrape/amazon-prices", methods=["POST"])
def scrape_amazon_prices():
    """
    Scrape prices from Amazon India
    
    Request: {"product_name": "RTX 3070"}
    """
    try:
        data = request.json
        product_name = data.get("product_name")
        
        if not product_name:
            return jsonify({"error": "Product name required"}), 400
        
        # Amazon scraping logic
        results = scrape_amazon(product_name)
        
        return jsonify({
            "status": "success",
            "source": "Amazon India",
            "product": product_name,
            "results": results
        }), 200
    
    except Exception as e:
        logger.error(f"Error scraping Amazon: {str(e)}")
        return jsonify({"error": "Scraping failed", "details": str(e)}), 500


@app.route("/api/v1/scrape/flipkart-prices", methods=["POST"])
def scrape_flipkart_prices():
    """
    Scrape prices from Flipkart
    
    Request: {"product_name": "RTX 3070"}
    """
    try:
        data = request.json
        product_name = data.get("product_name")
        
        if not product_name:
            return jsonify({"error": "Product name required"}), 400
        
        # Flipkart scraping logic
        results = scrape_flipkart(product_name)
        
        return jsonify({
            "status": "success",
            "source": "Flipkart",
            "product": product_name,
            "results": results
        }), 200
    
    except Exception as e:
        logger.error(f"Error scraping Flipkart: {str(e)}")
        return jsonify({"error": "Scraping failed", "details": str(e)}), 500


# ===== SCRAPING HELPER FUNCTIONS =====

def scrape_amazon(product_name):
    """Scrape Amazon India for product prices"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        url = f"https://www.amazon.in/s?k={product_name}"
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        results = []
        
        for item in soup.find_all('div', {'data-component-type': 's-search-result'})[:5]:
            try:
                title = item.find('h2', {'class': 'a-size-mini'})
                price = item.find('span', {'class': 'a-price-whole'})
                
                if title and price:
                    results.append({
                        "title": title.get_text(strip=True),
                        "price": price.get_text(strip=True),
                        "url": item.find('a', {'class': 's-no-outline'})['href'] if item.find('a') else None
                    })
            except Exception as e:
                logger.warning(f"Error parsing item: {str(e)}")
        
        return results
    
    except Exception as e:
        logger.error(f"Amazon scraping error: {str(e)}")
        return []


def scrape_flipkart(product_name):
    """Scrape Flipkart for product prices"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        url = f"https://www.flipkart.com/search?q={product_name}"
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        results = []
        
        for item in soup.find_all('div', {'class': '_1AtVbE'})[:5]:
            try:
                title = item.find('a', {'class': 's1Q9rs'})
                price = item.find('div', {'class': '_30jeq3'})
                
                if title and price:
                    results.append({
                        "title": title.get_text(strip=True),
                        "price": price.get_text(strip=True),
                        "url": title['href'] if title.get('href') else None
                    })
            except Exception as e:
                logger.warning(f"Error parsing item: {str(e)}")
        
        return results
    
    except Exception as e:
        logger.error(f"Flipkart scraping error: {str(e)}")
        return []




@app.route("/api/v1/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "PC Builder Assistant",
        "version": "1.0"
    }), 200


# ===== ERROR HANDLERS =====

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    print("Starting PC Builder Assistant API...")
    print("\n===== BUILD & UPGRADE ENDPOINTS =====")
    print("  POST /api/v1/builds - Generate PC builds")
    print("  POST /api/v1/upgrades - Get upgrade suggestions")
    
    print("\n===== VALIDATION ENDPOINTS =====")
    print("  POST /api/v1/validate/cpu-mobo - Check CPU-Mobo compatibility")
    print("  POST /api/v1/validate/ram - Check RAM compatibility")
    print("  POST /api/v1/validate/psu - Check PSU sufficiency")
    print("  POST /api/v1/validate/complete-build - Validate entire build")
    
    print("\n===== COMPONENT ENDPOINTS =====")
    print("  GET /api/v1/components/processors - Get all processors")
    print("  GET /api/v1/components/graphics-cards - Get all graphics cards")
    print("  GET /api/v1/components/motherboards - Get all motherboards")
    print("  GET /api/v1/components/ram - Get all RAM modules")
    print("  GET /api/v1/components/storage - Get all storage devices")
    print("  GET /api/v1/components/power-supplies - Get all power supplies")
    print("  GET /api/v1/components/monitors - Get all monitors")
    print("  GET /api/v1/components/by-id/<id> - Get component by ID")
    
    print("\n===== WEB SCRAPING ENDPOINTS =====")
    print("  POST /api/v1/scrape/amazon-prices - Scrape Amazon prices")
    print("  POST /api/v1/scrape/flipkart-prices - Scrape Flipkart prices")
    
    print("\n===== HEALTH ENDPOINT =====")
    print("  GET /api/v1/health - Health check")
    
    print("\nServer running on http://localhost:5000")
    
    app.run(debug=True, port=5000)
