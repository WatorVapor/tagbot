const redis = require('redis');
const redisOption = {
  host:'node2.ceph.wator.xyz',
  port:16379,
  password:'QfIvXWQCxnTZlEpT',
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
const gNewLinksCachMax = 100;

const onNewTags = (channel,msg) => {
  gNewLinks.push(msg);
  if(gNewLinks.length > gNewLinksCachMax) {
    gNewLinks.shift();
  }
  if(gISRunning === false) {
    setTimeout(onPostNewTags,1000);
  }
}

const LevelDFS = require('./LevelDFS.js');
let gLastPostTitterTime = new Date();

const onPostNewTags = () => {
  if(gNewLinks.length < 1) {
    console.log('onPostNewTags:: gNewLinks=<',gNewLinks,'>');
    return;
  }
  const now = new Date();
  const escape_time = now - gLastPostTitterTime;
  if(escape_time < 1000*60) {
    console.log('onPostNewTags:: escape_time=<',escape_time,'> too short!!!');
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


const Twitter = require('twitter');
const clientTwitter = new Twitter({
  consumer_key: 'cKcYfmC6niawGY7kLC9hGHafW',
  consumer_secret: '#',
  access_token_key: '#',
  access_token_secret: '#'
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
    setTimeout(onPostNewTags.bind(self),1000*60*1);
    //console.log('postTwitter::tweets=<',tweets,'>');
    //console.log('postTwitter::response=<',response,'>');
  });
}
  
