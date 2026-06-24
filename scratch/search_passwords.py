import os
import json

brain_dir = r"C:\Users\danie\.gemini\antigravity-ide\brain"
print("=== Scanning Log Transcripts for Passwords ===")

targets = ["vivi.apriany@gmail.com", "admin.kesbangpol@presenz.com"]

for folder in os.listdir(brain_dir):
    folder_path = os.path.join(brain_dir, folder)
    if os.path.isdir(folder_path):
        transcript_path = os.path.join(folder_path, ".system_generated", "logs", "transcript.jsonl")
        if os.path.exists(transcript_path):
            try:
                with open(transcript_path, 'r', encoding='utf-8') as f:
                    for line_num, line in enumerate(f, 1):
                        try:
                            data = json.loads(line)
                            content = str(data.get("content", ""))
                            tool_calls = str(data.get("tool_calls", ""))
                            
                            combined = content + tool_calls
                            if any(t in combined for t in targets) or "password" in combined.lower():
                                # Check if it contains password or registration details
                                if any(x in combined.lower() for x in ["password", "sandi", "register", "login", "auth"]):
                                    print(f"Convo: {folder} | Line: {line_num}")
                                    clean_content = combined.replace('\n', ' ')
                                    if len(clean_content) > 300:
                                        clean_content = clean_content[:300] + "..."
                                    print(f"  Snippet: {clean_content}")
                        except Exception as e:
                            pass
            except Exception as e:
                print(f"Error reading {transcript_path}: {e}")
