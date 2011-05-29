
/**
 * Module dependencies.
 */

var express = require('express');
var conf = require('./config.js')
var oauth= conf.config.oauth;
var app = module.exports = express.createServer();
var sys = require('sys');
// Configuration

app.configure(function(){
  //app.set('views', __dirname + '/views');
  //app.set('view engine', 'jade');
  //Static HTML views
  app.use(express.static(__dirname + '/views'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes for CSS
app.get('/css/*', function(req,res){
  res.sendfile( '/public/stylesheets/'+req.params[0])
})
//Routes for JS
app.get('/js/*', function(req,res){
  
  res.sendfile( '/public/javascript/'+req.params[0])
})

app.get('/', function(req, res){
  console.log(req.session)
  if(req.params[0].trim()==''){
      res.render('index.html', {
        title: 'Tweet Machine'
      });
  }
});
//Oauth Flow handle
app.get('/twlogin', function(req, res){
    //Handle the twitter Oauth flow
    //Assign req.session.userid to twitterid and enter a users name in the database
    req.session.userid = 'authed client'
    
    //if not present.
})
//Handle JSON messaging for grabbing initial data
app.get('/get', function(req, res){
        //Get an authenticating user data(Oauthed user) or just some cold start data(Search API no auth) 
        res.send(getUserdata(req,res));
      
})




app.get('/lookup_users', function(req,res){
    //Lookup users 
    var lookup_url = 'http://api.twitter.com/1/users/lookup.json'
    
})
/* Session variable
 * cached_feeds_topics= {
            feed:{
                <name1>: <since_id> //A feeds since ID
                <name2>: <since_id> 
            },
            topics:{
                <topic1>: since_id1
            }
   }
   return the tweets and topics in the following way:
   {
      feeds:[
        {
         name: <name>,
         tweet: text
         },
         {
         name: <name>,
         tweet: text
         },
      ],
      topics:[]
    }
 * */
app.post('/get_tweets', function(req,res){
    var feeds = req.body.feeds;
    var topics = req.body.topics;
    var tweets = {feeds:[], topics:[]};//keep all the tweets here
    var cached_feeds_topics = req.session.cached_feeds_topics
    var time_line_lookup = 'http://api.twitter.com/1/statuses/user_timeline.json'
    //For the user maintain a since ID so that only the latest tweets get returend 
    if(!req.session.isOauthed){
         res.redirect('/connect');
         return
     }
    sys.puts("Access Tokens>>"+req.session.oauthAccessToken );
    sys.puts("Access Tokens>>"+req.session.oauthAccessTokenSecret );  
    var wrapper_feeds = function (item){
        if(!item)
            return
        var url = ''
        if(cached_feeds_topics.feed[item.name])
            url = time_line_lookup+'?screen_name='+item.name+'&since_id='+cached_feeds_topics.feed[item.name]+'&count=20'
        else
            url = time_line_lookup+'?screen_name='+item.name+'&count=20'
        
        oauth.consumer().get(url, req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
            if (error) {
                //There may be many reasons for error how to handle them?
                sys.puts(sys.inspect(error));
                //res.send("Error getting twitter data: " + sys.inspect(error), 500);
                tweets.feeds.push({
                    name: item.name,
                    tweet: t.text,
                    statusCode:error.statusCode,
                    reason: error.data.error,
                })
            }else{
                var max_id = cached_feeds_topics.feed[item.name]||-1
                for(t in data){
                    if(data.hasOwnProperty(t)){
                        if(t.id > max_id)
                            max_id = t.id
                        tweets.feeds.push({
                            name: item.name,
                            tweet: t.text,
                        })
                    }
                }
                cached_feeds_topics.feed[item.name] = max_id;
                wrapper_feeds(feeds.shift());
                res.contentType('application/json');
                res.end(JSON.stringify(tweets));
                //req.session.twitterScreenName = data["screen_name"];    
                //res.send('You are signed in: ' + req.session.twitterScreenName)
                //Redirect to index.js from here
            }  
        })
    }   
    wrapper_feeds(feeds.shift());
})

/**Oauth specific routers*/
app.get('/connect', function(req, res){

  oauth.consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
      res.send("Error getting OAuth request token : " + sys.inspect(error), 500);
    } else {  
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);      
    }
  });
});
app.get('/tweet_callback', function(req, res){
    sys.puts(">>"+req.session.oauthRequestToken);
    sys.puts(">>"+req.session.oauthRequestTokenSecret);
    sys.puts(">>"+req.query.oauth_verifier);
    oauth.consumer().getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if(error) {
        res.send("Error getting OAuth access token : " + sys.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+sys.inspect(results)+"]", 500);
    }else {
        req.session.oauthAccessToken = oauthAccessToken;
        req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
        // Right here is where we would write out some nice user stuff
        oauth.consumer().get("http://twitter.com/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
            if (error) {
                res.send("Error getting twitter screen name : " + sys.inspect(error), 500);
            }else{
                sys.puts("Authorized. Here is your data"+ sys.inspects(data))
                req.session.isOauthed = true
                req.session.twitterScreenName = data["screen_name"];  
                req.session.cached_feeds_topics = {feed: {}, topics:{}}  
                res.send('You are signed in: ' + req.session.twitterScreenName)
                //Redirect to index.js from here
            }  
        });  
    }
  });
});



app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
