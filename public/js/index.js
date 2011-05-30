//My Classes: a feed, a topic and an item(which contains all the feeds and topics)
function feed(dat){
   // A users name
   if(!(this instanceof arguments.callee))
        return new arguments.callee(dat)
   this.name = dat
   this.checked = true
   this.type = 'feed'
}
function topic(dat){
      if(!(this instanceof arguments.callee))
        return new arguments.callee(dat)
   this.name = dat
   this.checked = true
   this.type = 'topic'
}

/**
 * A clean model with all the functions to modify the model attributes.
 * Changes in model data should inform all UI listeners. Here that is 
 * faked by manually calling the UI elements you want changed after the DOM is changed.
 * Typically you want to make model data "observable" to which DOM elements can subscribe to.
 * This feature is present in a few libraries like knockout.js, backbone.js etc. 
**/
(function(){

    var viewModel = {
        feeds : [],
        topics: [],
        items: [], // List of feeds and items,
        messages: [],//messages coming in from twitter
        excluded_feeds:{},//A set of items unchecked and not to be included in the timeline
        excluded_topics:{},
        topk : 10,
        addItem: function(item_t){
            if(item_t.constructor == topic){
                if(!utils.hasItem(this.topics, item_t, 'name')){
                    this.topics.push(item_t);
                    this.items.push(item_t);
                    //Add to UI typically you want the DOM to subscribe to the changes and change on its own. 
                    $('#feedTemplate').tmpl(item_t).appendTo('#feedortopic tbody');
                    server_calls.add_item(item_t);
                }
            }else if(item_t.constructor == feed){
                if(!utils.hasItem(this.feeds, item_t, 'name')){
                    this.feeds.push(item_t);
                    this.items.push(item_t);
                    //Add to UI
                    $('#feedTemplate').tmpl(item_t).appendTo('#feedortopic tbody');
                    server_calls.add_item(item_t);
                }
            }else{
                throw TypeError('Wrong topic type')
            }
        },
        addMessages: function(feeds, topics){
            for(var i in feeds){
                var flag = 0;
                var feed_date = new Date(feeds[i].time);
                if(feeds[i].statusCode=='200'){
                    //Put only those messages that are for valid feeds
                    for(var j in this.messages){
                        if(feed_date <= this.messages[j].time && j>0){
                            feeds[i].time = feed_date
                            feeds[i].type = 'feed';
                            this.messages.splice(j,0, feeds[i]);
                            flag = 1
                            break;
                        }else if(feed_date == this.messages[j].time && j==0){
                            feeds[i].time = new Date(feeds[i].time)
                            feeds[i].type = 'feed';
                            this.messages.splice(j,0, feeds[i])
                            flag = 1
                            break;
                        }else if(feed_date < this.messages[j].time && j==0){
                            if(this.messages.length<this.topk){
                                feeds[i].time = new Date(feeds[i].time)
                                feeds[i].type = 'feed';
                                this.messages.splice(j,0, feeds[i])
                            }
                            flag = 1;//feed message is older than the oldest message
                            break
                        }
                    }
                    if(flag==0){
                     feeds[i].time = feed_date
                     feeds[i].type = 'feed';
                     this.messages.push(feeds[i])
                    }
                }
            }
        },
        removeMessages: function(ref){
            //This method is a dependent observable. meaning its execution depends on the 
            //change in the feeds and topics observables.
            for(var i=0; i<this.messages.length; i++){
                var msg  = this.messages[i]
                if(ref.type == msg.type){
                    if(ref.name == msg.name){
                        this.messages.splice(i,1);
                        i--;
                    }
                }else{
                    console.log('Not same type',ref.type)
                }
            }
            
            $('#livestream').empty();
            $('#livestream_template').tmpl(this.messages).prependTo('#livestream');
            
        },
        removeItems: function(ref){
            var t = $(ref).closest('tr').attr('type')
            if(t=='feed'){
                var rem  = feed($(ref).closest('tr').attr('name'))
                this.feeds = utils.remove(this.feeds, rem, 'name');
                this.items = utils.remove(this.items, rem, 'name');
                this.removeMessages(rem);
            }else{
                var rem  = topic($(ref).closest('tr').attr('name'))
                this.topics = utils.remove(this.topics, rem, 'name');
                this.items = utils.remove(this.items, rem, 'name')
                this.removeMessages(rem);
            }
            //Change the UI
            $(ref).closest('tr').remove();
            //Call the database to persist changes immediately
            server_calls.do_json_post({
                url: "/remove_items",
                data: {feed: t=='feed'? rem: null, topics: t=='topic'?rem: null},
                success: function(data, status){
                    if(data.message=='ok'){
                        that.update_message(data.data);
                    }else{
                        //alert("Message recieved from server: "+data.data)
                        console.log("Message recieved from server: "+data.data)
                    }
                }, 
                error: function (request, status, error) {
                    console.log("Error recieved from server: "+error) 
                    //alert("Error recieved from server: "+error)
                }
            });
        },
        uncheck: function(ref){
            var t = $(ref).closest('tr').attr('type');
            if(t=='feed'){
                var name = $(ref).closest('tr').attr('name')
                if(!$(ref).attr('checked'))
                    this.excluded_feeds[name] = 1
                else
                    delete  this.excluded_feeds[name]
            }else{
                var name  = $(ref).closest('tr').attr('name')
                if(!$(ref).attr('checked'))
                    this.excluded_feeds[name] = 1
                else
                    delete  this.excluded_feeds[name]
            }
        },
        uncheckAll: function(ref){
            var that = this;
            if(!$(ref).attr('checked'))
                $("input[type='checkbox'][name='chckbdy']").each(function(obj){$(this).attr('checked', false); that.uncheck(this)})
            else
                $("input[type=checkbox][name='chckbdy']").each(function(obj){$(this).attr('checked', true); that.uncheck(this)})
        }
    }
    window.viewModel = viewModel;
    
})()


