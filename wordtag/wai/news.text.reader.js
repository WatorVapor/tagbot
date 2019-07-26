const http = require('http');
const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs');

const gFiltOutList = [
  'script','style','noscript'
];

module.exports = class NewsTextReader {
  constructor(path) {
    this._path = path;
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path,{ recursive: true });
    }
  }
  fetch(href,cb) {
    console.log('fetch::href=<',href,'>');
    this.cb_ = cb;
    if(href.startsWith('https://')) {
      const req = https.get(href,{timeout:1000*32},this.onHttpRequest_.bind(this)).on("error", (err) => {
        console.log('fetch::err=<',err,'>');
      });
      //req.setTimeout(1000);
    }
    if(href.startsWith('http://')) {
      const req = http.get(href,{timeout:1000*32},this.onHttpRequest_.bind(this)).on("error", (err) => {
        console.log('fetch::err=<',err,'>');
      });
      //req.setTimeout(1000);
    }
  }
  onHttpRequest_(resp) {
    resp.setEncoding('utf8');
    let body = '';
    let self = this;
    resp.on('data', (chunk) => {
      body += chunk;
    });
    resp.on('end', () => {
      self.onHttpBody_(body);
    });
  }
  onHttpBody_(body) {
    //console.log('onHttpBody_::body=<',body,'>');
    const $ = cheerio.load(body);
    //console.log('onHttpBody_::$=<',$,'>');
    this.bodyText_ = '';
    const bodyElem = $('body')[0];
    this.chouText_(bodyElem);
    //console.log('onHttpBody_::this.bodyText_=<',this.bodyText_,'>');
    if(typeof this.cb_ === 'function') {
      typeof this.cb_(this.bodyText_);
    }
    //fs.writeFileSync('./temp.text.txt',this.bodyText_ , 'utf-8');
  }
  chouText_(elem) {
    //console.log('chouText_::elem=<',elem,'>');
    if(elem.type === 'text') {
      let out = gFiltOutList.indexOf(elem.parent.type);
      let out2 = gFiltOutList.indexOf(elem.parent.name);
      if( out === -1 && out2 === -1) {
        //console.log('chouText_::elem=<',elem,'>');
        this.bodyText_ += elem.data;
      }
    }
    //console.log('chouText_::elem.type=<',elem.type,'>');
    for(let childIndex in elem.children) {
      //console.log('chouText_::childIndex=<',childIndex,'>');
      let child = elem.children[childIndex];
      this.chouText_(child);
    }
  }
}
