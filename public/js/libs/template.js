//Parse a template with some data and attach observables where needed
(function(){
    /*Compile a template. Very simple non nested templates at the moment
     * TODO: Add function expressions that return a template for nested stuff
     * */
    var supportedTags = {'code': 1, 'kbd': 1, 'font': 1, 'noscript': 1, 'style': 1, 'img': 1, 'title': 1, 'menu': 1, 'tt': 1, 'tr': 1, 'param': 1, 'li': 1, 'tfoot': 1, 'th': 1, 'input': 1, 'td': 1, 'dl': 1, 'blockquote': 1, 'fieldset': 1, 'big': 1, 'dd': 1, 'abbr': 1, 'optgroup': 1, 'dt': 1, 'button': 1, 'isindex': 1, 'p': 1, 'small': 1, 'div': 1, 'dir': 1, 'em': 1, 'frame': 1, 'meta': 1, 'sub': 1, 'bdo': 1, 'label': 1, 'acronym': 1, 'sup': 1, 'body': 1, 'basefont': 1, 'base': 1, 'br': 1, 'address': 1, 'strong': 1, 'legend': 1, 'ol': 1, 'script': 1, 'caption': 1, 's': 1, 'col': 1, 'h2': 1, 'h3': 1, 'h1': 1, 'h6': 1, 'h4': 1, 'h5': 1, 'table': 1, 'select': 1, 'noframes': 1, 'span': 1, 'area': 1, 'dfn': 1, 'strike': 1, 'cite': 1, 'thead': 1, 'head': 1, 'option': 1, 'form': 1, 'hr': 1, 'var': 1, 'link': 1, 'b': 1, 'colgroup': 1, 'ul': 1, 'applet': 1, 'del': 1, 'iframe': 1, 'pre': 1, 'frameset': 1, 'ins': 1, 'tbody': 1, 'html': 1, 'samp': 1, 'map': 1, 'object': 1, 'a': 1, 'center': 1, 'textarea': 1, 'i': 1, 'q': 1, 'u': 1}
    var supportedAttributes = {'code': 1, 'text': 1, 'onreset': 1, 'cols': 1, 'datetime': 1, 'disabled': 1, 'accept-charset': 1, 'shape': 1, 'usemap': 1, 'alt': 1, 'compact': 1, 'onload': 1, 'style': 1, 'title': 1, 'valuetype': 1, 'onselect': 1, 'onmousemove': 1, 'valign': 1, 'onsubmit': 1, 'onkeypress': 1, 'rules': 1, 'nohref': 1, 'onmouseover': 1, 'background': 1, 'scrolling': 1, 'name': 1, 'summary': 1, 'noshade': 1, 'coords': 1, 'onkeyup': 1, 'dir': 1, 'frame': 1, 'codetype': 1, 'ismap': 1, 'onchange': 1, 'hspace': 1, 'vlink': 1, 'for': 1, 'selected': 1, 'rev': 1, 'label': 1, 'content': 1, 'version': 1, 'rel': 1, 'onfocus': 1, 'charoff': 1, 'method': 1, 'alink': 1, 'onkeydown': 1, 'codebase': 1, 'noresize': 1, 'span': 1, 'src': 1, 'language': 1, 'standby': 1, 'longdesc': 1, 'maxlength': 1, 'cellpadding': 1, 'tabindex': 1, 'color': 1, 'colspan': 1, 'accesskey': 1, 'height': 1, 'href': 1, 'nowrap': 1, 'size': 1, 'rows': 1, 'checked': 1, 'bgcolor': 1, 'start': 1, 'onmouseup': 1, 'scope': 1, 'scheme': 1, 'type': 1, 'cite': 1, 'onblur': 1, 'onmouseout': 1, 'link': 1, 'hreflang': 1, 'onunload': 1, 'target': 1, 'align': 1, 'value': 1, 'headers': 1, 'vspace': 1, 'declare': 1, 'classid': 1, 'defer': 1, 'prompt': 1, 'accept': 1, 'onmousedown': 1, 'char': 1, 'border': 1, 'id': 1, 'axis': 1, 'rowspan': 1, 'media': 1, 'charset': 1, 'archive': 1, 'readonly': 1, 'onclick': 1, 'cellspacing': 1, 'profile': 1, 'multiple': 1, 'object': 1, 'action': 1, 'http-equiv': 1, 'marginheight': 1, 'data': 1, 'class': 1, 'frameborder': 1, 'enctype': 1, 'lang': 1, 'clear': 1, 'face': 1, 'marginwidth': 1, 'ondblclick': 1, 'width': 1, 'abbr': 1}
    var reservedWords = {}
    var compile = function(templ){
        /*if(Object.prototype.toString.call(templ) == "[object Object]"){
            
        }*/
    }
    var compile_helper = function(templ){
            
    }
    
})
