
/**
 * Specs /* 
 * Per user data document:
 * user_feeds_topics= {
            feeds:{
                <name1>: <since_id>, //A feeds since ID
                <name2>: <since_id> 
            },
            topics:{
                <topic1>: since_id1
            }
     
   }
   return the tweets and topics in the following spec:
   {
      feeds:[
        {
         name: <name>,
         tweet: text, 
         date: <Date>
         },
         {
         name: <name>,
         tweet: text,
         date: <Date>
         },
      ],
      topics:[]
    }
 * */

var express = require('express');
var conf = require('./config.js');
var oauth= conf.config.oauth;
var messages = conf.config.messages
var app = module.exports = express.createServer();
var utils = conf.utils;
var dateformatter = conf.config.dateformatter 
var sys = require('sys');
// Configuration

/*
 * tempdb ={id1:{feeds: [], topics:[]}, id2: {...}, ... }
 * */
var temp_db = {}


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
        title: 'Welcome to the tweet machine'
      });
  }
});

//TODO: Improve search
app.get('/lookup_users', function(req,res){
    //Lookup users 
    var lookup_url = 'http://api.twitter.com/1/users/lookup.json'
    
})

app.post('/remove_items', function(req,res){
    //Remove tweets for a user
    if(!req.session.isOauthed || !req.session.oauthAccessToken|| !req.session.oauthAccessTokenSecret 
            || !temp_db[req.session.twitterScreenName]){
         res.contentType('application/json');
         var msg = messages.redirect_message;
         msg.location = '/connect'
         res.end(JSON.stringify(msg));
         return
    }
    var user_feeds_topics = temp_db[req.session.twitterScreenName]
    var feed = req.body.feed;
    if(feed){
        var keys_cached = utils.keys(user_feeds_topics.feeds)
        keys_cached.forEach(function(key){
            if(key == feed.name){
                sys.puts("Removing feed for user "+key)
                delete user_feeds_topics.feeds[key]//Remove timeline for people that might be removed 
            }
        })
    }
    var topic = req.body.topic
    if(topic){
        var keys_cached = utils.keys(user_feeds_topics.topics)
        keys_cached.forEach(function(key){
            if(key == topic.name){
                sys.puts("Removing feed for user "+key)
                delete user_feeds_topics.topics[key]//Remove timeline for people that might be removed 
            }
        })
    }
});
app.post('/add_item', function(req,res){
    //Add a user to the data base immediately
     if(!req.session.isOauthed || !req.session.oauthAccessToken|| !req.session.oauthAccessTokenSecret 
            || !temp_db[req.session.twitterScreenName]){
         res.contentType('application/json');
         var msg = messages.redirect_message;
         msg.location = '/connect'
         res.end(JSON.stringify(msg));
         return
    }   
    var user_feeds_topics = temp_db[req.session.twitterScreenName]
    var feed = req.body.feed
    var topic = req.body.topic
    if(feed)
        user_feeds_topics.feeds[feed.name] = 0
    if(topic)
        user_feeds_topics.topics[topic.name] = 0
    res.contentType('application/json');
    var msg = messages.ok_message
    msg.data = 'Added Items'
    res.end(JSON.stringify(msg)); 
})
app.get('/get_data', function(req,res){
   
    //If the user is not oauthed make sure you redirect him to the oauthed page
    if(!req.session.isOauthed || !req.session.oauthAccessToken|| !req.session.oauthAccessTokenSecret 
            || !temp_db[req.session.twitterScreenName]){
         res.contentType('application/json');
         var msg = messages.redirect_message;
         msg.location = '/connect'
         res.end(JSON.stringify(msg));
         return
    }
    var user_feeds_topics = temp_db[req.session.twitterScreenName]
    var data ={'feeds': utils.keys(user_feeds_topics.feeds), 'topics':  utils.keys(user_feeds_topics.topics)}
    res.contentType('application/json');
    var msg = messages.ok_message
    msg.data = data
    res.end(JSON.stringify(msg));    
})

