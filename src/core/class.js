define([], function() {
  var initializing = false;
  var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  var Class = function(){};

  Class.extend = function(prop) {
    var _super = this.prototype;
    var name;

    initializing = true;
    var prototype = new this();
    initializing = false;

    for (name in prop) {
      prototype[name] = typeof prop[name] == 'function' &&
        typeof _super[name] == 'function' && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            var ret;

            this._super = _super[name];

            ret = fn.apply(this, arguments);
            this._super = tmp;

            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    function Class() {
      this.self = this;
      if ( !initializing && this.init ) {
        this.init.apply(this, arguments);
      }
    }

    Class.prototype = prototype;
    Class.constructor = Class;
    Class.extend = arguments.callee;
    return Class;
  };
  return Class;
});