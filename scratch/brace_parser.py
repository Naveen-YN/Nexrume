import re

with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace block around 5214
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
    content = content.replace(target, replacement)
else:
    print("Warning: Target block not found in page.tsx")

idx = 0
n = len(content)

curly_stack = []
paren_stack = []
square_stack = []

def get_line_col(pos):
    line = 1
    col = 0
    for i in range(pos):
        if content[i] == '\n':
            line += 1
            col = 0
        else:
            col += 1
    return line, col

while idx < n:
    # Skip single-line comments
    if idx + 1 < n and content[idx:idx+2] == '//':
        idx += 2
        while idx < n and content[idx] != '\n':
            idx += 1
        continue
    
    # Skip multi-line comments
    if idx + 1 < n and content[idx:idx+2] == '/*':
        idx += 2
        while idx + 1 < n and content[idx:idx+2] != '*/':
            idx += 1
        idx += 2
        continue
        
    # Skip string literals
    if content[idx] in ["'", '"']:
        quote = content[idx]
        idx += 1
        while idx < n and content[idx] != quote:
            if content[idx] == '\\':
                idx += 2
            else:
                idx += 1
        idx += 1
        continue
        
    # Skip template literals
    if content[idx] == '`':
        idx += 1
        while idx < n and content[idx] != '`':
            if idx + 1 < n and content[idx:idx+2] == '${':
                line, col = get_line_col(idx)
                curly_stack.append(('${', line, col))
                idx += 2
            elif content[idx] == '\\':
                idx += 2
            else:
                idx += 1
        idx += 1
        continue

    char = content[idx]
    if char == '{':
        line, col = get_line_col(idx)
        curly_stack.append(('{', line, col))
    elif char == '}':
        if curly_stack:
            curly_stack.pop()
        else:
            line, col = get_line_col(idx)
            print(f"Extra '}}' at line {line}, col {col}")
    elif char == '(':
        line, col = get_line_col(idx)
        paren_stack.append(('(', line, col))
    elif char == ')':
        if paren_stack:
            paren_stack.pop()
        else:
            line, col = get_line_col(idx)
            print(f"Extra ')' at line {line}, col {col}")
    elif char == '[':
        line, col = get_line_col(idx)
        square_stack.append(('[', line, col))
    elif char == ']':
        if square_stack:
            square_stack.pop()
        else:
            line, col = get_line_col(idx)
            print(f"Extra ']' at line {line}, col {col}")

    idx += 1

print(f"\nParse complete.")
print(f"Remaining open curly braces: {len(curly_stack)}")
print(f"Remaining open parentheses: {len(paren_stack)}")
