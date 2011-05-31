
/**
 * Server side module to make ajax calls modular.
 * */
window.server_proxy={
    
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
