const HANZI = require('./cjk_hanzi.js');
const fs = require('fs');
let content = fs.readFileSync('/watorvapor/ldfs/ljson/wai/phrase/raw/wai.phrase.cn.json', 'utf8');
console.log('content.length=<',content.length,'>');
const phrase = JSON.parse(content);
const keysOfPhrase = Object.keys(phrase);

const chinesePhrase = Object.assign({}, phrase);

const isAllHanzi = (key) => {
  for(let zi of key ) {
    if(!HANZI[zi]) {
      return false;
    }
  }
  return true;
}

for(let key of keysOfPhrase) {
  //console.log('key=<',key,'>');
  const hanzi = isAllHanzi(key);
  if(hanzi === false) {
    delete chinesePhrase[key]
  }
}

 fs.writeFileSync('/watorvapor/ldfs/ljson/wai/phrase/stage1/wai.stage1.phrase.cn.json',JSON.stringify(chinesePhrase,undefined,2));