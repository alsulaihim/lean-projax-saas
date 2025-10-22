#!/bin/bash

# List of API files that need demo protection (excluding auth-related endpoints)
FILES=(
  "app/api/ai/assessment/[id]/route.ts"
  "app/api/ai/chat/[id]/route.ts"
  "app/api/assignments/[id]/route.ts"
  "app/api/assignments/[id]/status/route.ts"
  "app/api/assignments/route.ts"
  "app/api/charter/[id]/route.ts"
  "app/api/ctq-requirements/[id]/route.ts"
  "app/api/ctq-requirements/route.ts"
  "app/api/fishbone-categories/route.ts"
  "app/api/fishbone-causes/[id]/route.ts"
  "app/api/fishbone-causes/route.ts"
  "app/api/fmea-entries/[id]/route.ts"
  "app/api/fmea-entries/route.ts"
  "app/api/populate-sipoc/route.ts"
  "app/api/processes/[id]/route.ts"
  "app/api/processes/route.ts"
  "app/api/recommendations/[id]/route.ts"
  "app/api/recommendations/route.ts"
  "app/api/schedule-items/[id]/route.ts"
  "app/api/schedule-items/route.ts"
  "app/api/sipoc-entries/[id]/route.ts"
  "app/api/sipoc-entries/route.ts"
  "app/api/voc-statements/[id]/route.ts"
  "app/api/vsm-steps/[id]/route.ts"
  "app/api/vsm-steps/route.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."

    # Check if file already has the demo check import
    if ! grep -q "import.*checkDemoMode" "$file"; then
      # Add import after the getUser import
      sed -i '' "/import.*getUser.*from/a\\
import { checkDemoMode } from '@/lib/demo-check'
" "$file"
    fi

    # Check if file already has demo check in functions
    if ! grep -q "checkDemoMode(user)" "$file"; then
      # Add demo check after authentication check in each mutation function
      sed -i '' "/if (!user) {/,/}/a\\
\\
  // Prevent demo users from modifying data\\
  const demoCheck = checkDemoMode(user)\\
  if (demoCheck) return demoCheck
" "$file"
    fi

    echo "  ✓ Done"
  else
    echo "  ⚠ File not found: $file"
  fi
done

echo ""
echo "✓ Demo protection added to all API endpoints"
