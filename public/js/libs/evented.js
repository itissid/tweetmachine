/**
 * A very bare bones library that helps in propogating changes in JS object
 * to connected UI elements in the DOM. This is done 
 * Changes in JS objects will cause changes in the corresponding DOM objects.
 * This helps us maintaining a MVVM architecture. At this point you can set 
 * attributes, text and HTML of DOM Elements. changing 
**/

(function(){
    //Bind function with partials
    Function.prototype.bind = function(){
        var fn = this, args = Array.prototype.slice.call(arguments),
        object = args.shift();
        return function(){
            return fn.apply(object,
                args.concat(Array.prototype.slice.call(arguments)));
        };
    };
    var keys  = function(obj){
        var keys= []
        for(i in obj){
            if(obj.hasOwnProperty(i)){
                keys.push(obj[i])
            }
        }
        return keys
    }
    var evented = {}
    //attributes, text, innerHTML are the essential 
    var observable = function(dat){
            //always Return an observable function object
            if(!(this instanceof arguments.callee))
                return new observable(dat)
            this.DOMMutators = [];
            // The list of function partials that will change DOM elements. This will be filled by apply bindings
            //once it is called;
            this.data = dat;
            var that = this;
            this.mutate = function(data_t){
                //change the data
                that.data = data_t
                //Go through the list of DOMMutators attached to this observable and call them
                
                $.each(that.DOMMutators, function(){
                    this(data_t);
                })
            }
    }
    var observableArray = function(){
        if(!(this instanceof arguments.callee))
                return new observable(dat)
        //TODO Attach an observable array
    }
    var r = new RegExp('({[^{^}]+})')
    var getAttrs = function(str){
        var m = str.match(r);
        var attrs_processed = {}
        //TODO: implement nestedKeys in data bind <div data-bind= "attr: {href: viewModel.obj.prop1, ... }">
        if(m && m.length>1){
            var attrs =eval('attrs_processed= '+m[1])
        }
        return attrs_processed;
        
    }
    var applyBindings = function(viewModel){
        //scan for all data bind objects and 
        //attach them to the viewModel variables
        var keys_t = keys(viewModel);
        var data_binds = $('[data-bind]');
        for(k in keys_t)
            var obs = viewModel[k]
        
        $.each(data_binds, function(i, value){
            var val = $(value).attr('data-bind');
            var bndg_type = val.split(':')[0]?val.split(':')[0].trim():'';
            switch(bndg_type){
                case 'attr':
                    //attribute binding
                    var attrs = getAttrs(val);
                    //For each atribute in the data-bind specification find a view model key
                    /*<a data-bind="attr: { href: url, title: details }"> key = href val = url
                     * viewModel = {url: evented.observable('default'), details: }
                     * */
                    $.each(attrs, function(key, val){
                        //All observables from view models that are atrributes
                        var obs = viewModel[val];
                        if(!obs instanceof observable){
                            //Not an observable just set it to its string representation
                            $(value).attr(key, Object.toString(obs));
                        }else{
                            $(value).attr(key, obs.data);
                            //Also make sure the model mutation 
                            obs.DOMMutators.push($(value).attr.bind($(value), key))
                        }
                    })
                    
                    break;
                case 'text':
                    //change the doms inner text
                    /*<span data-bind="text: myMessage"></span>
                     * var viewModel = {
                     *       myMessage: ko.observable() // Initially blank
                     *   };
                     * */
                    var splt = val.split(':');
                    var text_attr = '';
                    if(splt.length>1)
                        text_attr = splt[1].trim()
                    var obs = viewModel[text_attr]
                    if(!obs instanceof observable){
                        //Not an observable just set it to its string representation
                        $(value).text(Object.toString(obs));
                    }else{
                        $(value).text(obs.data);
                        //Also make sure the model mutation 
                        obs.DOMMutators.push($(value).text.bind($(value)))
                    }                    
                    break;
                    
                case 'html':
                    /**
                     * <div data-bind="html: details"></div>
                        var viewModel = {
                            details: ko.observable() // Initially blank
                        };
                     * */
                    //change the html inner text
                    break;
                case 'template':
                    
                    break;
                
            }
            
        });
    }
    evented.observable = observable
    evented.applyBindings = applyBindings
    window.evented = evented
})()

