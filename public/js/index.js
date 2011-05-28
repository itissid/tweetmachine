//My Classes: a feed, a topic, a item
function feed(dat){
   // A users name
   if(!(this instanceof arguments.callee))
        return new arguments.callee(dat)
   this.dat = dat
   this.checked = true
   this.type = 'feed'
}
function topic(dat){
      if(!(this instanceof arguments.callee))
        return new arguments.callee(dat)
   this.dat = dat
   this.checked = true
   this.type = 'topic'
}

/**
 * A clean model with all the functions to modify the model attributes.
 * Changes in model attributes should inform all listeners
**/
(function(){

    var viewModel = {
        feeds : [],
        topics: [],
        items: [], // List of feeds and items,
        messages: [],//messages coming in
        itemsubscribers: [],//A list of partials that will update the view
        addItem: function(item_t){
            if(item_t.constructor == topic){
                if(!utils.hasItem(this.topics, item_t, 'dat')){
                    this.topics.push(item_t);
                    this.items.push(item_t)
                    //Add to UI
                }
            }else if(item_t.constructor == feed){
                if(!utils.hasItem(this.feeds, item_t, 'dat')){
                    this.feeds.push(item_t);
                    this.items.push(item_t);
                    //Add to UI
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
        removeItems: function(){
                
        }
    }
    window.viewModel = viewModel;
    
})()




$(document).ready(function(){
    //Bind all the event handlers
    $('#searchbox').keydown(function(event){
        if(event.keyCode==13){
             if($('#feedortopicselect  option:selected').attr('value') =='people'){
                viewModel.addItem.call(viewModel, feed($('#searchbox').attr('value')))
                 $('#feedortopic tbody').empty()
                 $('#feedTemplate').tmpl(viewModel.items).appendTo('#feedortopic tbody')
             }
             else{
                viewModel.addItem.call(viewModel, topic($('#searchbox').attr('value')))
                $('#feedortopic tbody').empty()
                $('#feedTemplate').tmpl(viewModel.items).appendTo('#feedortopic tbody')
            }
             
        }
    })
    //Add DOM UI to subscribers
    
    
    
    stubData();
    
    
    
    //Initial call to load the list of feed and topics from the backend.
    //Called when user refreshes the page or when th user is redirected after a 
    //successful oauth.
    $('#feedTemplate').tmpl(viewModel.items).appendTo('#feedortopic tbody')
    
    
})

function stubData(){
     viewModel.addItem.call(viewModel, feed('Osama'))
     viewModel.addItem.call(viewModel, topic('WhiteHouse'))
     viewModel.addItem.call(viewModel, topic('NATO'))
     viewModel.addItem.call(viewModel, feed('BillClinton'))
     viewModel.addItem.call(viewModel, topic('Obama'))
}
