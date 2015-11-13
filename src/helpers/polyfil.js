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
       * @method customEvent
       * @param {String} eventName Name of the event
       * @param {Object} params Parameters of the event.
       */
      customEvent: typeof window.CustomEvent === 'function' ?
        function(evtName, data) {
        var evt = new CustomEvent(evtName, {});

        evt.__data__ = data;

        return evt;
      } : function(evtName, data) {
        var evt = document.createEvent('CustomEvent');

        evt.initCustomEvent(evtName, false, false, {});
        evt.__data__ = data;

        return evt;
      },
      /**
       * TODO rename to setStyle
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
      each: function(list, fn) {
        var len = list.length;
        var i;

        for (i = 0; i < len; i++) {
          if (fn(list[i]) === false) {
            break;
          }
        }
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
      cancelBubble: function(evt) {
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
      outerHeight: function(el, addMargins) {
        var height = parseFloat(el.offsetHeight) || 0;

        if (addMargins) {
          height += parseFloat(this.getStyle(el, 'marginLeft')) +
            parseFloat(this.getStyle(el, 'marginRight'));
        }

        return height;
      },
      /**
       */
      getStyle: function(el, cssprop) {
        if (el.currentStyle) {
          return el.currentStyle[cssprop];
        } else if (document.defaultView &&
        document.defaultView.getComputedStyle) {
          return document.defaultView.getComputedStyle(el, '')[cssprop];
        } else {
          return el.style[cssprop];
        }
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
