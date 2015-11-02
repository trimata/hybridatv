/* globals define */

define([], function() {
  'use strict';

    var elem = document.getElementsByTagName('head')[0];

    function dashesToCamelCase(str) {
      return str.replace(/(\-)(.)/g, function() {
        return arguments[2].toUpperCase();
      });
    }
    /**
     * Common used cross-browser methods
     * @exports helpers/polyfil
     * @module helpers/polyfil
     */
    return {
      /**
       * A method in first level, just for test
       * @method addClass
       */
      addClass: elem.classList ? function(el, className) {
        el.classList.add(className);
      } : function(el, className) {
        el.className += ' ' + className;
      },
      /**
       * @method hasClass
       */
      hasClass: elem.classList ? function(el, className) {
        return el.classList.contains(className);
      } : function (el, className) {
        return new RegExp('(^| )' + className +
          '( |$)', 'gi').test(el.className);
      },
      /**
       * A method in first level, just for test
       * @method removeClass
       * @param {Element} el DOM element
       * @param {String} className
       */
      removeClass: elem.classList ? function(el, className) {
        el.classList.remove(className);
      } : function(el, className) {
        el.className = el.className.replace(new RegExp('(^|\\b)' + className
          .split(' ')
          .join('|') + '(\\b|$)', 'gi'), ' ');
      },
      /**
       * @method initCustomEvent
       * @param {String} eventName Name of the event
       * @param {Object} params Parameters of the event.
       */
      initCustomEvent: !!window.CustomEvent ? function(evtName) {
        return new CustomEvent(evtName, {});
      } : function(evtName, params) {
        var evt = document.createEvent('CustomEvent');

        params = params || { bubbles: false, cancelable: false };
        evt.initCustomEvent(evtName, params.bubbles, params.cancelable, {});
        return evt;
      },
      /**
       */
      css: function(el, data) {
        var prop;

        for (prop in data) {
          el.style[prop] = data[prop];
        }
      },
      /**
       */
      getActiveElement: function() {
        return document.activeElement;
      },
      /**
       */
      map: function(list, fn) {
        var len = list.length;
        var result = [];
        var i;

        for (i = 0; i < len; i++) {
          result[i] = fn(list[i]);
        }
        return result;
      },
      /*
       */
      isNode: function(obj) {
        try {
          return obj instanceof HTMLElement;
        } catch(e) {
          return (typeof obj === 'object') &&
            (obj.nodeType === 1) && (typeof obj.style === 'object') &&
            (typeof obj.ownerDocument === 'object');
        }
      },
      /**
       */
      stopBubble: function(evt) {
        evt = evt || window.event;
        if (typeof evt.stopPropagation === 'function') {
          evt.stopPropagation();
        } else {
          evt.cancelBubble = true;
        }
      },
      /**
       */
      data: function(el) {
        var attrs = el.attributes;
        var output = {};
        var len = attrs.length - 1;
        var i;

        for (i = len; i >= 0; i--) {
          if (attrs[i].name.indexOf('data-') > -1) {
            output[dashesToCamelCase(attrs[i].name.slice(5))] = attrs[i].
              value;
          }
        }

        return output;
      },
      /**
       */
      setData: elem.dataset ? function(el, key, val) {
        el.dataset[dashesToCamelCase(key)] = val;
      } : function(el, key, val) {
        el.setAttribute('data-' + key, val);
      },
      /**
       */
      getData: elem.dataset ? function(el, key) {
        return el.dataset[dashesToCamelCase(key)];
      } : function(el, key) {
        return el.getAttribute('data-' + key);
      },
      /**
       */
      isArray: function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
      },
      /**
       */
      extend: function(out) {
        var i;
        var key;

        out = out || {};

        for (i = 1; i < arguments.length; i++) {
          if (!arguments[i]) {
            continue;
          }

          for (key in arguments[i]) {
            if (arguments[i].hasOwnProperty(key)) {
              out[key] = arguments[i][key];
            }
          }
        }

        return out;
      },
      /**
       */
      getCookie: function(cname) {
        var name = cname + '=';
        var ca = document.cookie.split(';');
        var len = ca.length;
        var i;
        var c;

        for (i = 0; i < len; i++) {
          c = ca[i];
          while (c.charAt(0) === ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) !== -1) {
            return c.substring(name.length, c.length);
          }
        }
        return '';
      },
      /**
       * A Test Inner method in child namespace
       * @method setCookie
       */
      setCookie: function(cname, cvalue, expDays) {
        var date, expires = '';

        if (arguments.length > 2) {
          date = new Date();
          date.setTime(date.getTime() +
            (expDays * 24 * 60 * 60 * 1000));
          expires = 'expires=' + date.toUTCString();
        }
        document.cookie = cname + '=' + cvalue + '; ' + expires;
      }
    };

});
