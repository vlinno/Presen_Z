import json

log_path = r"C:\Users\danie\.gemini\antigravity-ide\brain\e1f1bdec-ce8d-486c-b9e1-aadeaf1a2c07\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line_num, line in enumerate(f, 1):
        try:
            data = json.loads(line)
            content = str(data.get("content", ""))
            tool_calls = str(data.get("tool_calls", ""))
            
            combined = content + tool_calls
            if "vivi.apriany" in combined.lower():
                print(f"Line {line_num}:")
                print(combined)
                print("-" * 50)
        except:
            pass
