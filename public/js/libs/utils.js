(function(){
    var utils ={}
    //Array of items
    utils.hasItem = function(arr, obj, key){
        if(Object.prototype.toString.call(arr)!='[object Array]'){
            throw TypeError('Expected an array got: '+Object.prototype.toString.call(arr))
        }
        
        var l = arr.filter(function(a){
            if(obj && a && a.hasOwnProperty(key) && obj.hasOwnProperty(key)){
                if(a[key] == obj[key])
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
    window.utils = utils
})()
