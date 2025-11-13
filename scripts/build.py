import shutil
import subprocess
import sys
import zipfile
from pathlib import Path


def create_zip(dist_dir: Path) -> None:
    with zipfile.ZipFile("webui.zip", "w") as z:
        for curr_dir, _in_dirs, in_files in dist_dir.walk():
            for f in in_files:
                filepath = curr_dir.joinpath(f)
                relative = curr_dir.joinpath(f).relative_to(dist_dir)
                z.write(filepath, arcname=relative)


def build() -> None:
    with_zip = len(sys.argv) >= 2 and sys.argv[1] == "--zip"
    root = Path(__file__).parent.parent
    webui_dir = root / "webui"
    static_dir = root / "src" / "agent_playbook" / "static"

    # Build React app
    print("📦 Building React frontend...")
    subprocess.run(["npm", "ci"], cwd=webui_dir, check=True)
    subprocess.run(["npm", "run", "build"], cwd=webui_dir, check=True)
    if with_zip:
        create_zip(webui_dir.joinpath("dist"))

    # Copy build output to Python package
    build_output = webui_dir / "dist"
    if static_dir.exists():
        shutil.rmtree(static_dir)
    shutil.copytree(build_output, static_dir)

    print(f"✅ Copied React build to {static_dir}")


build()