$(document).ready(function(){
    //Bind all the event handlers that will change the model
    $('#searchbox').keydown(function(event){
        if(event.keyCode==13){
             if($('#feedortopicselect  option:selected').attr('value') =='people'){
                viewModel.addItem.call(viewModel, feed($('#searchbox').attr('value').trim()))
             }
             else{
                viewModel.addItem.call(viewModel, topic($('#searchbox').attr('value').trim()))
            }
        }
    });
    //stubData();
    //Initiate AJAX Long polling to fetch tweets
    server_calls.get_data();
    
    
});


/**
 * Main module for handling the tweets by doing AJAX long polling. This
 * will handle the XHR requests to the server in a self contained timer and update the UI
 * */
window.tweet_timer = {
    
    start: function(){
        //Start getting the tweets from the server
        var callee = arguments.callee;
        var that = this;
        server_calls.do_json_post({
            url: "/get_tweets",
            data: {feeds:viewModel.feeds, topics: viewModel.topics},
            success: function(data, status){
                if(data.message=='ok'){
                    that.update_message(data.data);
                }else{
                    //alert("Message recieved from server: "+data.data)
                    console.log("Message recieved from server: "+data.data)
                    //TODO: Deal with messages accordingly 
                    //Redirect message 
                    if(data.message=='redirect'){
                        window.location = data.location
                    }else{
                        setTimeout(callee, 1000*(viewModel.feeds.length+1));
                    }
                }
            }, 
            error: function (request, status, error) {
                console.log("Error recieved from server: "+error) 
                //alert("Error recieved from server: "+error)
            }
        });
    },
    
    update_message: function(data){
         //Update the model
         var feeds = data.feeds
         var topics = data.topics
         //splice the feeds from the server together with the those in the viewModel
         viewModel.addMessages(feeds, topics)
         this.display();
    },
    display: function(){
        //Manage the display from the model
        //Use the checked/unchecked list to display the feeds
        var msg = viewModel.messages 
        var ct = 0;
        var chosen_idx = [];
       
        for(i in msg){
            if(!viewModel.excluded_feeds[msg[i].name]){
                //The element is not unchecked and is not delelted(present in feed map)
                chosen_idx[ct++] = i;
            }
        }
        $('#livestream').empty();
        var that = this;
        var topk = viewModel.topk
        if(ct>topk){
            //The total #items minus the items in the excluded list was more than topk.
            //Initiate the scroll.
            var idx = chosen_idx.slice(0,topk);
            idx.forEach(function(i){
                $('#livestream_template').tmpl(msg[i]).prependTo('#livestream')
            })
            var last = chosen_idx.shift();
            (function(){
                if(chosen_idx.length>topk){
                   $('#livestream>li:last').remove()
                   $('#livestream_template').tmpl(msg[chosen_idx[topk-1]]).prependTo('#livestream')
                   //Remove the first from the chosen stack
                   last = chosen_idx.shift();
                   setTimeout(arguments.callee, 3000)
                }else{
                    //Fire this only when all the elements are displayed
                    msg.splice(0,Number(last)+1);
                    setTimeout(that.start.bind(that), 5000*(viewModel.feeds.length+1));
                }
                
            })()
           //remove the last elements from the model.
        }else{
            chosen_idx.forEach(function(i){
                $('#livestream_template').tmpl(msg[i]).prependTo('#livestream')
            })
             setTimeout(this.start.bind(this), 5000*(viewModel.feeds.length+1));
        }
       
    }
    
}

