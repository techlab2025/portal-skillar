// fix-stylelint.js
const fs = require('fs');
const path = require('path');

// Mapping of literal values to SCSS variables
const replacements = [
  { pattern: /#e5e7eb\b/g, replacement: '$Gray-200-std' },
  { pattern: /#fff\b/g, replacement: '$StandardWhite' },
  { pattern: /#f1f5f9\b/g, replacement: '$Gray-100-std' },
  { pattern: /#4faf7c\b/g, replacement: '$PrimaryColor' },
  { pattern: /#000\s+#0000\b/g, replacement: '$BorderColor' },
  { pattern: /#000\b/g, replacement: '$StandardBlack' },
  { pattern: /#fafafa\b/g, replacement: '$GraySoft' },
  { pattern: /#121212\b/g, replacement: '$StandardBlack' },
  { pattern: /#4b4b4b\b/g, replacement: '$ColorDarkGray' },
  { pattern: /#e07060\b/g, replacement: '$BtnRed' },
  { pattern: /'Demi'/g, replacement: '$FontFamily' },
  // fix unknown selector "icon" -> ".icon"
  { pattern: /(^\s*)icon\s*\{/gm, replacement: '$1.icon {' },
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip node_modules and .git
      if (['node_modules', '.git', 'dist', 'build'].includes(entry.name)) continue;
      walk(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.scss')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      replacements.forEach((r) => {
        content = content.replace(r.pattern, r.replacement);
      });
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

const srcRoot = path.resolve(__dirname, '..', 'src');
walk(srcRoot);
console.log('Stylelint fix script completed.');
