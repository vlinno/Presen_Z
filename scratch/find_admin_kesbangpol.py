import json

log_path = r"C:\Users\danie\.gemini\antigravity-ide\brain\c4d04ce9-5dd2-4c08-bdfa-f4421e734f52\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line_num, line in enumerate(f, 1):
        try:
            data = json.loads(line)
            content = str(data.get("content", ""))
            tool_calls = str(data.get("tool_calls", ""))
            
            combined = content + tool_calls
            if "admin.kesbangpol" in combined.lower():
                print(f"Line {line_num}:")
                print(combined[:1000])
                print("-" * 50)
        except:
            pass
