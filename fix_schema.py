import re

with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace schemas = ["public", "auth"] or similar
content = re.sub(r'schemas\s*=\s*\[[^\]]+\]', 'schemas   = ["gestion_commerciale"]', content)

# Replace @@schema("public") with @@schema("gestion_commerciale")
content = content.replace('@@schema("public")', '@@schema("gestion_commerciale")')

# If some models didn't have @@schema("public") yet, we ensure they have @@schema("gestion_commerciale")
def replace_block(match):
    block = match.group(0)
    if '@@schema' not in block:
        block = re.sub(r'\}$', '  @@schema("gestion_commerciale")\n}', block)
    return block

content = re.sub(r'(?:model|enum)\s+\w+\s+\{[\s\S]*?^\}', replace_block, content, flags=re.MULTILINE)

with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)
