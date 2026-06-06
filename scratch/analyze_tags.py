with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the block around 5214
target = """                        })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}"""

replacement = """                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}"""

if target in content:
    simulated_content = content.replace(target, replacement)
else:
    simulated_content = content

lines = simulated_content.splitlines()

# Analysis between 3624 and 5230 (in simulated_content)
curly_stack = []
paren_stack = []

for idx in range(3623, 5230):
    if idx >= len(lines):
        break
    line = lines[idx]
    line_num = idx + 1
    
    for char_idx, char in enumerate(line):
        if char == '{':
            curly_stack.append((line_num, char_idx, line.strip()))
        elif char == '}':
            if curly_stack:
                curly_stack.pop()
            else:
                print(f"Extra '}}' at line {line_num}, col {char_idx}: {line.strip()}")
        elif char == '(':
            paren_stack.append((line_num, char_idx, line.strip()))
        elif char == ')':
            if paren_stack:
                paren_stack.pop()
            else:
                print(f"Extra ')' at line {line_num}, col {char_idx}: {line.strip()}")

print("\nRemaining open curly braces in stack:")
for line_num, col, text in curly_stack:
    print(f"{{ opened at line {line_num}, col {col}: {text}")

print("\nRemaining open parentheses in stack:")
for line_num, col, text in paren_stack:
    print(f"( opened at line {line_num}, col {col}: {text}")
