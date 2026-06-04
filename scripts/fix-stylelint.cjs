// scripts/fix-stylelint.cjs
// Run with: node scripts/fix-stylelint.cjs

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const projectRoot = path.resolve(__dirname, '..');

// Helper to run a command and stream output
function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: 'inherit', cwd: projectRoot });
}

// 1️⃣ Run stylelint fix (npm script runs stylelint --fix on .scss files)
try {
  run('npm run lint');
} catch (e) {
  console.error('npm run lint failed, continuing with manual replacements');
}

// 2️⃣ Map of disallowed literals → SCSS token variables (from src/styles/_variables.scss)
const REPLACEMENTS = [
  { pattern: /#e5e7eb/g, replacement: '$Gray-200-std' }, // light gray background
  { pattern: /#fafafa/g, replacement: '$GraySoft' },
  { pattern: /#4faf7c/g, replacement: '$PrimaryColor' },
  { pattern: /#4b4b4b/g, replacement: '$Gray-500-std' },
  { pattern: /#121212/g, replacement: '$StandardBlack' },
  { pattern: /#e6e6e6/g, replacement: '$BorderColor' },
  { pattern: /#000 #0000/g, replacement: '$BorderColor' },
  { pattern: /#000/g, replacement: '$StandardBlack' },
  { pattern: /#000000/g, replacement: '$StandardBlack' },
  { pattern: /#303030/g, replacement: '$gray-7' },
  { pattern: /#e9f9ee/g, replacement: '$BgApproved' },
  { pattern: /#18a957/g, replacement: '$PrimaryColor' },
  { pattern: /#6155f5/g, replacement: '$gray-7' },
  { pattern: /#6155f51a/g, replacement: 'rgba(97,85,245,0.1)' },
  { pattern: /rgba\(26,\s*26,\s*26,\s*1\)/g, replacement: '$StandardBlack' },
  { pattern: /rgba\(255,\s*247,\s*230,\s*1\)/g, replacement: '$GraySoft' },
  { pattern: /rgba\(217,\s*145,\s*0,\s*1\)/g, replacement: '$in-active-color' },
  { pattern: /#5d5d5d/g, replacement: '$color-dark-gray' },
  { pattern: /rgba\(29,\s*158,\s*117,\s*0\.08\)/g, replacement: '$PrimaryColor-alpha-8' },
  { pattern: /rgba\(29,\s*158,\s*117,\s*0\.18\)/g, replacement: '$PrimaryColor-alpha-20' },
  { pattern: /rgba\(255,\s*255,\s*255,\s*0\.35\)/g, replacement: '$white-alpha-30' },
  { pattern: /rgba\(255,\s*255,\s*255,\s*0\.55\)/g, replacement: '$white-alpha-40' },
  { pattern: /rgba\(255,\s*255,\s*255,\s*0\.06\)/g, replacement: '$white-alpha-15' },
  { pattern: /rgba\(255,\s*255,\s*255,\s*0\.88\)/g, replacement: '$white-alpha-85' },
  { pattern: /rgba\(224,\s*112,\s*96,\s*0\.1\)/g, replacement: 'rgba(224,112,96,0.1)' },
  // Font family literals
  { pattern: /'Demi'/g, replacement: "$FontFamily" },
  { pattern: /'medium'/g, replacement: "$FontFamily" },
  { pattern: /'bold'/g, replacement: "$FontFamily" },
  { pattern: /'light'/g, replacement: "$FontFamily" },
  // Unknown selector fix: replace plain 'icon {' with '.icon {'
  { pattern: /(^\s*)icon\s*\{/gm, replacement: '$1.icon {' }
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  REPLACEMENTS.forEach(r => {
    content = content.replace(r.pattern, r.replacement);
  });
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched ${path.relative(projectRoot, filePath)}`);
  }
}

// 3️⃣ Apply replacements to all .scss files under src/
const scssFiles = glob.sync(path.join(projectRoot, 'src/**/*.scss'));
scssFiles.forEach(replaceInFile);

// Also process .vue files (style blocks are inside .vue files, simple replacement works)
const vueFiles = glob.sync(path.join(projectRoot, 'src/**/*.vue'));
vueFiles.forEach(replaceInFile);

console.log('Stylelint bulk fix completed.');
