import json, os
from pathlib import Path

errors = []
root = Path(__file__).parent

# 1. config.json
cfg_path = root / "config.json"
if not cfg_path.exists():
    errors.append("❌ config.json 不存在于项目根目录")
else:
    try:
        cfg = json.loads(cfg_path.read_text(encoding='utf-8'))
        print(f"✅ config.json 合法，siteName={cfg.get('siteName')}")
        for f in cfg.get('dataFiles', []):
            fp = root / f
            if not fp.exists():
                errors.append(f"❌ 数据文件不存在: {f}")
            else:
                size = fp.stat().st_size
                if size == 0:
                    errors.append(f"❌ 数据文件为空: {f}")
                else:
                    try:
                        data = json.loads(fp.read_text(encoding='utf-8'))
                        if not isinstance(data, list):
                            errors.append(f"❌ {f} 不是 JSON 数组")
                        else:
                            print(f"✅ {f} 有效，共 {len(data)} 条记录 ({size/1024:.1f}KB)")
                    except json.JSONDecodeError as e:
                        errors.append(f"❌ {f} JSON 解析失败: {e}")
    except json.JSONDecodeError as e:
        errors.append(f"❌ config.json JSON 解析失败: {e}")

# 2. data 目录
data_dir = root / "data"
if not data_dir.is_dir():
    errors.append("❌ data/ 目录不存在（注意是文件夹不是文件）")

if errors:
    print("\n🔴 发现以下问题:")
    for e in errors:
        print(f"  {e}")
else:
    print("\n🟢 所有检查通过！请确保通过 python -m http.server 访问而非双击打开")