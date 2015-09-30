/* globals define */

define([], function() {
  'use strict';

    var elem = document.getElementsByTagName('head')[0];

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
