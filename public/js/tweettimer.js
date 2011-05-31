
/**
 * Main module for handling the tweets by doing AJAX long polling. This
 * will handle the XHR requests to the server in a self contained timer and update the UI
 * */
(function(){
    
var tweet_timer = {
    timer_id: null,
    disp_timer_id: null,
    start: function(){
        //Start getting the tweets from the server
        var callee = arguments.callee;
        var that = this;
        server_proxy.do_json_post({
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
         setTimeout(this.start.bind(this), 5000*(viewModel.feeds.length+1));
    },
    render_display: function(){
        if(this.disp_timer_id )
            clearTimeout(this.disp_timer_id);
        this.disp_timer_id = setTimeout(this.display, 3000);
    },
    display: function(){
        //Manage the display of the List from here
        //Cancel the display rendering if something was already running or was going to run.
        if(this.disp_timer_id)
            return
        viewModel.messages =[]
        //Splice the items from each feed by time
       
        //Cycle through all the feeds and take the message with min time stamp and 
        //fill the display array
        var flag = false;
        var f = viewModel.feeds
        var t = viewModel.topics
        var f_min_idx = new Array()
        var t_min_idx = new Array()
        for(var i in f) f_min_idx[i]=0; //An index into the messages in each feed
        for(var i in t) t_min_idx[i]=0; //An index into the messages in each topic
        //A sorted union algorithm. To add the timelines
        while(viewModel.messages.length<20){
            var max_f_timeline = -Infinity;
            var max_f_idx = -1;
            var flag = false
            for(var i in f){
                if(f[i].messages.length>0 && f_min_idx[i] < f[i].messages.length && !viewModel.excluded_feeds[f[i].name]){
                    flag = true;
                    if(f[i].messages[f_min_idx[i]].time > max_f_timeline){
                        max_f_timeline = f[i].messages[f_min_idx[i]].time
                        max_f_idx = i
                    }
                }
                
            }
            var max_t_timeline = -Infinity;
            var max_t_idx = -1;
            for(var i in t){
                if(t[i].messages.length>0 && t_min_idx[i] < t[i].messages.length && !viewModel.excluded_topics[t[i].name]){
                    flag = true;
                    if(t[i].messages[t_min_idx[i]].time > max_t_timeline){
                        max_t_timeline = t[i].messages[t_min_idx[i]].time
                        max_t_idx = i
                    }
                }
            }
            
            if(max_t_timeline> max_f_timeline){
                var max_overall = t[max_t_idx].messages[t_min_idx[max_t_idx]]
                t_min_idx[max_t_idx]++;
                viewModel.messages.push(max_overall)
            }else if(max_t_timeline< max_f_timeline){
                var max_overall = f[max_f_idx].messages[f_min_idx[max_f_idx]]
                f_min_idx[max_f_idx]++;
                viewModel.messages.push(max_overall)
            }else if(max_t_timeline== max_f_timeline && max_t_timeline != -Infinity){
                f_min_idx[max_f_idx]++;
                t_min_idx[max_t_idx]++;
                viewModel.messages.push(f[max_f_idx].messages[f_min_idx[max_f_idx]])
                viewModel.messages.push(t[max_t_idx].messages[t_min_idx[max_t_idx]])
            }
            if(flag == false)
                break
            //Add an element to msg
        }
        $('#livestream').empty();
        $('#livestream_template').tmpl(viewModel.messages ).appendTo('#livestream')
        this.disp_timer_id = null
       
    }
    
}
window.tweet_timer =tweet_timer
})()
