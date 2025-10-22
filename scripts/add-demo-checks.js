const fs = require('fs');
const path = require('path');

const files = [
  'app/api/ctq-requirements/route.ts',
  'app/api/ctq-requirements/[id]/route.ts',
  'app/api/recommendations/[id]/route.ts',
  'app/api/fishbone-causes/route.ts',
  'app/api/fishbone-causes/[id]/route.ts',
  'app/api/fishbone-categories/route.ts',
  'app/api/processes/route.ts',
  'app/api/processes/[id]/route.ts',
  'app/api/charter/[id]/route.ts',
  'app/api/assignments/route.ts',
  'app/api/assignments/[id]/route.ts',
  'app/api/assignments/[id]/status/route.ts',
  'app/api/sipoc-entries/route.ts',
  'app/api/sipoc-entries/[id]/route.ts',
  'app/api/vsm-steps/route.ts',
  'app/api/vsm-steps/[id]/route.ts',
  'app/api/voc-statements/[id]/route.ts',
  'app/api/fmea-entries/route.ts',
  'app/api/fmea-entries/[id]/route.ts',
  'app/api/schedule-items/route.ts',
  'app/api/schedule-items/[id]/route.ts',
];

const demoCheck = `
  // Prevent demo users from modifying data
  const demoCheck = checkDemoMode(user)
  if (demoCheck) return demoCheck`;

files.forEach(file => {
  const filepath = path.join(__dirname, '..', file);

  if (!fs.existsSync(filepath)) {
    console.log(`⚠ File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filepath, 'utf8');

  // Skip if already has demo check
  if (content.includes('checkDemoMode(user)')) {
    console.log(`✓ Already protected: ${file}`);
    return;
  }

  // Skip if doesn't have getUser
  if (!content.includes('getUser')) {
    console.log(`⚠ No getUser: ${file}`);
    return;
  }

  // Add the demo check after the auth check
  const authPattern = /if \(!user\) \{\s*return NextResponse\.json\([^)]+\)[^}]+\}/;
  const match = content.match(authPattern);

  if (match) {
    const replacement = match[0] + demoCheck;
    content = content.replace(authPattern, replacement);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✓ Protected: ${file}`);
  } else {
    console.log(`⚠ No auth check found: ${file}`);
  }
});

console.log('\n✓ Demo protection completed!');
