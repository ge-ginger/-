import sys

def convert_newlines(text):
    # 去除文章頭尾多餘的空白與換行，然後將實際的換行替換成字面上的 '\n'
    # 如果你真的堅持要用正斜線 '/n'，請把 '\\n' 改成 '/n'
    return text.strip().replace('\n', '\\n')

print("📚 請貼上你的文章：")
print("(貼上後，Windows 使用者請按 Ctrl+Z 然後 Enter；Mac/Linux 使用者請按 Ctrl+D 來送出)")
print("-" * 50)

# 讀取多行輸入直到接收到結束符號 (EOF)
article = sys.stdin.read()

# 進行轉換
result = convert_newlines(article)

print("\n" + "=" * 20 + " 轉換結果 " + "=" * 20)
print(result)
print("=" * 50)