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



const http = require('http');
const https = require('https');
const cheerio = require('cheerio');
let globalLoopIndex = 0;
onHttpRequest = (resp) => {
  resp.setEncoding('utf8');
  let body = '';
  resp.on('data', (chunk) => {
    body += chunk;
  });
  resp.on('end', () => {
    onHttpBody(body);
  });
}


let gLastReadTime = new Date();
readNews = (index) => {
  gLastReadTime = new Date();
  const req = https.get(requestList[index],{timeout:1000*5},onHttpRequest).on("error", (err) => {
    console.log('readNews::err=<',err,'>');
  });
  //req.setTimeout(1000);
}


const onCheckTaskRun = () => {
  const now =  new Date();
  const escape  =  now - gLastReadTime;
  console.log('onCheckTaskRun::escape=<',escape,'>');
  if(escape > 1000*60*10) {
    globalLoopIndex = 0;
    readNews(globalLoopIndex);    
  }
  setTimeout(onCheckTaskRun,1000*60*10);
};

setTimeout(onCheckTaskRun,1000*60*10);
setTimeout(()=>{
  readNews(globalLoopIndex);
},1000);

onHttpBody= (body) => {
  const $ = cheerio.load(body);
  let link = $('a');
  //console.log('onHttpBody::link=<',link,'>');
  let linkKey = Object.keys(link);
  //console.log('onHttpBody::linkKey=<',linkKey,'>');
  for(let i = 0;i < linkKey.length;i++) {
    let key = linkKey[i];
    let linkOne = link[key];
    //console.log('onHttpBody::linkOne=<',linkOne,'>');
    if(linkOne.attribs && linkOne.attribs.href) {
      let href = linkOne.attribs.href;
      //console.log('onHttpBody::href=<',href,'>');
      if(href.startsWith('http://') || href.startsWith('https://')) {
        //console.log('onHttpBody::href=<',href,'>');
        onWatchLink(href);
      } else {
        //console.log('onHttpBody::href=<',href,'>');
      }
    }
  }
  if(globalLoopIndex < requestList.length) {
    readNews(globalLoopIndex++);
  } else {
    const now = new Date();
    console.log('onWathNewLink::now=<',now.toUTCString(),'>');
    console.log('wait 5 min for next loop ...');
    setTimeout(()=> {
      globalLoopIndex = 0;
      readNews(globalLoopIndex);
    },1000*60 * 5);
  }
}

const LevelDFS = require('./LevelDFS.js');
//console.log('::LevelDFS=<',LevelDFS,'>');
const db = new LevelDFS('/watorvapor/ldfs/tagbot/news_discovery_db');
onWatchLink = (href) => {
  //console.log('onWatchLink::href=<',href,'>');
  db.get(href, (err, value) => {
    //console.log('onWatchLink::err=<',err,'>');
    if (err && err.notFound) {
      let contents = JSON.stringify({href:href,discover:true});
      db.put(href,contents);
      onWathNewLink(href);
      return;
    }
    //console.log('onWatchLink::value=<',value,'>');
  });
}


const redis = require('redis');
const redisOption = {
  host:'node2.ceph.wator.xyz',
  port:6379,
  family:'IPv6'
};
const redisNewsChannelDiscovery = 'redis.channel.news.discover';
const gPublisher = redis.createClient(redisOption);

onWathNewLink = (href) => {
  console.log('onWathNewLink::href=<',href,'>');
  const now = new Date();
  console.log('onWathNewLink::now=<',now.toUTCString(),'>');
  gPublisher.publish(redisNewsChannelDiscovery, href);
}

