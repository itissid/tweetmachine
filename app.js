
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

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
app.listen(3000);
console.log("Express server listening on port %d", app.address().port);


/**Stub data by sending a JSON..**/
function getUserdata(req, res){
    if(req.session && req.session.uid && isAuth(req.session.uid)){
        //Load data from mongoDB for the authed user
    }else{
        //Probably an initial request just send some dummy data 
        res.send({
            topics: ['#libya', '#Pakistan','#Obama'],
            feeds: ['@BarackObama','@MrSarkozy', '@charliesheen'  ]
        })
    }
}
function isAuth(userID){
    return false;
}
function saveUser(userName){
    //MongoDB handler to save a userName if not already present
}
