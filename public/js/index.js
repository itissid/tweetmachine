(function(){
    //My Classes: a feed, a topic, a item
    function feed(dat){
       // A users name
       if(!(this instanceof arguments.callee))
            return new arguments.callee(dat)
       this.dat = dat
       this.checked = true
    }
    function topic(dat){
          if(!(this instanceof arguments.callee))
            return new arguments.callee(dat)
       this.dat = dat
       this.checked = true
    }
    function item(){
          if(!(this instanceof arguments.callee))
            return new arguments.callee(dat)
       this.dat = dat
       this.checked = true
    }
    // A clean model with all the functions to modify the data attributes
    var viewModel = {
        feeds : [],
        topics: [],
        items: [], // List of feeds and items,
        messages: [],//messages coming in
        addFeed: function(feed_t){
            if(feed_t.constructor == feed){
                if(!util.hasItem(items, feed, 'dat')){
                    this.feeds.push(feed_t);
                    this.items.push(feed_t);
                    //Add to UI
                }
            }
            else{
                throw TypeError('Wrong feed type')
            }
        },
        addtopic: function(topic_t){
            if(topic_t.constructor == topic){
                if(!util.hasItem(items, topic, 'dat')){
                    this.topics.push(topic_t);
                    this.items.push(topic_t)
                    //Add to UI
                }
            }
            else{
                throw TypeError('Wrong topic type')
            }
        },
        addMessages: function(message){
            this.messages.push(message);
            if(messages.length>20){
                messages.shift();
                
            }
            //change the UI
        }
    }
    
    
})





function initiatePeriodicalUpdater(config){
	if(!config.poll_progress_uri){
		console.log('Cant begin ajax long polling. No URI specified')
		return;
	}
	handler = $.PeriodicalUpdater(config.poll_progress_uri, {
			method: config.method|| 'post',          // method; get or post
			data: config.data,              
			minTimeout: config.minTimeout||1000 ,       // starting value for the timeout in milliseconds
			maxTimeout: config.maxTimeout|| 4000,       // maximum length of time between requests
			multiplier: 1.2,          // if set to 2, timerInterval will double each time the response hasn't changed (up to maxTimeout)
			type: config.transport||'json',           // response type - text, xml, json, etc.  See $.ajax config options
			maxCalls: 0,            // maximum number of calls. 0 = no limit.
			autoStop: 0             // automatically stop requests after this many returns of the same data. 0 = disabled.
		}, function(callback_data) {
			// Handle the new data (only called when there was a change)
			config.callback(callback_data)
		});
	handler.start()
		
		
}

/**User specific function**/
function afterParse(uri){
	$.post('/reader/query_presence',{uri: uri}, function(data, status){
		if(data.feed_exists == 1){
			$('form').attr('action', '/reader/render_personal_page_after_parse')
			$('form').submit();
		}else{
			$('#parseerror>div').text('No feed was detected on this page. Please try another URI.')
			$('#parseerror').show(500, function(){
					$(this).delay(4000).hide(500);
			})
		}
	})
}
/**
 * Initialize The request to the server and 
 * set up Ajax Long polling to poll status of the parse.
 * **/
