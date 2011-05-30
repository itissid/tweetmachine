(function(){
    var utils ={}
    //Testing an Array of Objects for membership
    utils.hasItem = function(arr, obj, key){
        if(Object.prototype.toString.call(arr)!='[object Array]'){
            throw TypeError('Expected an array got: '+Object.prototype.toString.call(arr))
        }
        
        var l = arr.filter(function(a){
            if(obj && a && a.hasOwnProperty(key) && obj.hasOwnProperty(key)){
                if(a[key].toString().toLowerCase() == obj[key].toString().toLowerCase())
                    return true
            }
            if(a == obj){
                return true;
            }
        });
        if(l.length>0)
            return true
        else
            return false
    }
    utils.filter = function(arr, key, value){
        
    }
    //Remove elements from an array on objects based on a non null key
    //The algorithm returns a new array
    utils.remove = function(arr, val, key){
        var b = []
        for(var i=0; arr && i<arr.length; i++){
            if(val && arr[i].hasOwnProperty(key) && val.hasOwnProperty(key)){
                 if(arr[i][key].toString().toLowerCase() != val[key].toString().toLowerCase()){
                     //b = arr.splice(0,i+1)
                     b.push(arr[i])
                     
                 }
            }
        }
        return b;
        
    }
    utils.keys = function(obj){
        var arr  = [];
        for(j in obj){
            if(obj.hasOwnProperty(j)){
                arr.push(j);
            }
        }
        return arr
    }
    //A bind utility with partials
    Function.prototype.bind = function(){
        var fn = this, args = Array.prototype.slice.call(arguments),
        object = args.shift();
        return function(){
            return fn.apply(object,
                args.concat(Array.prototype.slice.call(arguments)));
        };
    };
    
    
    window.utils = utils
})()
