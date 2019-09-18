const requestList = [];

const sina = require('./seed/sina.js');
for(let url of goo.sina) {
  requestList.push(url);
}
console.log('requestList=<',requestList,'>');
const NewsPumper = require('./NewsPumper.js');
const dbLink = '/watorvapor/ldfs/tagbot/cn_test/news_discovery_db';
const dbTextContent = '/watorvapor/ldfs/tagbot/cn_test/news_text_contents_db';
const pumper = new NewsPumper(requestList,dbLink,dbTextContent,'cn');
pumper.turn();
