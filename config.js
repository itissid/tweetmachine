var oauth = require('oauth');
exports.config = {}
exports.config.oauth = oauth
exports.config.oauth._twitterConsumerKey = "XXXXXX";
exports.config.oauth.twitterConsumerSecret = "XXXXX";
exports.config.oauth.consumer = function() {
  return new oauth.OAuth(
    "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token", 
    exports.config.oauth._twitterConsumerKey, exports.config.oauth.twitterConsumerSecret, "1.0A", "http://204.232.211.180:3000/tweet_callback", "HMAC-SHA1");   
}
exports.config.messages ={
        'redirect_message': {'message': 'redirect', 'location':''},
        'ok_message':{'message': 'ok', 'data': null },
        'error': {'message': 'error', 'data': null}
}

exports.config.dateformatter = new RegExp('([a-zA-Z]+)\\s+([a-zA-Z]+)\\s+([0-9]+)\\s+([0-9:]+)\\s+[0-9\\+]+\\s+([0-9]+)')

exports.utils = {
        'keys' : function(obj){
            var arr  = [];
            for(j in obj){
                if(obj.hasOwnProperty(j)){
                    arr.push(j);
                }
            }
            return arr
        }
}