app.post('/get_tweets', function(req,res){
   
    //If the user is not oauthed make sure you redirect him to the oauthed page
    if(!req.session.isOauthed || !req.session.oauthAccessToken|| !req.session.oauthAccessTokenSecret 
            || !temp_db[req.session.twitterScreenName]){
         res.contentType('application/json');
         var msg = messages.redirect_message;
         msg.location = '/connect'
         res.end(JSON.stringify(msg));
         return
    }
    //At this point the user is Oauthed and we can send him the data
    var feeds = req.body.feeds;
    var topics = req.body.topics;
    var tweets = {feeds:[], topics:[]};//keep all the tweets here
    
    var user_feeds_topics = temp_db[req.session.twitterScreenName]
    var time_line_lookup = 'http://api.twitter.com/1/statuses/user_timeline.json'
    sys.puts("Access Tokens>>"+req.session.oauthAccessToken );
    sys.puts("Access Tokens>>"+req.session.oauthAccessTokenSecret );  
    var keys_cached = utils.keys(user_feeds_topics.feeds)
    var include_keys = {};//What were feeds whose timeline were requested
    feeds.forEach(function(feed){
        include_keys[feed.name] = 1
    })
    keys_cached.forEach(function(key){
        if(!include_keys[key]){
            sys.puts("Removing feed for user "+key)
            delete user_feeds_topics.feeds[key]//Remove timeline for people that might be removed 
        }
    })
    var wrapper_feeds = function (item){
        if(!item){
            res.contentType('application/json');
            var msg = messages.ok_message
            msg.data = tweets
            res.end(JSON.stringify(msg));
            return
        }
        var url = ''
        if(user_feeds_topics.feeds[item.name])
            url = time_line_lookup+'?screen_name='+item.name+'&since_id='+user_feeds_topics.feeds[item.name]+'&count=20'
        else
            url = time_line_lookup+'?screen_name='+item.name+'&count=20'
        //I should try the streaming API. I need to make 1 request only...
        oauth.consumer().get(url, req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
            if (error) {
                //There may be many reasons for error how to handle them?
                //TODO:Handle Error code 400(Rate limit exceeded) differently from 401(Private timeline) and 404(Not found)
                //400 means you return an error message to the server for the others just indicate in the messages that 
                //you did not get them..
                sys.puts(sys.inspect(error));
                if(error){
                    if(error.statusCode && error.data.error && error.statusCode!=400){
                        tweets.feeds.push({
                            name: item.name,
                            tweet: t.text,
                            statusCode:error.statusCode,
                            reason: error.data.error,
                        });
                    }else{
                        //Some error we do not know
                        sys.puts('>> Error from Oauth request: '+sys.inspect(error))
                    }
                }
                wrapper_feeds(feeds.shift());
            }else{
                var max_id = user_feeds_topics.feeds[item.name]||0
                data = JSON.parse(data)
                if(data[0] && data[0].user){
                    sys.puts('**Got some tweets for @'+data[0].user.screen_name);
                }
                for(t in data){
                    if(data.hasOwnProperty(t)){
                        if(data[t].id > max_id)
                            max_id = data[t].id
                        var date = data[t].created_at;0
                        var match = date.match(dateformatter);
                        date = match.slice(1).join(' ');
                        tweets.feeds.push({
                            name: item.name,
                            tweet: data[t].text,
                            statusCode:'200',
                            time: date
                        })
                    }
                }
                //update the since id to recieve only recent feeds
                user_feeds_topics.feeds[item.name] = max_id;
                wrapper_feeds(feeds.shift());
            } 
            
        })
    }   
    wrapper_feeds(feeds.shift());
})
app.get('/logout', function(req,res){
    req.session.isOauthed = false 
    req.session.oauthAccessToken= null 
    req.session.oauthAccessTokenSecret = null
    res.redirect('/')
})
/**Oauth specific routers*/
app.get('/connect', function(req, res){
  sys.puts('In Connect.')
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
        //res.send("Error getting OAuth access token : " + sys.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+sys.inspect(results)+"]", 500);
        res.contentType('text/html');
        res.redirect('/error.html');
    }else {
        req.session.oauthAccessToken = oauthAccessToken;
        req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
        // Right here is where we would write out some nice user stuff
        oauth.consumer().get("http://twitter.com/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
            if (error) {
               res.contentType('text/html');
               res.redirect('/error.html');
            }else{
                req.session.isOauthed = true;
                data = JSON.parse(data);
                req.session.twitterScreenName = data["screen_name"]; 
                sys.puts("Authorized. Logged in for user: "+ data["screen_name"]);
                if(!temp_db[req.session.twitterScreenName] )
                    //TODO: Persist this to mongo later
                    temp_db[req.session.twitterScreenName] = {feeds: {}, topics:{}}  
                else{
                    var user_feeds_topics = temp_db[req.session.twitterScreenName];
                    //TODO: Persist this to mongo later
                    //initialize the user's topic feeds to be resent again
                    for(f in user_feeds_topics.feeds){
                        user_feeds_topics.feeds[f] = 0;
                    }
                    for(t in user_feeds_topics.topics){
                        user_feeds_topics.topics[t] = 0;
                    }
                }
                res.contentType('text/html');
                res.redirect('/tweetmachine.html');
            }  
        });  
    }
  });
});



app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
