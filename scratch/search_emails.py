import os
import json
import re

brain_dir = r"C:\Users\danie\.gemini\antigravity-ide\brain"
print("=== Scanning Log Transcripts for Credentials ===")

email_pattern = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')

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
                            
                            # Search in user input or browser inputs
                            emails = email_pattern.findall(content + tool_calls)
                            if emails:
                                print(f"Convo: {folder} | Line: {line_num}")
                                print(f"  Emails found: {set(emails)}")
                                # Print snippet of the content
                                clean_content = content.replace('\n', ' ')
                                if len(clean_content) > 150:
                                    clean_content = clean_content[:150] + "..."
                                print(f"  Content: {clean_content}")
                        except Exception as e:
                            pass
            except Exception as e:
                print(f"Error reading {transcript_path}: {e}")
