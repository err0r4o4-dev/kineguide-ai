import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GENERATED_NAMES = {"__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache"}

for path in ROOT.rglob("*"):
    if path.is_dir() and path.name in GENERATED_NAMES:
        shutil.rmtree(path)
