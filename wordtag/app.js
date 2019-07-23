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
  //console.log('onNewsText::txt=<',txt,'>');
  //console.log('onNewsText::href=<',href,'>');
  let tags = wai.article(txt);
  //console.log('onNewsText::tags=<',tags,'>');
  postTwitter(txt,href,tags);
}

const Twitter = require('twitter');
const clientTwitter = new Twitter({
  consumer_key: 'cKcYfmC6niawGY7kLC9hGHafW',
  consumer_secret: 'MZ5FP6BYItZOOLuciabtuwHyiHH78bqRb1HnrE3K4PK9obDM5l',
  access_token_key: '2479678550-zBgOIqB81GtIQj99K6pyqbDlN0dqlJx8pbNCnVp',
  access_token_secret: '7gxQyigISdvfjKNgQA6VCEIOtcZMSWDyGQs04rg2NgXXq'
});
const postTwitter = (txt,href,tags) => {
  console.log('postTwitter::txt=<',txt,'>');
  console.log('postTwitter::href=<',href,'>');
  console.log('postTwitter::tags=<',tags,'>');
  const params = {screen_name: 'nodejs'};
  clientTwitter.get('statuses/user_timeline', params, (error, tweets, response) =>{
    if (error) {
      throw error;
    }
    console.log('postTwitter::tweets=<',tweets,'>');
    console.log('postTwitter::response=<',response,'>');
  });
}

/**
 test 
**/
wai.onReady = () => {
  setTimeout(()=>{
    onDiscoveryNewLink('http://www.xinhuanet.com/politics/leaders/2019-07/22/c_1124785008.htm');
  },1000);
}
