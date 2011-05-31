//My Classes: a feed, a topic and an item(which contains all the feeds and topics)
function feed(dat){
   // A users name
    if(!(this instanceof arguments.callee))
        return new arguments.callee(dat)
    this.name = dat
    this.checked = true
    this.type = 'feed'
    this.messages = []
    this.addMessage = function(feed_t){
        //Class method to add feeds
        var feed_date = new Date(feed_t.time);
        var flag = 0;
        for(var j in this.messages){
            if(feed_date >= this.messages[j].time && j<this.messages.length-1){
                //Splice anything that is not older than the oldest
                feed_t.time = feed_date
                feed_t.type = 'feed';
                this.messages.splice(j,0, feed_t);
                flag = 1
                break;
            }else if(feed_date == this.messages[j].time && j==this.messages.length-1){
                //splice anything that is as old as the oldest
                feed_t.time = new Date(feed_t.time)
                feed_t.type = 'feed';
                this.messages.splice(j,0, feed_t)
                flag = 1
                break;
            }else if(feed_date > this.messages[j].time && j==this.messages.length-1){
                //splice anything that is the oldee than the oldest only if the array is not full
                if(this.messages.length < viewModel.topk){
                    feed_t.time = new Date(feed_t.time)
                    feed_t.type = 'feed';
                    this.messages.splice(j,0, feed_t)
                }
                flag = 1;//feed message is older than the oldest message
                break
            }
        }
        if(flag==0){
         feed_t.time = feed_date
         feed_t.type = 'feed';
         this.messages.push(feed_t)
        }
    }
}
function topic(dat){
      if(!(this instanceof arguments.callee))
        return new arguments.callee(dat)
   this.name = dat
   this.checked = true
   this.type = 'topic'
   this.messages = []
   this.addMessage = function(topic_t){
        //Class method to add topics
        var topic_date = new Date(topic_t.time);
        var flag = 0;
        for(var j in this.messages){
            if(topic_date >= this.messages[j].time && j<this.messages.length){
                topic_t.time = topic_date
                topic_t.type = 'topic';
                this.messages.splice(j,0, topic_t);
                flag = 1
                break;
            }else if(topic_date == this.messages[j].time && j==this.messages.length){
                topic_t.time = new Date(topic_t.time)
                topic_t.type = 'topic';
                this.messages.splice(j,0, topic_t)
                flag = 1
                break;
            }else if(topic_date > this.messages[j].time && j==this.messages.length){
                if(this.messages.length < viewModel.topk){
                    topic_t.time = new Date(topic_t.time)
                    topic_t.type = 'topic';
                    this.messages.splice(j,0, topic_t)
                }
                flag = 1;//topic message is older than the oldest message
                break
            }
        }
        if(flag==0){
         topic_t.time = topic_date
         topic_t.type = 'topic';
         this.messages.push(topic_t)
        }
   }
}
