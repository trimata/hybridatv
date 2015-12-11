define([
  'hybridatv/core/class',
  'hybridatv/helpers/polyfil',
], function(Class, polyfil) {
  'use strict';

  return Class.extend({
    init: function(target) {
      this._target = target;
      this._listeners = {};
    },

    on: function(evtName, handler,
    preventOverwrite) {
      var fn = this._listeners[evtName];
      var newFn;

      if (typeof fn !== 'undefined') {
        if (preventOverwrite) { return this; }

        this.off(evtName);

        newFn = function(evt) {
          fn(evt);
          handler(evt);
        };

        this._listen(evtName, newFn);
      } else {
        this._listen(evtName, handler);
      }

      return this;
    },

    _listen: function(evtName, handler) {
      this._target.addEventListener(evtName, handler);
      this._listeners[evtName] = handler;
    },

    off: function(evtName) {
      var fn = this._listeners[evtName];

      if (typeof fn === 'function') {
        this._target.removeEventListener(evtName, fn);
      }

      delete this._listeners[evtName];

      return this;
    },

    trigger: function(evtName, data, target) {
      var evt;

      target = target || this._target;

      evt = polyfil.customEvent(evtName, data);
      target.dispatchEvent(evt);
      return this;
    },

    destroy: function() {
      var prop;

      for (prop in this._listeners) {
        this.off(prop);
      }
    },

  });

});
