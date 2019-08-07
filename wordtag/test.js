const WaiTagBot = require('./wai2/wai.tagbot.js');

const NewsTextReader = require('./wai2/news.text.reader.js');
const txtReader = new NewsTextReader('//watorvapor/ldfs/tagbot/test/news_text_contents_db','ja');
const wai = new WaiTagBot();
txtReader.fetch('https://ja.wikipedia.org/wiki/%E5%8F%A5%E8%AA%AD%E7%82%B9',(txt,myhref,myLang)=>{
  onNewsText(txt,myhref,myLang);
});

const onNewsText = (txt,myhref,myLang) => {
    //console.log('onNewsText::txt=<',txt,'>');
    //console.log('onNewsText::myhref=<',myhref,'>');
    let tags = wai.article(txt,myLang);
    console.log('onNewsText::tags=<',tags,'>');
}
