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
