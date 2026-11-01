from app import create_app
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask application
app = create_app()

if __name__ == '__main__':
    # Get port from environment or use default
    # Default: 4001 (avoids conflicts with macOS AirPlay on 5000)
    port = int(os.getenv('PORT', 4001))
    # Debug defaults to False unless explicitly enabled in env AND not production
    env = os.getenv('FLASK_ENV', 'development')
    debug_env = os.getenv('FLASK_DEBUG')
    debug = False
    if env != 'production' and debug_env is not None:
        debug = debug_env.lower() == 'true'
    elif env == 'development':
        debug = True

    print(f"Starting Task Manager API on port {port}")
    print(f"Debug mode: {debug}")

    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
