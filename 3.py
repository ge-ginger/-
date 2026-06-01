import sys
import json
import time

print("📚 請貼上你的複製文：")
print("(貼上後，Windows 請按 Ctrl+Z 然後 Enter；Mac/Linux 請按 Ctrl+D 來送出)")
print("-" * 50)

# 1. 讀取多行輸入
content_input = sys.stdin.read().strip()

if not content_input:
    print("⚠️ 沒有偵測到輸入內容喔！")
    sys.exit()

# 2. 自動擷取第一行當作標題
first_line = content_input.split('\n')[0].strip()

# 3. 產生獨立 ID
unique_id = f"pasta_addbyginger_{int(time.time())}"

# 4. 只針對文字內容進行 json.dumps，確保雙引號和換行安全轉換
safe_content = json.dumps(content_input, ensure_ascii=False)
safe_title = json.dumps(first_line, ensure_ascii=False)

# 5. 手工打造完美排版 (前面自帶 4 格與 8 格空白縮排)
final_output = f"""    {{
        "id": "{unique_id}",
        "title": {safe_title},
        "content": {safe_content},
        "tags": [
            "copypasta"
        ]
    }},"""

print("\n" + "=" * 20 + " 轉換結果 " + "=" * 20)
print(final_output)
print("=" * 50)