const redis = require('redis');
const redisOption = {
  host:'node2.ceph.wator.xyz',
  port:6379,
  family:'IPv6'
};
const redisChannelSnsBot = 'redis.channel.news.discover.multi.lang.snsbot';
const gSubscriber = redis.createClient(redisOption);

let gLastPostTitterTime = new Date();
const Twitter = require('twitter');
const clientTwitter = new Twitter({
  consumer_key: 'cKcYfmC6niawGY7kLC9hGHafW',
  consumer_secret: 'MZ5FP6BYItZOOLuciabtuwHyiHH78bqRb1HnrE3K4PK9obDM5l',
  access_token_key: '2479678550-zBgOIqB81GtIQj99K6pyqbDlN0dqlJx8pbNCnVp',
  access_token_secret: '7gxQyigISdvfjKNgQA6VCEIOtcZMSWDyGQs04rg2NgXXq'
});


const  postTwitter_ = (myhref,tags){
    console.log('postTwitter::myhref=<',myhref,'>');
    console.log('postTwitter::tags=<',tags,'>');
    let contents = '';
    for(let tag of tags) {
      contents += ' #' + tag.tag + '';
    }
    contents += '\n'
    contents += '\n'
    contents += '\n'
    contents += myhref;
    contents += '\n';
    contents += '\n'
    contents += '\n'
    contents += '  请关注 https://www.wator.xyz  \n'
    contents += '\n'
    contents += '\n'
    contents += '\n'
    contents += '  请关注 https://www.wator.xyz/wai  \n'
    contents += '\n'
    contents += '\n'
    contents += '\n'
    const postObject = {status: contents};
    console.log('postTwitter::postObject=<',postObject,'>');
    let self = this;
    clientTwitter.post('statuses/update', postObject, (error, tweets, response) => {
      gLastPostTitterTime = new Date();;
      if (error) {
        console.log('postTwitter::error=<',error,'>');
        setTimeout(self.onLearnNewLink_.bind(self),1000 * 60 * 5);
        throw error;
      }
      setTimeout(self.onLearnNewLink_.bind(self),1000*60*5);
      //console.log('postTwitter::tweets=<',tweets,'>');
      //console.log('postTwitter::response=<',response,'>');
    });
  }
  