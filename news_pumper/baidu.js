const request = require('request');
const cheerio = require('cheerio');
const requestList = [
  'https://news.baidu.com',
  'https://news.baidu.com/guonei',
  'https://news.baidu.com/guoji',
  'https://news.baidu.com/mil',
  'https://news.baidu.com/finance',
  'https://news.baidu.com/ent',
  'https://news.baidu.com/sports',
  'https://news.baidu.com/internet',
  'https://news.baidu.com/tech',
  'https://news.baidu.com/game',
  'https://news.baidu.com/lady',
  'https://news.baidu.com/auto',
  'https://news.baidu.com/house'
];

let globalLoopIndex = 0;
onHttpRequest = (error, response, body) => {
  if(error) {
    throw error;
  }
  if(response.statusCode !== 200) {
    throw response.statusCode;
  }
  //console.log('onHttpRequest::body=<',body,'>');
  onHttpBody(body);
}



readNews = (index) => {
  const requestParam = {
    url: requestList[index]
  };
  request.get(requestParam,onHttpRequest);
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
  }
}

const level = require('level');
let db = level('./.baidunew_db');
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
onWathNewLink = (href) => {
  console.log('onWathNewLink::href=<',href,'>');
}