function initRequest(){
	//Initialize the request to parse the web page and fetch the job ID
	//This id is used to poll mongo for updates on the job.
	var data = $('form').serializeArray();
	var data_submit={}
	$(data).each(function(idx,obj){
			data_submit[obj.name] = obj.value;
	});
	$.post('/reader/init_parse_request',data_submit, function(data, status){
		if(data.job_id){
			//If there is a job ID just initiate the pereodic updater
			$('#parseit').progressButton('setText','Initiating parse...',0);
			initiatePeriodicalUpdater({
				data: {'job_id': data.job_id }, 
				poll_progress_uri: '/reader/poll_progress',
				
				callback: function(data){
					console.log(data)
					if(data.ststus ==0){
						$('#parseit').progressButton('setText','Queued...', 0)
					}
					if(data.status == 1){
						$('#parseit').progressButton('set',Math.round(data.progress*100))
					}
					if(data.status ==2){
						handler.stop()
						$('#parseit').progressButton('setText','Parsed!', 100)
						/**TODO: Query if the current page has a feed and display that message*/
						//Job is completed. Just 
						$('#parseit').progressButton('setText','Done', 100); 
						afterParse(data.uri);
					}
					if(data.status == 3){
						console.log('Error in processing. Job ID: '+data.job_id);
						$('#parseerror>div').text('Error in processing. Job ID: '+data.job_id)
						$('#parseerror').show(500, function(){
								$(this).delay(4000).hide(500);
						})
					}
					if(data.error){
						console.log('Error.'+data.error)
						$('#parseerror>div').text(data.error)
						$('#parseerror').show(500, function(){
								$(this).delay(4000).hide(500);
						})
					}
				}
			})
		}
		else if(data.feed_found_redirect){
			console.log(data)
			//submit to a personal page if the feed is found
			$('form').attr('action','/reader/personal_page_view')
			$('form').submit();
		}
		else if(data.error){
			$('#parseerror>div').text(data.error)
			$('#parseerror').show(500, function(){
					$(this).delay(4000).hide(500);
			})
		}
	})
}
/*
$(document).ready(function(){
	var ex1running = false;
	var count = 0;
	$('#fav-urls').click(function(){
		//form submission.
		submit();
	});
	//Initiate the autocomplete feature
	$("[name=my_url]").autocomplete('/reader/auto_complete', {
		minChars: 0,
		width: 310,
		matchContains: true,
		highlightItem: false,
		max: 3,
		parse: function(dat){
			keys_t = []
			for(k in dat)
				keys_t.push(k)
			dat_t = [];
			for(k=0; k < keys_t.length; k++)
				if(keys_t[k]!='status')
					dat_t.push({data:[keys_t[k], dat[keys_t[k]]], result: keys_t[k], value: keys_t[k] })
			return dat_t	
		},
		formatItem: function(row, i, max, value, term) {
			return row[0]+ "<br><span style='font-size: 80%;'>"+ row[1].replace(new RegExp("(" + term + ")", "gi"), "<strong>$1</strong>") +  "</span>";

		},
		formatResult: function(dat) {
			return dat[0];
		}
	});
	
	//Initiate the progress button on the Parse It dialogue
	$('#parseit').progressButton({		
		text: 'Parse it',
		postText: 'Done',
		progressText: 'Parsing',
		onComplete: function(){
		},
		scope: $('#parseit'),
		onClick: function(){
			prog = $(this).progressButton('get')
			if(prog==0){
				//Do an ajax call to initiate the parse...
				initRequest();
			
			}else if(prog==100){
				$('#parseit').progressButton('setText','Parse it!',0);
			}
		}
			
	});
	//Initiate the CSRF token sender for django
	$('html').ajaxSend(function(event, xhr, settings) {
		function getCookie(name) {
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for (var i = 0; i < cookies.length; i++) {
					var cookie = jQuery.trim(cookies[i]);
					// Does this cookie string begin with the name we want?
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}*/
		//if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
			// Only send the token to relative URLs i.e. locally.
			//xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
		//}
	/*});
	
	// Initiate the Interest gatherer
	/** Activate this code when the Oauth is completely integrated
	 * and nlp pipeline is set
	 * /
	$('#socprogress').progressButton({
		text: 'Loading',
		postText: 'Done',
		progressText: 'Loading',
		onComplete: function(){
			clearInterval(inter);
		},
		scope: $('#socprogress'),
		onClick: function(){
			//Dummy method 
			if($(this).progressButton('get')==0){
				inter = setInterval("$('#socprogress').progressButton('update',1)", 50);
			}
			if($(this).progressButton('get')==100){
				this.progressButton('set',0);
			}
		}
	})
	//initModalWindows();
	
   
})*/


