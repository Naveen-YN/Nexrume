import re

with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the block around 5214
target = """                        })()}
            </div>
          )}"""

replacement = """                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}"""

if target in content:
    print("Found target!")
    simulated_content = content.replace(target, replacement)
else:
    # Try finding with different spacing
    print("Target not found. Let's do regex replace or check the lines.")
    # Let's inspect the lines around 5214
    lines = content.splitlines()
    for idx in range(5210, 5220):
        print(f"{idx+1}: {lines[idx]}")
    simulated_content = content

# Now let's analyze simulated_content
lines = simulated_content.splitlines()
tag_re = re.compile(r'<(/?[a-zA-Z0-9]+)(?:\s+[^>]*[^/>])?>')

stack = []
for idx, line in enumerate(lines):
    # Ignore lines that are comments or text within curly braces if possible,
    # but for simple tag matching we just match div and main tags.
    for m in tag_re.finditer(line):
        tag = m.group(1).lower()
        if tag not in ['div', '/div', 'main', '/main']:
            continue
        
        if tag.startswith('/'):
            tag_name = tag[1:]
            if stack and stack[-1][0] == tag_name:
                stack.pop()
            else:
                print(f"Line {idx+1}: Mismatch: closed {tag} but stack top is {stack[-1] if stack else 'empty'}")
        else:
            stack.append((tag, idx + 1, line.strip()))

print("\nRemaining open tags in stack at end of file:")
for tag, line_num, text in stack:
    print(f"<{tag}> opened at line {line_num}: {text}")
