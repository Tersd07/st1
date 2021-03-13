(() => {
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
})();
/*
此文件为Node.js专用。其他用户请忽略
 */
//此处填写京东账号cookie。
let CookieJDs = [
  '',//账号一ck,例:pt_key=XXX;pt_pin=XXX;
  '',//账号二ck,例:pt_key=XXX;pt_pin=XXX;如有更多,依次类推
]
// 判断环境变量里面是否有京东ck
if (process.env.JD_COOKIE) {
  if (process.env.JD_COOKIE.indexOf('&') > -1) {
    console.log(`您的cookie选择的是用&隔开\n`)
    CookieJDs = process.env.JD_COOKIE.split('&');
  } else if (process.env.JD_COOKIE.indexOf('\n') > -1) {
    console.log(`您的cookie选择的是用换行隔开\n`)
    CookieJDs = process.env.JD_COOKIE.split('\n');
  } else {
    CookieJDs = [process.env.JD_COOKIE];
  }
}
if (JSON.stringify(process.env).indexOf('GxIxTxHxUxB')>-1) {
  console.log(`请勿使用github action运行此脚本,无论你是从你自己的私库还是其他哪里拉取的源代码，都会导致我被封号\n`);
  !(async () => {
    await require('./sendNotify').sendNotify('提醒', `请勿使用github action、滥用github资源会封我仓库以及账号`)
    await process.exit(0);
  })()
}
CookieJDs = [...new Set(CookieJDs.filter(item => !!item))]
console.log(`\n====================共有${CookieJDs.length}个京东账号Cookie=========\n`);
console.log(`==================脚本执行- 北京时间(UTC+8)：${new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000).toLocaleString()}=====================\n`)
if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
for (let i = 0; i < CookieJDs.length; i++) {
  const index = (i + 1 === 1) ? '' : (i + 1);
  exports['CookieJD' + index] = CookieJDs[i].trim();
}
