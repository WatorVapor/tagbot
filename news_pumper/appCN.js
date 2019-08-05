const requestList = [];

const baidu = require('./seed/baidu.js');
for(let url of baidu.seeds) {
  requestList.push(url);
}
//console.log('baidu=<',baidu,'>');
const toutiao = require('./seed/toutiao.js');
//console.log('toutiao=<',toutiao,'>');
for(let url of toutiao.seeds) {
  requestList.push(url);
}
const sogou = require('./seed/sogou.js');
//console.log('sogou=<',sogou,'>');
for(let url of sogou.seeds) {
  requestList.push(url);
}

console.log('requestList=<',requestList,'>');
const NewsPumper = require('./NewsPumper.js');
const dbLink = '/watorvapor/ldfs/tagbot/cn/news_discovery_db';
const dbTextContent = '/watorvapor/ldfs/tagbot/cn/news_text_contents_db';
const pumper = new NewsPumper(requestList,dbLink,dbTextContent,'cn');
pumper.turn();
