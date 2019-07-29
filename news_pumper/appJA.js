const requestList = [];
const yahoo = require('./seed/yahoo.js');
for(let url of yahoo.seeds) {
  requestList.push(url);
}
//console.log('yahoo=<',yahoo,'>');
console.log('requestList=<',requestList,'>');
const NewsPumper = require('./NewsPumper.js');
const dbPath = '/watorvapor/ldfs/tagbot/news_discovery_db_ja';
const pumper = new NewsPumper(requestList,dbPath,'ja');
pumper.turn();
