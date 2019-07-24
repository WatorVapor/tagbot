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


const LevelDFS = require('./LevelDFS.js');
//console.log('::LevelDFS=<',LevelDFS,'>');
const db = new LevelDFS('/watorvapor/ldfs/tagbot/news_discovery_db');
const onDiscoveryNewLink = (href) => {
  console.log('onDiscoveryNewLink::href=<',href,'>');
  db.get(href, (err, value) => {
    if(err) {
      throw err;
    }
    console.log('onDiscoveryNewLink::value=<',value,'>');
    try {
      const valueJson = JSON.parse(value);
      if(valueJson.twitter) {
        return;
      }
      valueJson.twitter = true;
      let contents = JSON.stringify(valueJson);
      db.put(href,contents);
    }
    catch(e) {
      console.log('onDiscoveryNewLink::e=<',e,'>');
      let contents = JSON.stringify({href:href,discover:true,twitter:true});
      db.put(href,contents);
    }
    txtReader.fetch(href,(txt)=>{
    onNewsText(txt,href);
    });
  });
}



const onNewsText = (txt,href) => {
  //console.log('onNewsText::txt=<',txt,'>');
  //console.log('onNewsText::href=<',href,'>');
  let tags = wai.article(txt);
  //console.log('onNewsText::tags=<',tags,'>');
  postTwitter(href,tags);
}



const Twitter = require('twitter');
const clientTwitter = new Twitter({
  consumer_key: 'cKcYfmC6niawGY7kLC9hGHafW',
  consumer_secret: 'MZ5FP6BYItZOOLuciabtuwHyiHH78bqRb1HnrE3K4PK9obDM5l',
  access_token_key: '2479678550-zBgOIqB81GtIQj99K6pyqbDlN0dqlJx8pbNCnVp',
  access_token_secret: '7gxQyigISdvfjKNgQA6VCEIOtcZMSWDyGQs04rg2NgXXq'
});
const postTwitter = (href,tags) => {
  console.log('postTwitter::href=<',href,'>');
  console.log('postTwitter::tags=<',tags,'>');
  let contents = '';
  for(let tag of tags) {
    contents += ' #' + tag.tag + '';
  }
  contents += '\n'
  contents += '\n'
  contents += '\n'
  contents += href;
  contents += '\n';
  contents += '\n'
  contents += '\n'
  contents += '  Powered by https://www.wator.xyz  \n'
  contents += '\n'
  contents += '\n'
  contents += '\n'
  const postObject = {status: contents};
  console.log('postTwitter::postObject=<',postObject,'>');
  clientTwitter.post('statuses/update', postObject, (error, tweets, response) => {
    if (error) {
      throw error;
    }
    //console.log('postTwitter::tweets=<',tweets,'>');
    //console.log('postTwitter::response=<',response,'>');
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

