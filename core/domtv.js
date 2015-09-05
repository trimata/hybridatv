/* globals define */

/**
 * A DOM wrapper module.
 * @module hybrida/main
 * @exports hybrida/main
 */
define([
  'sizzle',
  'hybrida/libs/polyfil',
], function(sizzle, polyfil) {
  'use strict';

  var fn = {};
  var Cache = {

    storage_dict: {},
    uuid: 1,
    expando: 'Cache' + (new Date()).getTime(),

    get: function(elm, key) {
      if (arguments.length < 2) {
        return this.getStore(elm);
      }
      return this.getStore(elm)[key];
    },

    set: function(elm, key, value) {
      this.getStore(elm)[key] = value;
      return value;
    },

    remove: function(elm, key) {
      if (typeof key !== 'undefined') {
        var store = this.getStore(elm);

        if (store[key]) {
          delete store[key];
        }
      }
      else {
        var elm_id = elm[this.expando];

        try {
          delete this.storage_dict[elm_id];
          delete elm[this.expando];
        } catch(e) {}
      }
    },

    getStore: function(elm) {
      var expando = this.expando;
      var storage_dict = this.storage_dict;
      var elm_id = elm[expando];

      if (!elm_id) {
        elm_id = elm[expando] = this.uuid++;
        storage_dict[elm_id] = {};
      }

      return storage_dict[elm_id];
    }
  };

  /**
   * @method ::constructor
   * @param {string|array} selector
   */
  function Selector(selector) {
    var elem;

    if (typeof selector === 'string') {
      elem = sizzle(selector);
    } else if (polyfil.isArray(selector)) {
      elem = selector;
    } else if (typeof selector === 'undefined') {
      elem = [];
    } else if (selector.nodeType === 1) {
      elem = [selector];
    } else {
      return selector;
    }

    this.s = elem;
    this.data('$created', true);
  }

  function extend(key, val) {
    if (typeof fn[key] === 'undefined') {
      fn[key] = val;
    }
  }

  /**
   * @method children
   */
  Selector.prototype.children = function() {
    var childs = [];

    this.each(function(el) {
      var len = el.children.length;
      var i;

      for (i = 0; i < len; i++) {
        childs.push(el.children[i]);
      }
    });

    return $(childs);
  };

  /**
   * @method listeners
   */
  Selector.prototype.listeners = function(name) {
    var el = this.s[0];
    var listeners = Cache.get(el, '$listeners') || {};

    if (arguments.length) {
      return listeners[name] || [];
    }

    return listeners;
  };

  /**
   * @method removeListeners
   */
  Selector.prototype.removeListeners = function() {
    return this.each(function(el) {
      var listeners = Cache.get(el, '$listeners') || {};
      var prop;
      var evt;

      for (prop in listeners) {
        while (listeners[prop].length) {
          evt = listeners[prop].pop();
          el.removeEventListener(evt.name, evt.handler);
        }
      }

      Cache.set(el, '$listeners', {});
    });
  };

  /**
   * FIXME
   * @method destroy
   * @return {this}
   */
  Selector.prototype.destroy = function() {
    this.each(function(el) {
      el.parentNode.removeChild(el);
    });
  };

  /**
   * @method on
   * @param {string} name
   * @param {function} handler
   */
  Selector.prototype.on = function(name, handler) {
    return this.each(function(el) {
      var listeners = Cache.get(el, '$listeners') || {};

      if (typeof listeners[name] === 'undefined') {
        listeners[name] = [];
      }

      listeners[name].push({
        active: true,
        handler: handler,
      });

      el.addEventListener(name, handler);

      Cache.set(el, '$listeners', listeners);
    });
  };

  /**
   * @method classes
   */
  Selector.prototype.classes = function() {
    var res = [];
    var classes;
    var len;
    var i;

    this.each(function(el) {
      if (el.className) {
        classes = el.className.split(' ');
        len = classes.length;

        for (i = 0; i < len; i++) {
          if (res.indexOf(classes[i]) === -1) {
            res.push(classes[i]);
          }
        }
      }

    });

    return res;
  };

  /**
   * @method addClass
   * @param {...string} classNames
   */
  Selector.prototype.addClass = function() {
    var args = Array.prototype.slice.call(arguments);
    var len = args.length;

    return this.each(function(el) {
      var i;

      for (i = 0; i < len; i++) {
        polyfil.addClass(el, args[i]);
      }
    });
  };

  /**
   * @method removeClass
   * @param {...string} classNames
   */
  Selector.prototype.removeClass = function() {
    var args = Array.prototype.slice.call(arguments);
    var len = args.length;

    return this.each(function(el) {
      var i;

      for (i = 0; i < len; i++) {
        polyfil.removeClass(el, args[i]);
      }
    });
  };

  /**
   * @method hasClass
   * @param {string} className
   */
  Selector.prototype.hasClass = function(className) {
    var result = true;

    this.each(function(el) {
      if (!polyfil.hasClass(el, className)) {
        result = false;
        return false;
      }
    });

    return result;
  };

  /**
   * @method focus
   */
  Selector.prototype.focus = function() {
    var self = this;

    setTimeout(function() {
      self.s[0].focus();
    }, 0);
    return this;
  };

  /**
   * @method blur
   */
  Selector.prototype.blur = function() {
    this.s[0].blur();
    return this;
  };

  /**
   * @method show
   */
  Selector.prototype.show = function() {
    this.css('display', null);
    return this;
  };

  /**
   * @method hide
   */
  Selector.prototype.hide = function() {
    this.css('display', 'none');
    return this;
  };

  /**
   * @method eq
   */
  Selector.prototype.eq = function(i) {
    return $(this.s[i]);
  };

  /**
   * @method trigger
   */
  Selector.prototype.trigger = function(evtName, data) {
    var listeners = this.listeners(evtName);
    var len = listeners.length;
    var i;
    var item;

    for (i = 0; i < len; i++) {
      item = listeners[i];

      if (item.active) {
        item.handler(data);
      }
    }

    return this;
  };

  /**
   * @method extend
   */
  Selector.prototype.extend = function(obj) {
    var prop;

    for (prop in obj) {
      extend(prop, obj[prop]);
    }
    return this;
  };

  /**
   * @method instance
   */
  Selector.prototype.instance = function() {
    return this.data('$instance');
  };

  /**
   * @method data
   */
  Selector.prototype.data = function(prop, val) {
    var vals = {};

    switch(arguments.length) {
    case 0:
      this.each(function(el) {
        vals = polyfil.extend(vals, Cache.get(el));
      });

      return vals;
    case 1:
      return Cache.get(this.s[0], prop);
    case 2:
      return this.each(function(el) {
        Cache.set(el, prop, val);
      });
    }
  };

  /**
   * @method removeData
   */
  Selector.prototype.removeData = function(key) {
    switch(arguments.length) {
    case 0:
      return this.each(function(el) {
        Cache.remove(el);
      });
    case 1:
      return this.each(function(el) {
        Cache.remove(el, key);
      });
    }
  };

  /**
   * @method css
   */
  Selector.prototype.css = function(prop, val) {
    switch(arguments.length) {
    case 1:
      return this.s[0].style[prop];
    case 2:
      return this.each(function(el) {
        el.style[prop] = val;
      });
    }
  };

  /**
   * @method attr
   */
  Selector.prototype.attr = function(prop, val) {
    switch(arguments.length) {
    /*
    case 0:
      this.each(function(el) {
        var len = el.attributes.length;
        var i;

        for (i = 0; i < len; i++) {
          res[el.attributes[i].name] = el.attributes[i].value;
        }
      });

      return res;
    */
    case 1:
      return this.s[0].getAttribute(prop);
    case 2:
      return this.each(function(el) {
        el.setAttribute(prop, val);
      });
    }
  };

  /**
   * @method html
   */
  Selector.prototype.html = function(str) {
    switch (arguments.length) {
    case 0:
      return this.s[0].innerHTML;
    case 1:
      return this.each(function(el) {
        el.innerHTML = str;
      });
    }
  };

  /**
   * @method each
   */
  Selector.prototype.each = function(callback) {
    var len = this.s.length;
    var i;
    var res;

    for (i = 0; i < len; i++) {
      res = callback(this.s[i], i);

      if (res === false) {
        break;
      }
    }

    return this;
  };

  /**
   * @method find
   */
  Selector.prototype.find = function(sel) {
    return $(sizzle(sel, this.s[0]));
  };

  function $(selector) {
    var el = new Selector(selector);

    return el;
  }

  fn = Selector.prototype;

  return $;
});
