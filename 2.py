import os
import json
from datetime import datetime

def merge_copypasta_library(root_dir, output_file='data.json'):
    all_pastas = []

    # 1. 遍歷主資料夾下的所有子資料夾（每個子資料夾代表一篇文章）
    for folder_name in os.listdir(root_dir):
        folder_path = os.path.join(root_dir, folder_name)
        
        # 確保這是一個資料夾
        if not os.path.isdir(folder_path):
            continue
        
        metadata_path = os.path.join(folder_path, 'metadata.json')
        zhtw_dir_path = os.path.join(folder_path, 'zh-tw')

        # 檢查必要檔案是否存在
        if not os.path.exists(metadata_path) or not os.path.exists(zhtw_dir_path):
            print(f"跳過資料夾 {folder_name}: 缺少 metadata 或 zh-tw 資料夾")
            continue

        # 2. 讀取 metadata.json
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        # 3. 找出 zh-tw 資料夾中時間最晚的檔案
        json_files = [f for f in os.listdir(zhtw_dir_path) if f.endswith('.json')]
        if not json_files:
            continue
        
        # 根據檔名排序（因為檔名是 2025-05-17_22:58 格式，字串排序即為時間排序）
        # 或是根據內容中的 publish_time 排序，這裡採最直觀的檔名排序
        latest_file = sorted(json_files)[-1]
        
        # 4. 讀取內容檔案
        latest_file_path = os.path.join(zhtw_dir_path, latest_file)
        with open(latest_file_path, 'r', encoding='utf-8') as f:
            content_data = json.load(f)
        
        # 5. 合併資料
        pasta_entry = {
            "id": metadata.get("id"),
            "title": content_data.get("title"),
            "content": content_data.get("content"),
            "tags": metadata.get("tags", []),
            "publish_time": content_data.get("publish_time"),
            "last_updated": latest_file.replace('.json', '') # 紀錄檔案時間標籤
        }
        
        all_pastas.append(pasta_entry)
        print(f"已處理: {content_data.get('title')}")

    # 6. 將所有結果寫入最終的 data.json
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_pastas, f, ensure_ascii=False, indent=4)
    
    print(f"\n✅ 合併完成！總共處理了 {len(all_pastas)} 則複製文。")
    print(f"結果儲存在: {output_file}")

if __name__ == "__main__":
    # 請將 '.' 改為你存放那些文章資料夾的實際路徑
    target_directory = 'D:\\web\\contents\\contents\\json\\' 
    merge_copypasta_library(target_directory)