/**
 * Server side module to make ajax calls modular.
 * */
window.server_calls={
    
    do_json_post: function(obj){
         $.ajax({
            type: "POST",
            url: obj.url,
            contentType: "application/json; charset=utf-8", 
            processData: false,
            dataTypeString: 'json',
            //TO DO : Filter the checked ones only...
            data: JSON.stringify(obj.data),
            success: function(data, status, xhr){
                obj.success(data, status)
            }, 
             error: function (request, status, error) {
                obj.error(request, status, error) 
            }
        });
    },
    do_json_get: function(obj){
        $.getJSON(obj.url,function(data){
             obj.success(data)
        });
    },
    get_data: function(){
        //get the users data from the server
        var that = this
        this.do_json_get({
            url: "/get_data",
            success: function(data){
                if(data.message=='ok'){
                    var feeds = data.data.feeds;
                    var topics = data.data.topics;
                    feeds.forEach(function(feed_t){ viewModel.addItem(new feed(feed_t))})
                    topics.forEach(function(topic_t){ viewModel.addItem(new topic(topic_t))})
                    tweet_timer.start();//start off
                }else{
                    //alert("Message recieved from server: "+data.data)
                    console.log("Message recieved from server: "+data.data)
                    if(data.message=='redirect'){
                        window.location = data.location
                    }
                }
            } 
        });
    },
    
    add_item: function(item_t){
        //called from add_item of the view module
        
        if(item_t.constructor == topic){
           var data = {feed:null, topic: item_t}
        }else if(item_t.constructor == feed){
           var data = {feed:item_t, topic: null} 
        }
        this.do_json_post({
            url: "/add_item",
            data: data,
            success: function(data, status){
                if(data.message=='ok'){
                    console.log("Message recieved from server: "+data)
                }else{
                    //alert("Message recieved from server: "+data.data)
                    console.log("Message recieved from server: "+data)
                    //TODO: Deal with messages accordingly 
                    //Redirect message 
                    if(data.message=='redirect'){
                        window.location = data.location
                    }
                }
            }, 
            error: function (request, status, error) {
                console.log("Error recieved from server: "+error) 
                //alert("Error recieved from server: "+error)
            }
        })
        
    },
}


function stubData(){
     viewModel.addItem.call(viewModel, topic('WhiteHouse'))
     viewModel.addItem.call(viewModel, topic('NATO'))
     viewModel.addItem.call(viewModel, feed('BillClinton'))
     viewModel.addItem.call(viewModel, topic('BarackObama'))
}
