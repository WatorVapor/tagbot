const http = require('http');
const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs');

const LevelDFS = require('./LevelDFS.js');
//console.log('::LevelDFS=<',LevelDFS,'>');

const redis = require('redis');
const redisOption = {
  host:'node2.ceph.wator.xyz',
  port:6379,
  family:'IPv6'
};
const redisNewsChannelDiscovery = 'redis.channel.news.discover.multi.lang';
const gPublisher = redis.createClient(redisOption);



module.exports = class NewsPumper {
  constructor(seed,dbPath,lang) {
    this.seed_ = seed;
    this.dbPath_ = dbPath;
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath,{ recursive: true });
    }
    this.db_ = new LevelDFS(dbPath);
    this.lang_ = lang;
    this.lastReadTime_ = new Date();
  }
  turn() {
    this.globalLoopIndex_ = 0;
    let self = this;
    setTimeout(()=>{
      self.readNews_();
    },1000);
    setTimeout(()=> {
      self.onCheckTaskRun_();
    },1000*60*10);
  }
  readNews_(){
    this.lastReadTime_ = new Date();
    let self = this;
    const req = https.get(this.seed_[this.globalLoopIndex_],{timeout:1000*5},(resp)=> {
      resp.setEncoding('utf8');
      let body = '';
      resp.on('data', (chunk) => {
        body += chunk;
      });
      resp.on('end', () => {
        self.onHttpBody_(body);
      });      
    }).on("error", (err) => {
      console.log('readNews_::err=<',err,'>');
    });
  }
  onHttpBody_(body) {
    const $ = cheerio.load(body);
    let link = $('a');
    //console.log('onHttpBody_::link=<',link,'>');
    let linkKey = Object.keys(link);
    //console.log('onHttpBody_::linkKey=<',linkKey,'>');
    for(let i = 0;i < linkKey.length;i++) {
      let key = linkKey[i];
      let linkOne = link[key];
      //console.log('onHttpBody_::linkOne=<',linkOne,'>');
      if(linkOne.attribs && linkOne.attribs.href) {
        let href = linkOne.attribs.href;
        //console.log('onHttpBody_::href=<',href,'>');
        if(href.startsWith('http://') || href.startsWith('https://')) {
          //console.log('onHttpBody_::href=<',href,'>');
          this.onWatchLink_(href);
        } else {
          //console.log('onHttpBody_::href=<',href,'>');
        }
      }
    }
    if(this.globalLoopIndex_ < this.globalLoopIndex_.length) {
      this.globalLoopIndex_++;
      this.readNews_();
    } else {
      const now = new Date();
      console.log('onHttpBody_::now=<',now.toUTCString(),'>');
      console.log('wait 5 min for next loop ...');
      let self = this;
      setTimeout(()=> {
        this.globalLoopIndex_ = 0;
        self.readNews_();
      },1000*60 * 5);
    }
  }
  
  
  onWatchLink_(href){
    //console.log('onWatchLink_::href=<',href,'>');
    let self = this;
    this.db_.get(href, (err, value) => {
      //console.log('onWatchLink_::err=<',err,'>');
      if (err && err.notFound) {
        let contents = JSON.stringify({href:href,discover:true});
        self.db_.put(href,contents);
        self.onWathNewLink_(href);
        return;
      }
      //console.log('onWatchLink_::value=<',value,'>');
    });
  }
  onWathNewLink_(href){
    console.log('onWathNewLink_::href=<',href,'>');
    const now = new Date();
    console.log('onWathNewLink_::now=<',now.toUTCString(),'>');
    gPublisher.publish(redisNewsChannelDiscovery, JSON.stringify({href:href,lang:this.lang_}));
  }

  onCheckTaskRun_ () {
    const now =  new Date();
    const escape  =  now - this.lastReadTime_;
    console.log('onCheckTaskRun_::escape=<',escape,'>');
    if(escape > 1000*60*10) {
      this.globalLoopIndex_ = 0;
      this.readNews_();    
    }
    setTimeout(this.onCheckTaskRun_.bind(this),1000*60*10);
  };


}
