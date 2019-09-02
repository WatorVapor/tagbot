const requestList = [];

const itmedia = require('./seed/news.google.ja.js');
for(let url of itmedia.seeds) {
  requestList.push(url);
}
console.log('requestList=<',requestList,'>');
const NewsPumper = require('./NewsPumper.js');
const dbLink = '/watorvapor/ldfs/tagbot/ja_test/news_discovery_db';
const dbTextContent = '/watorvapor/ldfs/tagbot/ja_test/news_text_contents_db';
const pumper = new NewsPumper(requestList,dbLink,dbTextContent,'ja');
pumper.turn();
