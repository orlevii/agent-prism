import shutil
import subprocess
from pathlib import Path


def build():
    """Build React app before Python packaging."""
    root = Path(__file__).parent
    webui_dir = root / "webui"
    static_dir = root / "src" / "agent_playbook" / "static"

    # Build React app
    print("📦 Building React frontend...")
    subprocess.run(["npm", "ci"], cwd=webui_dir, check=True)
    subprocess.run(["npm", "run", "build"], cwd=webui_dir, check=True)

    # Copy build output to Python package
    build_output = webui_dir / "dist"
    if static_dir.exists():
        shutil.rmtree(static_dir)
    shutil.copytree(build_output, static_dir)

    print(f"✅ Copied React build to {static_dir}")

build()
