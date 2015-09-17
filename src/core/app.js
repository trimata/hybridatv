define([
  'hybridatv/core/domtv',
  'hybridatv/helpers/async',
  'hybridatv/helpers/url',
], function($, async, url) {
  'use strict';

  var elemcfg = document.getElementById('oipfcfg');
  var appmgr = document.getElementById('appmgr');
  var handlers = {};
  var helpers = {};
  var components = {};
  var instance = {};
  var state = {};
  var history = [];
  var $state = {};

  //hardly ever going to change
  var maskValues = {
    RED: 1,
    GREEN: 2,
    YELLOW: 4,
    BLUE: 8,
    NAVIGATION: 16,
    VCR: 32,
    NUMERIC: 256,
  };

  var config = {
    defaultHash: 'home',
    container: undefined,

    template: {
      dir: '',
      ext: '.html',
    },

    component: {
      selector: '.hb-component',
      activeSelector: '.active',
      dataIdAttr: 'data-id',
    },

  };

  var isBack = false;
  var $container;

  function trigger(eventName, params) {
    if (typeof handlers[eventName] === 'function') {
      handlers[eventName](params);
    }
  }

  function setMask(mask) {
    var app;

    // for HbbTV 0.5:
    try {
      elemcfg.keyset.value = mask;
    } catch (e) {}
    try {
      elemcfg.keyset.setValue(mask);
    } catch (e) {}

    // for HbbTV 1.0:
    try {
      app = appmgr.getOwnerApplication(document);
      app.privateData.keyset.setValue(mask);
      app.privateData.keyset.value = mask;
    } catch (e) {}
  }

  var App = {
    components: components,

    state: state,

    setConfig: function(data) {
      var prop;

      for (prop in data) {
        config[prop] = data[prop];
      }

      $container = $(config.container);

      if (!$container.s.length) {
        throw {
          message: 'Unable to find container in DOM',
          name: 'InputError',
        };
      }

      return this;
    },

    config: config,

    setKeyset: function(value) {
      var mask = 0;
      var len;
      var i;
      var val;

      value = value || [];

      if (typeof value === 'number') {
        mask = value;
      } else {
        len = value.length;

        for (i = 0; i < len; i++) {
          val = maskValues[value[i]];
          mask += typeof val === 'number' ? val : 0;
        }
      }

      if (typeof this._setMask === 'function') {
        this._setMask(mask);
      } else {
        setMask(mask);
      }

      return this;
    },

    /* test-code */

    _setMask: setMask,

    _resetHandlers: function() {
      handlers = {};
    },

    _resetHistory: function() {
      history = [];
    },

    _resetHelpers: function() {
      helpers = {};
    },

    /* test-code-end */

    on: function(evtName, handler) {
      var oldHandler = handlers[evtName];

      if (typeof oldHandler === 'function') {
        handlers[evtName] = function(evt) {
          oldHandler(evt);
          handler(evt);
        };
      } else {
        handlers[evtName] = function(evt) {
          handler(evt);
        };
      }

      return this;
    },

    getState: function(hash) {
      if (typeof hash !== 'string') {
        return state[window.location.hash];
      }

      return state[hash];
    },

    browse: function(hash, done) {
      this.get(hash, $container, function($el) {
        if (!isBack) {
          history.push(hash);
        } else {
          isBack = false;
        }

        trigger('tmpReady', {
          hash: hash,
          tmp: url.parseHash(hash).tmp,
          container: $el,
        });

        if (typeof done === 'function') {
          done($el);
        }
      });

    },

    component: function(name, item) {
      var component = components[name];

      if (typeof component === 'undefined') {
        components[name] = item;
        return this;
      }

      return component;
    },

    /*
     * START beta
    */

    $focusComponent: function(component) {
      try {
        component.focus();
      }
      catch (e) {}
      return this;
    },

    $browse: function(hash, done) {
      this.$get(hash, $container, function($el) {
        if (!isBack) {
          history.push(hash);
        } else {
          isBack = false;
        }

        trigger('tmpReady', {
          hash: hash,
          tmp: url.parseHash(hash).tmp,
          container: $el,
        });

        if (typeof done === 'function') {
          done($el);
        }
      });

    },

    $getState: function(hash) {
      hash = hash || window.location.hash;

      return $state[hash];
    },

    $restoreState: function($cnt, state) {
      $cnt.html('');

      state.elems.each(function(el) {
        $cnt.s[0].appendChild(el);
      });

      return this;
    },

    $getActiveComponent: function($cnt) {
      var match = $cnt.find(config.activeSelector + ':first');

      if (match.s.length) {
        return match.instance();
      }

      return null;
    },

    $get: function(hash, $cnt, done) {
      var state = this.$getState(hash);
      var hashData = url.parseHash(hash);
      var self = this;
      var activeComponent;
      var html;
      var cfg;

      if (typeof state !== 'undefined') {
        // cache
        this.$restoreState($cnt, state);
        activeComponent = this.$getActiveComponent($cnt);
        this.$focusComponent(activeComponent);

        broadcastReady();
      } else {
        async.parallel([
          function getTemplate(over) {
            async.get(config.template.dir + hashData.tmp + '/view' +
            config.templates.ext, {}, function(res) {
              html = res;
              over();
            });
          },
          function getConfig(over) {
            async.get(config.template.dir + hashData.tmp + '/data.json',
            {}, function(res) {
              cfg = JSON.parse(res);

              requirejs(cfg.dependencies, function() {
                var len = arguments.length;
                var i;
                var item;
                var className;

                for (i = 0; i < len; i++) {
                  item = arguments[i];

                  className = item.prototype.type;

                  self.component(className, item);
                }

                over();
              });
            });
          }
        ], function contentLoaded() {
          var components;
          var firstActiveComponent;

          $cnt.html(html);

          self.saveState(hash, $cnt, cfg);
          components = self.$createComponents($cnt, cfg);

          if (cfg.firstActiveId) {
            firstActiveComponent = components[cfg.firstActiveId];
            self.$focusComponent(firstActiveComponent);
          }

          broadcastReady();
        });
      }

      function broadcastReady() {
        if (typeof done === 'function') {
          done();
        }
      }
    },

    $createComponents: function($cnt, cfg) {
      var data = {};
      var id;
      var elems;
      var c;
      var obj;

      elems = $cnt.find(config.component.selector);

      elems.each(function(el) {
        id = el.getAttribute(config.component.dataIdAttr);
        c = cfg.instances[id];

        obj = new components[c.type](el, c.params);

        data[id] = obj;

        $(el).data('$hybridatvId', id).data('$instance', obj);
      });

      return data;
    },

    saveState: function(hash, $cnt, cfg) {
      this.states[hash] = {
        config: cfg,
        elems: $cnt.children(),
      };

      return this;
    },


    /*
     * END beta
    */

    get: function(hash, container, done) {
      var tmp = url.parseHash(hash).tmp;
      var $targetContainer = $(container);
      var currentState = this.getState(hash);
      var cfg;
      var html;

      if (typeof currentState !== 'undefined') {
        updateContent(true);
      } else {
        async.parallel([getTmp, getConfig], updateContent);
      }

      function getTmp(over) {
        async.get(config.templatesDir + tmp + '/view' + config.templatesExt,
        {}, function(res) {
          html = res;
          over();
        });
      }

      function getConfig(over) {
        async.get(config.templatesDir + tmp + '/data.json', {}, function(res) {
          cfg = JSON.parse(res);

          requirejs(cfg.dependencies, function() {
            var len = arguments.length;
            var i;
            var item;
            var className;

            for (i = 0; i < len; i++) {
              item = arguments[i];

              className = item.prototype.type;

              if (typeof components[className] === 'undefined') {
                components[className] = item;
              }
            }

            over();
          });
        });
      }

      function updateContent(cached) {
        var match;

        if (cached) {
          $targetContainer.html('');

          currentState.elems.each(function(el) {
            $targetContainer.s[0].appendChild(el);
          });

          match = $targetContainer.find('.active:first');

          if (match.s.length) {
            match.instance().focus();
          }

        } else {
          $targetContainer.html(html);
          initNewContent();
        }

        if (typeof done === 'function') {
          done($targetContainer);
        }
      }

      function initNewContent() {
        var id;
        var elems;
        var c;
        var obj;
        var elem;

        elems = $targetContainer.find(config.componentSelector);

        elems.each(function(el) {
          id = el.getAttribute(config.dataIdAttr);
          c = cfg.instances[id];

          obj = new components[c.type](el, c.params);

          if (cfg.firstActiveId && cfg.firstActiveId === id.toString()) {
            elem = obj;
          }

          $(el).data('$hybridatvId', id).data('$instance', obj);
        });

        state[hash] = {
          config: cfg,
          elems: $targetContainer.children(),
        };

        if (elem) { elem.focus(); }
      }
    },

    getHistory: function() {
      return history;
    },

    goBack: function(step) {
      var len = history.length;
      var item;

      if (len <= 1) { return false; }

      if (typeof step !== 'number' || step < 1) {
        step = 1;
      }

      isBack = true;

      history.splice(-step);
      item = history[len - step - 1];
      window.location.hash = item;

      return this;
    },

    getInstanceById: function(id) {
      return instance[id];
    },

    run: function() {
      var hash;

      trigger('beforeRun');

      if (window.location.hash) {
        hash = window.location.hash;
        window.location.hash = '';
      } else {
        hash = url.buildHash(config.defaultHash, {});
      }

      window.location.hash = hash;

      return this;
    },

    helper: function(name, api) {
      if (arguments.length === 1) {
        return helpers[name];
      }

      if (typeof helpers[name] === 'undefined') {
        helpers[name] = api;
      }
      return this;
    },

    hide: function() {
      // FIXME hide entire app-container
      $container.hide();
      return this;
    },

    show: function() {
      // FIXME show entire app-container
      $container.show();
      return this;
    },
  };

  document.addEventListener('keydown', function(evt) {
    trigger('keydown', evt);
  });

  window.addEventListener('hashchange', function(evt) {
    var oldHash = evt.newURL.split('#')[1];
    var from, to, data;

    if (!oldHash) {
      return;
    }

    from = url.parseHash(oldHash);
    to = url.parseHash(evt.newURL.split('#')[1]);
    data = {
      from: from,
      to: to,
    };

    if (from.tmp !== to.tmp) {
      trigger('tmpChange', data);
    }

    App.browse(evt.newURL.split('#')[1]);
  });

  App.helper('Hybridatv', {
    $: $,
  });

  return App;
});
