const redis = require('redis');
const redisOption = {
  host:'node2.ceph.wator.xyz',
  port:6379,
  family:'IPv6'
};
const redisNewsChannelDiscovery = 'redis.channel.news.discover';
const gPublisher = redis.createClient(redisOption);

onWathNewLink = (href) => {
  console.log('onWathNewLink::href=<',href,'>');
  gPublisher.publish(redisNewsChannelDiscovery, href);
}

