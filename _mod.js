(async () => {
  const fs = require('fs');
  const path = require('path');
  
  const getFiles = (dir, suffixs) => {
    let files = [], scripts = [];
    try {
      files = fs.readdirSync(dir);
    } catch (ex) { } 
    for (const f of files) {
      if(Array.isArray(suffixs) && suffixs.every(s => !f.endsWith(`.${s}`)))
        continue;
      const pathname = path.join(dir, f);
      if (!fs.statSync(pathname).isDirectory())
        scripts.push(pathname);
    }
    return scripts;
  }

  const replaceFileContent = (pathname, rules, encoding = 'utf8') => {
    if(!Array.isArray(rules) || rules.length === 0 || !fs.existsSync(pathname)) return;
    try {
      let fileContent = fs.readFileSync(pathname, encoding);
      for (const r of rules)
        fileContent = fileContent.replace(...r);
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

  const _filterConsole = () => {
    for (const name of ['log', 'info', 'warn', 'error', 'debug']) {
      const _fn = console[name];
      console[name] = function (...args) {
        for (let i = 0; i < args.length; i++) {
          let str = args[i], isReference = false;
          if (!str) continue;
          const type = typeof(str), isError = args[i] instanceof Error, mask = 'xxx';
          if (type === 'object' || type === 'array') {
            try {
              str = JSON.stringify(str);
            } catch (ex) {
              isReference = true;
            }
          } else {
            str = `${str}`;
          }
          if (isError)
            str = args[i].message;
          if(isReference || /pt_(pin|key)=/.test(str) || 
            process?.env?.JD_COOKIE?.match?.(/(?<=pt_key=)[^;]+/g)?.some(s => str.includes(s))
          ){
            if (isError) {
              args[i].message = mask;
            } else {
              args[i] = mask;
            }
          }
        }
        return _fn.apply(this, args);
      };
    }
  }

  const rules = [
    [/\(([`"'])(\\x47\\x49\\x54\\x48\\x55\\x42|GI.HUB)\1\)/g, '(\'GxIxTxHxUxB\')'],
    [/(?<=function\s+Env\([^)]+\)\s*{)/, '"undefined"!=typeof process&&Object.entries(process.env).forEach(([k,v])=>{`${k} ${v}`.includes("GITHUB")&&(delete process.env[k])});'],
    [/(if\s*\(.+\)\s*)?((\$|console)\.(log|msg|logErr))\(.+?(\u52A9\u529B|\u4e92\u52a9)\u7801.+?(share|code|encrypt|pin|token|uuid)/ig, 'void(0) // $&'], 
    [/(if\s*\(.+\)\s*)?((\$|console)\.(log|msg|logErr))\(.+?[^\[]['"`{]\s*cookie\s*['"`}]/ig, 'void(0) // $&'],
    [/(?<=const helpAu = )true/ig, 'false'],
    [/(if\s*\(.+?\)\s*)?await\s+helpAuthor\d*\(\)/ig, '// $&'],
  ];

  const rules2 = [
    ['jdCookie.js', [/^/, `(${_filterConsole.toString().replace(/^[\r\n]*\s{2}/gm, '')})();\n`]],
    [/d_crazy_j|d_jdzz\./, [/(?<=\u8981\u52a9\u529b\u7684\u597d\u53cb\$\{)JSON\.stringify\(.+?\)(?=\})/g, `$&.replace(/"[^"]+",/, '')`]],
    [ 'd_cash.',
      [/(?<=\u8981\u52a9\u529b\u7684\u597d\u53cb\$\{)JSON\.stringify\(.+?\)(?=\})/g, `$&.replace(/\{[^}]+\},/, '')`],
      [/(?<=\u53bb\u5e2e\u52a9\u597d\u53cb)\$\{code\['[^']+'\]\}/g, '***']
    ],
    ['speed_redpo', [/await _0x\w+\[[^\]]+?\]\(invite\d*\);/g, '']],
    ['d_crazy_joy.', [/var _0x\w+='jsj.+?getAuthorShare\u0043ode/, '// $&']],
    ['d_jxd.', [/(?<=let \u0073hare\u0043odes=)/, '[];']],
    ['d_beauty.', [/(?=console\.log\(.+?token)/gi, '// ']],
  ];

  [...new Set(getFiles('./.github/workflows', ['yml', 'yaml']).concat('_mod.js'))].forEach(removeFile);
  [...new Set(getFiles('./', ['js']).concat(getFiles('./activity', ['js'])))].forEach(f => {
    let r = rules;

    for (const [r1, ...r2] of rules2) {
      if (typeof r1 === 'string' ? f.includes(r1) : r1.test(f)) {
        r = [...r, ...r2];
      }
    }

    replaceFileContent(f, r);
  });

})();