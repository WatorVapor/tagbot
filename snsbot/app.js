const redis = require('redis');
const redisOption = {
  host:'node2.ceph.wator.xyz',
  port:6379,
  family:'IPv6'
};
const redisChannelSnsBot = 'redis.channel.news.discover.multi.lang.snsbot';
const gSubscriber = redis.createClient(redisOption);


gSubscriber.on('message', (channel, message) => {
  onNewTags(channel,message);
})
gSubscriber.subscribe(redisChannelSnsBot);

const gNewLinks = [];
let gISRunning = false;

const onNewTags = (channel,msg) => {
  gNewLinks.push(msg);
  if(gNewLinks.length > 5) {
    gNewLinks.shift();
  }
  if(gISRunning === false) {
    setTimeout(onPostNewTags,1000);
  }
}

const LevelDFS = require('./LevelDFS.js');

const onPostNewTags = () => {
  if(gNewLinks.length < 1) {
    console.log('onPostNewTags:: gNewLinks=<',gNewLinks,'>');
    return;
  }
  let msg = gNewLinks[gNewLinks.length -1];
  let msgJson = JSON.parse(msg);
  gNewLinks.splice(-1);
  console.log('onPostNewTags::msgJson=<',msgJson,'>');

  let db = new LevelDFS(msgJson.linkdb);
  db.get(msgJson.href, (err, value) => {
    if(err) {
       console.log('onPostNewTags::err=<',err,'>');
      throw err;
    }
    console.log('onPostNewTags::value=<',value,'>');
    try {
      const valueJson = JSON.parse(value);
      if(valueJson.snsbot) {
        setTimeout(onPostNewTags,1000);
        return;
      }
      valueJson.snsbot = true;
      let contents = JSON.stringify(valueJson);
      db.put(msgJson.href,contents);
      postTwitter(msgJson);
    }
    catch(e) {
      console.log('onLearnNewLink_::e=<',e,'>');
    }
  });
}


let gLastPostTitterTime = new Date();
const Twitter = require('twitter');
const clientTwitter = new Twitter({
  consumer_key: 'cKcYfmC6niawGY7kLC9hGHafW',
  consumer_secret: 'MZ5FP6BYItZOOLuciabtuwHyiHH78bqRb1HnrE3K4PK9obDM5l',
  access_token_key: '2479678550-zBgOIqB81GtIQj99K6pyqbDlN0dqlJx8pbNCnVp',
  access_token_secret: '7gxQyigISdvfjKNgQA6VCEIOtcZMSWDyGQs04rg2NgXXq'
});


const  postTwitter = (msgJson) => {
  let myhref = msgJson.href;
  let tags = msgJson.tags;
  let lang = msgJson.lang;
  console.log('postTwitter::msgJson=<',msgJson,'>');
  console.log('postTwitter::tags=<',tags,'>');
  console.log('postTwitter::lang=<',lang,'>');
  let contents = '';
  for(let tag of tags) {
    contents += ' #' + tag.tag + '';
  }
  contents += '\n'
  contents += myhref;
  contents += '\n'
  if(lang === 'ja') {
    contents += '  ご覧ください https://www.wator.xyz  \n'
    contents += '\n'
    contents += '  ご覧ください https://www.wator.xyz/wai  \n'
  } else {
    contents += '  请关注 https://www.wator.xyz  \n'
    contents += '\n'
    contents += '  请关注 https://www.wator.xyz/wai  \n'    
  }
  contents += '\n'
  const postObject = {status: contents};
  console.log('postTwitter::postObject=<',postObject,'>');
  let self = this;
  clientTwitter.post('statuses/update', postObject, (error, tweets, response) => {
    gLastPostTitterTime = new Date();;
    if (error) {
      console.log('postTwitter::error=<',error,'>');
      setTimeout(onPostNewTags,1000 * 60 * 5);
      throw error;
    }
    setTimeout(onPostNewTags.bind(self),1000*60*5);
    //console.log('postTwitter::tweets=<',tweets,'>');
    //console.log('postTwitter::response=<',response,'>');
  });
}
  