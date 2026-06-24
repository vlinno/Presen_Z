import json

log_path = r"C:\Users\danie\.gemini\antigravity-ide\brain\c4d04ce9-5dd2-4c08-bdfa-f4421e734f52\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line_num, line in enumerate(f, 1):
        if line_num == 477:
            data = json.loads(line)
            print(json.dumps(data.get("tool_calls", []), indent=2))
