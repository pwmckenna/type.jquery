(function($){
    var MAX_DELAY = 150;
    function assert(condition, err) { if(!condition)console.error(err); }
    function decodeChar(ch) {
        if(ch === '\n') ch = '<br>';
        if(ch === '\r') chr = '<br>';
        return ch;
    }
    function getCharacterDelay(ch) {
        var delay;
        if(!ch.match(/[a-z ]/i))
            delay = Math.floor(Math.random() * 1000) + MAX_DELAY;
        else 
            delay = 0;
        console.log(ch, delay);
        return delay;
    }
    function getRandomDelay() {
        var normal =Math.floor(Math.random() * MAX_DELAY);
        var slow = Math.random() > 0.9 ? 300 : 0;
        var slower = Math.random() > 0.985 ? 1200 : 0;
        return normal + slow + slower;
    }

    function composeDeferredFunctions(functions) {
        var done = new $.Deferred;
        function next(index) {
            functions[index]().then(function() {
                if(functions.length > index + 1) {
                    next(index + 1);
                } else {
                    done.resolve();
                }
            });
        }
        return function() {
            next(0);
            return done;
        };
    }

    function deferWrap(fn, delay) {
        return function() {
            //set up the returned deferred object,
            //and make it resolve after a delay
            var ret = new $.Deferred;
            setTimeout(function() {
                //call the function that we're wrapping
                fn();
                ret.resolve();
            }, delay);
            return ret;
        };
    }
    var last = new $.Deferred();
    last.resolve();

    $.fn.type = function(text, cb) {
        var elem = this;
        assert(typeof text === 'string', 'expect the text to type to be a string');
        cb = cb || function() {};
        assert(typeof cb === 'function', 'expect the callback to be a function');

        var wrap = function() {
            //convert each character into a function that adds it to the jquery element,
            //then convert those functions into functions that return deferred objects
            //that are resolved after a set timeout
            var deferreds = _.map(text.split(''), function(ch) {
                return deferWrap(function() {
                    elem.html(elem.html() + decodeChar(ch));
                }, getCharacterDelay(ch) + getRandomDelay());
            });

            composed = composeDeferredFunctions(deferreds);
            return composed();
        }

        var prev = last;
        last = composeDeferredFunctions([ function() { return prev }, wrap ])();
    };
})( jQuery );