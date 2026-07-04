const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./app');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  if (content.includes('className="p-8"')) {
    content = content.replace(/className="p-8"/g, 'className="p-4 md:p-8"');
    changed = true;
  }
  
  if (content.includes('<div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">\r\n        <table')) {
    content = content.replace(
      '<div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">\r\n        <table', 
      '<div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">\r\n        <div className="overflow-x-auto">\r\n        <table'
    );
    content = content.replace(
      '        </table>\r\n      </div>',
      '        </table>\r\n        </div>\r\n      </div>'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated ' + f);
  }
});
