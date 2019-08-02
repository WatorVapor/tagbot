const level = require('level');
const fs = require('fs');
const gDBPath = '/watorvapor/wai.storage/wai.native.wator/db/zhizi/ja';
const db_ = level(gDBPath,{ createIfMissing: false });
const phrase_ = {};
db_.createReadStream()
let maxValue = 0.0; 
.on('data', (data) =>{
  //console.log('WaiTagBot::onSentence_ data=<',data,'>');
  let fValue = parseFloat(data.value);
  phrase_[data.key] = fValue;
  if(fValue > maxValue) {
    maxValue = fValue;
  }
})
.on('error', (err) =>{
})
.on('close', () =>{
})
.on('end', (evt) =>{
  console.log('maxValue=<',maxValue,'>');
  //fs.writeFileSync('./wai.phrase.ja.json',JSON.stringify(phrase_,undefined,'  '),'utf8');
});


