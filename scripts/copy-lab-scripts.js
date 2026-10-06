const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'release-builds', 'Educational Browser-win32-x64');
const templatesDir = path.join(__dirname, 'templates');

if (!fs.existsSync(targetDir)) {
  console.log(`[INFO] Output directory ${targetDir} does not exist yet.`);
  process.exit(0);
}

const filesToCopy = [
  'Install-On-Lab-PC.bat',
  'Create-Desktop-Shortcut.bat',
  'Uninstall-Lab-PC.bat'
];

for (const file of filesToCopy) {
  const src = path.join(templatesDir, file);
  const dest = path.join(targetDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[OK] Copied ${file} -> release-builds/Educational Browser-win32-x64/`);
  }
}
