

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
        excluded_feeds:{},//A set of items unchecked and not to be included in the timeline
        excluded_topics:{},
        messages: [],//The top 20 messages displayed on the UI
        topk : 10,
        addItem: function(item_t){
            if(item_t.constructor == topic){
                if(!utils.hasItem(this.topics, item_t, 'name')){
                    this.topics.push(item_t);
                    this.items.push(item_t);
                    //Add to UI typically you want the DOM to subscribe to the changes and change on its own. 
                    $('#feedTemplate').tmpl(item_t).appendTo('#feedortopic tbody');
                    server_proxy.add_item(item_t);
                }
            }else if(item_t.constructor == feed){
                if(!utils.hasItem(this.feeds, item_t, 'name')){
                    this.feeds.push(item_t);
                    this.items.push(item_t);
                    //Add to UI
                    $('#feedTemplate').tmpl(item_t).appendTo('#feedortopic tbody');
                    server_proxy.add_item(item_t);
                }
            }else{
                throw TypeError('Wrong topic type')
            }
        },
        addMessages: function(feeds, topics){
            //TODO: Add the messages to the individual feeds
            var feedMap = {}
            var topicMap = {}
            for(var f in this.feeds){
                feedMap[this.feeds[f].name] = f
            }
            for(var t in this.topics){
                topicMap[this.topics[t].name] = t
            }
            for(var i in feeds){
                var flag = 0;
                var idx = feedMap[feeds[i].name]
                //Do an insert if the message in this 
                if(idx==undefined){
                    //The user was removed 
                    continue;
                }
                if(feeds[i].statusCode=='200'){
                   //add the message to the feed class
                   this.feeds[idx].addMessage(feeds[i])
                }
            }
            for(var i in topics){
                var flag = 0;
                var idx = topicMap[topics[i].name]
                //Do an insert if the message in this 
                if(idx==undefined){
                    //The user was removed 
                    continue;
                }
                if(topics[i].statusCode=='200'){
                   //add the message to the topic class
                   this.topics[idx].addMessage(feeds[i])
                }
            }
        },
        removeItems: function(ref){
            var t = $(ref).closest('tr').attr('type')
            if(t=='feed'){
                var rem  = feed($(ref).closest('tr').attr('name'))
                this.feeds = utils.remove(this.feeds, rem, 'name');
                this.items = utils.remove(this.items, rem, 'name');
            }else{
                var rem  = topic($(ref).closest('tr').attr('name'))
                this.topics = utils.remove(this.topics, rem, 'name');
                this.items = utils.remove(this.items, rem, 'name')
            }
            tweet_timer.display()
            //Change the UI
            $(ref).closest('tr').remove();
            //Call the database to persist changes immediately
            server_proxy.do_json_post({
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
            tweet_timer.render_display()
        },
        uncheckAll: function(ref){
            var that = this;
            if(!$(ref).attr('checked'))
                $("input[type='checkbox'][name='chckbdy']").each(function(obj){$(this).attr('checked', false); that.uncheck(this)})
            else
                $("input[type=checkbox][name='chckbdy']").each(function(obj){$(this).attr('checked', true); that.uncheck(this)})
            tweet_timer.render_display()
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
    server_proxy.get_data();
    
    
});


function stubData(){
     viewModel.addItem.call(viewModel, topic('WhiteHouse'))
     viewModel.addItem.call(viewModel, topic('NATO'))
     viewModel.addItem.call(viewModel, feed('BillClinton'))
     viewModel.addItem.call(viewModel, topic('BarackObama'))
}
