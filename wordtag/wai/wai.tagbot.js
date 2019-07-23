const WaiBase = require('./wai.base.js');
const level = require('level');
const gDBPath = '/watorvapor/wai.storage/wai.native.wator/db/zhizi/cn.cast';

const iConstNGramMaxWindow = 64;
class WaiTagBot extends WaiBase {
  constructor() {
    super();
    this.db_ = level(gDBPath,{ createIfMissing: false });
    this.phrase_ = {};
    this.db_.createReadStream()
    .on('data', (data) =>{
      //console.log('WaiTagBot::onSentence_ data=<',data,'>');
      this.phrase_[data.key] = parseFloat(data.value);
    })
    .on('error', (err) =>{
    })
    .on('close', () =>{
    })
    .on('end', (evt) =>{
      console.log('WaiTagBot::constructor end evt=<',evt,'>');
      if(typeof this.onReady === 'function') {
        this.onReady();
      }
    })
  }
  article(doc) {
    this.tbdWords_ = {};
    super.article(doc,this.onSentence_.bind(this));
  } 
  //
  onSentence_(sentence) {
    console.log('WaiTagBot::onSentence_ sentence=<',sentence,'>');
    for(let i = 0 ;i < sentence.length;i++) {
      let utf8 = sentence[i];
      //console.log('WaiTagBot::onSentence_ utf8=<',utf8,'>');
      let backIndex = i;
      if(backIndex > iConstNGramMaxWindow) {
        backIndex = iConstNGramMaxWindow;
      }
      /*
      if(this.phrase_[utf8]) {
        console.log('WaiTagBot::onSentence_ utf8=<',utf8,'>');
      }
      */
      for(let j = 1 ;j <= backIndex;j++) {
        let start = i - j ;
        if(start >= 0) {
          let concat = sentence.slice(start,i+1);
          let word = concat.join('');
          //console.log('WaiTagBot::onSentence_ word=<',word,'>');
          if(this.phrase_[word]) {
            console.log('WaiTagBot::onSentence_ word=<',word,'>');
          }
        }
      }
    }
  }
}

module.exports = WaiTagBot;
