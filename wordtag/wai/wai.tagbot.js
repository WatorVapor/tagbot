const WaiBase = require('./wai.base.js');
const fs = require('fs');

const iConstNGramMaxWindow = 64;
class WaiTagBot extends WaiBase {
  constructor() {
    super();
    console.log('WaiTagBot::constructor start read...>');
    let content = fs.readFileSync('./wai.phrase.json', 'utf8');
    console.log('WaiTagBot::constructor content.length=<',content.length,'>');
    this.phrase_ = JSON.parse(content);
    setTimeout(()=> {
      if(typeof this.onReady === 'function') {
        this.onReady();
      }      
    },1000);
  }
  article(doc) {
    this.wordFreqs_ = {};
    this.tbdWords_ = {};
    super.article(doc,this.onSentence_.bind(this));
    //console.log('WaiTagBot::article this.tbdWords_=<',this.tbdWords_,'>');
    //console.log('WaiTagBot::article this.wordFreqs_=<',this.wordFreqs_,'>');
    const pureCollect = super.FilterOutInside_(this.wordFreqs_);
    //console.log('WaiTagBot::article pureCollect=<',pureCollect,'>');
    return this.calcWeight_(pureCollect);
  } 
  //
  onSentence_(sentence) {
    //console.log('WaiTagBot::onSentence_ sentence=<',sentence,'>');
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
            //console.log('WaiTagBot::onSentence_ word=<',word,'>');
            this.tbdWords_[word] = this.phrase_[word];
            if(this.wordFreqs_[word]) {
              this.wordFreqs_[word]++;
            } else {
              this.wordFreqs_[word] = 1;
            }
          }
        }
      }
    }
  }
  
  calcWeight_(collect) {
    let weights = [];
    for(let word in collect) {
      //console.log('WaiTagBot::calcWeight_ word=<',word.length,'>');
      let probability = this.phrase_[word];
      let freq = collect[word];
      //console.log('WaiTagBot::calcWeight_ freq=<',freq,'>');
      //sortedCollect.push({w:word,freq:collect[word]})
      let weight = freq * freq * freq * freq * probability * word.length * word.length;
      weights.push({tag:word,weight:weight});
    }
    //console.log('WaiTagBot::calcWeight_ weights=<',weights,'>');
    weights.sort((a,b) => {
      //console.log('WaiTagBot::calcWeight_ a=<',a,'>');
      //console.log('WaiTagBot::calcWeight_ b=<',b,'>');
      if(a.weight > b.weight) return -1;
      if(a.weight < b.weight) return 1;
      return 0;
    });
    //console.log('WaiTagBot::calcWeight_ weights=<',weights,'>');
    return weights.slice(0, 16);
  }
}

module.exports = WaiTagBot;
