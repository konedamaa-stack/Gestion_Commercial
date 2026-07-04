const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('app', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace "mb-8 flex items-center justify-between"
    content = content.replace(/className="mb-8 flex items-center justify-between"/g, 'className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 items-start"');
    
    // Replace "flex justify-between items-center" (the one in etablissements was this one)
    // Actually, maybe we only want to replace specific ones. The above is safe enough.

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
