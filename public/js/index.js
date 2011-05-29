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
        itemsubscribers: [],//A list of partial functions that will update the view
        addItem: function(item_t){
            if(item_t.constructor == topic){
                if(!utils.hasItem(this.topics, item_t, 'name')){
                    this.topics.push(item_t);
                    this.items.push(item_t)
                    //Add to UI typically you want the DOM to subscribe to the changes and change on its own. 
                    $('#feedTemplate').tmpl(item_t).appendTo('#feedortopic tbody')
                }
            }else if(item_t.constructor == feed){
                if(!utils.hasItem(this.feeds, item_t, 'name')){
                    this.feeds.push(item_t);
                    this.items.push(item_t);
                    //Add to UI
                    $('#feedTemplate').tmpl(item_t).appendTo('#feedortopic tbody')
                }
            }else{
                throw TypeError('Wrong topic type')
            }
        },
        addMessages: function(message){
            this.messages.push(message);
            if(messages.length>20){
                messages.shift();
                
            }
            //change the UI
        },
        removeItems: function(ref){
            var t = $(ref).closest('tr').attr('type')
            if(t=='feed'){
                utils.remove(this.feeds, feed($(ref).closest('tr').attr('name')), 'name');
                utils.remove(this.items, feed($(ref).closest('tr').attr('name')), 'name')
            }else{
                utils.remove(this.topics, topic($(ref).closest('tr').attr('name')), 'name');
                utils.remove(this.items, topic($(ref).closest('tr').attr('name')), 'name')
            }
            $(ref).closest('tr').remove()
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
    })
   
    stubData();
    
    //Initial call to load the list of feed and topics from the backend.
    //Called when user refreshes the page or when th user is redirected after a 
    //successful oauth.
    //$('#feedTemplate').tmpl(viewModel.items).appendTo('#feedortopic tbody')
    
    
    //start the request cycle. Initiate a timer in which 
    $.ajax({
       type: "POST",
       url: "/get_tweets",
       contentType: "application/json; charset=utf-8", 
       processData: false,
       dataTypeString: 'json',
       //TO DO : Filter the checked ones only...
       data: JSON.stringify({feeds:viewModel.feeds, topics: viewModel.topics}),
       success: function(msg){
         alert( "Data Saved: " + msg );
       },
       error: function (request, status, error) {
            console.log(error) 
       }
     });
    
})

function stubData(){
     viewModel.addItem.call(viewModel, feed('Osama'))
     viewModel.addItem.call(viewModel, topic('WhiteHouse'))
     viewModel.addItem.call(viewModel, topic('NATO'))
     viewModel.addItem.call(viewModel, feed('BillClinton'))
     viewModel.addItem.call(viewModel, topic('Obama'))
}
