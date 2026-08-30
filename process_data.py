import json
import os
import glob

# 配置路径
RAW_DIR = 'raw_data'
OUTPUT_DIR = 'public/data'

def clean_and_compress():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # 获取所有原始 json 文件
    raw_files = glob.glob(os.path.join(RAW_DIR, '*.json'))
    
    if not raw_files:
        print("⚠️ 未在 raw_data/ 目录下找到任何 .json 文件！")
        return

    for file_path in raw_files:
        filename = os.path.basename(file_path)
        print(f"⏳ 正在处理: {filename} ...")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                raw_data = json.load(f)
        except json.JSONDecodeError:
            print(f"❌ {filename} 格式错误，跳过！")
            continue

        cleaned_data = []
        for item in raw_data:
            # 1. 清洗 links 数组
            if 'links' in item and isinstance(item['links'], list):
                valid_links = []
                for link in item['links']:
                    url = link.get('url', '')
                    # 过滤掉 #VALUE!、空字符串、None
                    if not url or url == '#VALUE!' or url == 'null':
                        continue
                    
                    # 判断是否为真实链接，如果不是，标记为备注 (note)
                    if not str(url).startswith('http'):
                        link['note'] = str(url)
                        link['url'] = '' # 清空 url，前端只渲染 note
                    
                    valid_links.append(link)
                item['links'] = valid_links
            
            # 2. 移除顶层空值字段 (可选，保留结构更安全)
            # item = {k: v for k, v in item.items() if v is not None and v != ''}
            
            cleaned_data.append(item)

        # 3. 压缩并输出 (separators=(',', ':') 去除所有多余空格)
        output_path = os.path.join(OUTPUT_DIR, filename)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(cleaned_data, f, ensure_ascii=False, separators=(',', ':'))
            
        print(f"✅ 处理完成，已压缩保存至: {output_path}")

if __name__ == '__main__':
    clean_and_compress()
    print("\n🎉 所有数据处理完毕！你可以将 public/ 目录推送到 GitHub 了。")