const WaiTagBot = require('./wai/wai.tagbot.js');
const LevelDFS = require('./LevelDFS.js');
//console.log('::LevelDFS=<',LevelDFS,'>');
const redis = require('redis');
const redisOption = {
  host:'node2.ceph.wator.xyz',
  port:6379,
  family:'IPv6'
};
const redisNewsChannelDiscovery = 'redis.channel.news.discover.multi.lang';
const gSubscriber = redis.createClient(redisOption);


const iConstSNSEscapeTime = 1000*1;

module.exports = class TagBot {
  constructor() {
    this.wai_ = new WaiTagBot();
    this.gNewLinks_ = [];
    let self = this;
    gSubscriber.on('message', (channel, message) => {
      self.onDiscoveryNewLink_(message);
    })
    gSubscriber.subscribe(redisNewsChannelDiscovery);
    //this.hrefdb_ = new LevelDFS(dbPath);
    //this.textdb_ = new LevelDFS(textdb);
    
    /**
     test
    **/
    this.wai_.onReady = () => {
      setTimeout(()=>{
        let msg = {
          lang:'ja',
          href:'https://headlines.yahoo.co.jp/hl?a=20190805-00000106-kyodonews-int',
          linkdb:'/watorvapor/ldfs/tagbot/ja/news_discovery_db',
          textdb:'/watorvapor/ldfs/tagbot/ja/news_text_contents_db'
        };
        self.onDiscoveryNewLink_(JSON.stringify(msg));
      },1000*2);
    }
  }
  onDiscoveryNewLink_ (msg){
    this.gNewLinks_.push(msg);
    if(this.gNewLinks_.length > 5) {
      this.gNewLinks_.shift();
    }
    setTimeout(this.onLearnNewLink_.bind(this),1000);
  }
  onLearnNewLink_ () {
    const now = new Date();
    const escape = now - gLastPostTitterTime;
    if(escape < iConstSNSEscapeTime){
      console.log('onLearnNewLink_:: too busy this.gNewLinks_=<',this.gNewLinks_,'>');
      console.log('onLearnNewLink_:: escape=<',escape,'>');
      console.log('onLearnNewLink_:: now=<',now.toUTCString(),'>');
      return;
    }
    if(this.gNewLinks_.length < 1) {
      console.log('onLearnNewLink_:: this.gNewLinks_=<',this.gNewLinks_,'>');
      return;
    }
    let msg = this.gNewLinks_[this.gNewLinks_.length -1];
    let msgJson = JSON.parse(msg);
    let lang = msgJson.lang;
    let href = msgJson.href;
    console.log('onLearnNewLink_::href=<',href,'>');
    this.gNewLinks_.splice(-1);
    console.log('onLearnNewLink_:: this.gNewLinks_=<',this.gNewLinks_,'>');
    let self = this;
    let dbPath = '/watorvapor/ldfs/tagbot/' + lang + '/news_discovery_db';
    console.log('onLearnNewLink_:: dbPath=<',dbPath,'>');
    let db = new LevelDFS(dbPath);
    db.get(href, (err, value) => {
      if(err) {
         console.log('onLearnNewLink_::err=<',err,'>');
        throw err;
      }
      console.log('onLearnNewLink_::value=<',value,'>');
      try {
        const valueJson = JSON.parse(value);
        if(valueJson.twitter) {
          setTimeout(self.onLearnNewLink_.bind(self),1000);
          return;
        }
        valueJson.twitter = true;
        let contents = JSON.stringify(valueJson);
        db.put(href,contents);
      }
      catch(e) {
        console.log('onLearnNewLink::e=<',e,'>');
        let contents = JSON.stringify({href:href,discover:true,twitter:true});
        db.put(href,contents);
      }
      const txtReader = new NewsTextReader(self.textdb_);
      txtReader.fetch(href,(txt,myhref)=>{
        self.onNewsText_(txt,myhref);
      });
    });
  }
  onNewsText_(txt,myhref) {
    //console.log('onNewsText::txt=<',txt,'>');
    //console.log('onNewsText::myhref=<',myhref,'>');
    let tags = wai.article(txt);
    //console.log('onNewsText::tags=<',tags,'>');
    if(tags.length > 8) {
      this.postTwitter_(myhref,tags);
      return;
    }
    setTimeout(this.onLearnNewLink_.bind(this),1000);
  }

  postTwitter_ (myhref,tags){
    console.log('postTwitter::myhref=<',myhref,'>');
    console.log('postTwitter::tags=<',tags,'>');
}


