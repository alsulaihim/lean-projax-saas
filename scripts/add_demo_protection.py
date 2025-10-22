#!/usr/bin/env python3
"""
Add demo user protection to all API mutation endpoints.
This script adds checkDemoMode() calls to prevent demo users from modifying data.
"""

import os
import re

# Files to skip (auth-related endpoints that should work for demo users)
SKIP_FILES = [
    'login/route.ts',
    'logout/route.ts',
    'signup/route.ts',
    'verify-email/route.ts',
    'auth/',
    '/health/',
    'user/demo-status',
]

def should_skip(filepath):
    """Check if file should be skipped."""
    return any(skip in filepath for skip in SKIP_FILES)

def add_demo_protection(filepath):
    """Add demo protection to a single file."""
    print(f"Processing: {filepath}")

    with open(filepath, 'r') as f:
        content = f.read()

    # Skip if already has demo check
    if 'checkDemoMode' in content:
        print(f"  ✓ Already protected")
        return

    # Skip if doesn't import getUser
    if 'getUser' not in content:
        print(f"  ⚠ Skipped (no getUser import)")
        return

    # Add import for checkDemoMode
    if "from '@/lib/auth-check'" in content:
        content = content.replace(
            "from '@/lib/auth-check'",
            "from '@/lib/auth-check'\nimport { checkDemoMode } from '@/lib/demo-check'"
        )

    # Find all mutation functions (POST, PUT, PATCH, DELETE)
    functions = re.finditer(
        r'export async function (POST|PUT|PATCH|DELETE)\([^)]*\) \{([^}]+const user = await getUser\(\)[^}]+if \(!user\) \{[^}]+\})',
        content,
        re.MULTILINE | re.DOTALL
    )

    modifications_made = False
    for match in functions:
        method = match.group(1)
        auth_block = match.group(2)

        # Find the end of the auth check block
        auth_end_pattern = r'(if \(!user\) \{[^}]+return NextResponse\.json\([^)]+\)[^}]+\})'
        auth_match = re.search(auth_end_pattern, auth_block, re.MULTILINE | re.DOTALL)

        if auth_match:
            demo_check = "\n\n  // Prevent demo users from modifying data\n  const demoCheck = checkDemoMode(user)\n  if (demoCheck) return demoCheck"

            # Replace the full function with added demo check
            old_text = match.group(0)
            new_text = old_text.replace(
                auth_match.group(0),
                auth_match.group(0) + demo_check
            )

            content = content.replace(old_text, new_text)
            modifications_made = True
            print(f"  ✓ Added protection to {method} method")

    if modifications_made:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"  ✓ File updated")
    else:
        print(f"  ⚠ No modifications made")

def main():
    """Main function to process all API files."""
    base_path = os.path.join(os.path.dirname(__file__), '..', 'app', 'api')

    # Walk through all API files
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file == 'route.ts':
                filepath = os.path.join(root, file)
                relative_path = os.path.relpath(filepath, base_path)

                if should_skip(relative_path):
                    print(f"Skipping: {relative_path}")
                    continue

                try:
                    add_demo_protection(filepath)
                except Exception as e:
                    print(f"  ✗ Error: {str(e)}")

    print("\n✓ Demo protection completed!")

if __name__ == '__main__':
    main()
