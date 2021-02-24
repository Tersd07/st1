(async () => {
  const fs = require('fs');
  const path = require('path');
  
  const getFiles = (dir, suffixs) => {
    let files = [], scripts = [];
    try {
      files = fs.readdirSync(dir);
    } catch (ex) { } 
    scripts = files.filter(f => {
      if(Array.isArray(suffixs) && suffixs.every(s => !f.endsWith(`.${s}`)))
        return false;
      const pathname = path.join(dir, f);
      if (fs.statSync(pathname).isDirectory())
        return false;
      return true;
    }).map(f => {
      return path.join(dir, f);
    });
    return scripts;
  }

  const replaceFileContent = (pathname, rules, encoding = 'utf8') => {
    if(!Array.isArray(rules) || rules.length === 0 || !fs.existsSync(pathname)) return;
    try {
      let fileContent = fs.readFileSync(pathname, encoding);
      for (const r of rules) {
        fileContent = fileContent.replace(...r);
      }
      fs.writeFileSync(pathname, fileContent, encoding);
      return fileContent;
    } catch (ex) {
      console.error(ex);
    }
  }

  const removeFile = (pathname) => {
    try {
      if(fs.existsSync(pathname))
        fs.rmSync(pathname);
    } catch (ex) {
      console.error(ex);
    }
  }

  const rules = [
    [
      /\(([`"'])(\\x47\\x49\\x54\\x48\\x55\\x42|GI.HUB)\1\)/g,
      '(\'GxIxTxHxUxB\')'
    ], [
      /(if\s*\(.+\)\s*)?((\$|console)\.(log|msg|logErr))\(.+?(\u52A9\u529B|\u4e92\u52a9)\u7801.+?(share|code|encrypt|pin|token|uuid)/ig,
      'void(0) \/\/ $&'
    ], [
      /(if\s*\(.+\)\s*)?((\$|console)\.(log|msg|logErr))\(.+?[^\[]['"`{]\s*cookie\s*['"`}]/ig,
      'void(0) \/\/ $&'
    ], [
      /(?<=const helpAu = )true/ig, 'false'
    ], [
      /(if\s*\(.+?\)\s*)?await\s+helpAuthor\d*\(\)/ig,
      '\/\/ $&'
    ]
  ];

  [...new Set(getFiles('./.github/workflows', ['yml', 'yaml']).concat('_mod.js'))].forEach(removeFile);
  [...new Set(getFiles('./', ['js']).concat(getFiles('./activity', ['js'])))].forEach(f => {
    replaceFileContent(f, rules);
  });

})();