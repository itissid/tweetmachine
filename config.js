var oauth = require('oauth');
exports.config = {}
exports.config.oauth = oauth
exports.config.oauth._twitterConsumerKey = "uW09Ge8SIMoQaY5VVNewcg";
exports.config.oauth.twitterConsumerSecret = "laEMFHk020elyfUxbPcX3vUH0CZqceXR2gTb9XAHxbY";
exports.config.oauth.consumer = function() {
  return new oauth.OAuth(
    "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token", 
    exports.config.oauth._twitterConsumerKey, exports.config.oauth.twitterConsumerSecret, "1.0A", "http://204.232.211.180:3000/tweet_callback", "HMAC-SHA1");   
}
