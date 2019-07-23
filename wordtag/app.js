const redis = require('redis');
const redisOption = {
  host:'node2.ceph.wator.xyz',
  port:6379,
  family:'IPv6'
};
const redisNewsChannelDiscovery = 'redis.channel.news.discover';
const gSubscriber = redis.createClient(redisOption);


gSubscriber.on('message', (channel, message) => {
  onDiscoveryNewLink(message);
})
gSubscriber.subscribe(redisNewsChannelDiscovery);


const NewsTextReader = require('./wai/news.text.reader.js');
const txtReader = new NewsTextReader('/watorvapor/ldfs/tagbot/news_text_db');

const WaiTagBot = require('./wai/wai.tagbot.js');

const wai = new WaiTagBot();



const onDiscoveryNewLink = (href) => {
  console.log('onDiscoveryNewLink::href=<',href,'>');
  txtReader.fetch(href,(txt)=>{
    onNewsText(txt,href);
  });
}

const onNewsText = (txt,href) => {
  console.log('onNewsText::txt=<',txt,'>');
  console.log('onNewsText::href=<',href,'>');
  wai.article(txt);
}

/**
 test 
**/
wai.onReady = () => {
  setTimeout(()=>{
    onDiscoveryNewLink('http://www.xinhuanet.com/politics/leaders/2019-07/22/c_1124785008.htm');
  },1000);
}
