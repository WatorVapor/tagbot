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
//console.log('requestList=<',requestList,'>');



const http = require('http');
const https = require('https');
const cheerio = require('cheerio');
let globalLoopIndex = 0;
onHttpRequest = (resp) => {
  let body = '';
  resp.on('data', (chunk) => {
    body += chunk;
  });
  resp.on('end', () => {
    onHttpBody(body);
  });
}



readNews = (index) => {
  https.get(requestList[index],onHttpRequest).on("error", (err) => {
    console.log('readNews::err=<',err,'>');
  });
}


readNews(globalLoopIndex);

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
      if(href.startsWith('http://') || href.startsWith('https://')) {
        //console.log('onHttpBody::href=<',href,'>');
        onWatchLink(href);
      }
    }
  }
  if(globalLoopIndex < requestList.length) {
    readNews(globalLoopIndex++);
  } else {
    console.log('wait 10 min for next loop ...');
    setTimeout(()=> {
      globalLoopIndex = 0;
      readNews(globalLoopIndex);
    },1000*60 * 10);
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
      db.put(href,'discover://' + href);
      onWathNewLink(href);
      return;
    }
    //console.log('onWatchLink::value=<',value,'>');
  });
}
/*
const level = require('level');
let db = level('./.new_db');
onWatchLink = (href) => {
  //console.log('onWatchLink::href=<',href,'>');
  db.get(href, function (err, value) {
    if(err) {
      //console.log('onWatchLink::err=<',err,'>');
      if (err.notFound) {
        //console.log('onWatchLink::href=<',href,'>');
        db.put(href,'');
        onWathNewLink(href);
      }
    }
  });
}
*/

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
  gPublisher.publish(redisNewsChannelDiscovery, href);
}

