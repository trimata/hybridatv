define([
  'hybridatv/core/domtv',
  'hybridatv/helpers/async',
  'hybridatv/helpers/url',
], function($, async, url) {
  'use strict';

  console.log($, async, url);
  //var elemcfg = document.getElementById('oipfcfg');
  //var appmgr = document.getElementById('appmgr');
  //var handler = {};
  //var helpers = {};
  //var components = {};
  //var instance = {};
  //var history = [];
  //var states = {};

  ////hardly ever going to change
  //var maskValues = {
  //
  //
  //
  //
  //
  //
  //
  //};

  //var config = {};

  //function resetConfig() {
  //  config = {
  //

  //
  //
  //
  //

  //
  //
  //
  //
  //    },

  //  };
  //}

  //var isBack = false;
  //var $container;


  //var App = {
  //  setConfig: function(data) {
  //    var prop;

  //    for (prop in data) {
  //      config[prop] = data[prop];
  //    }

  //    return this;
  //  },


  //  /* test-code */

  //  _resetConfig: resetConfig,

  //  _hashchange: hashchange,

  //  _setMask: setMask,

  //  _resetHandlers: function() {
  //    handler = {};
  //  },

  //  _resetHistory: function() {
  //    history = [];
  //  },

  //  _resetHelpers: function() {
  //    helpers = {};
  //  },

  //  _resetStates: function() {
  //    states = {};
  //  },

  //  /* test-code-end */


  //  component: function(name, item) {
  //    var component = components[name];

  //    if (typeof component === 'undefined') {
  //      components[name] = item;
  //      return this;
  //    }

  //    return component;
  //  },


  //  getState: function(hash) {
  //    hash = hash || window.location.hash;

  //    return states[hash];
  //  },


  //  getActiveComponent: function($cnt) {
  //    var match = $cnt.find(config.activeSelector + ':first');

  //    if (match.s.length) {
  //      return match.instance();
  //    }

  //    return null;
  //  },


  //  createComponents: function($cnt, cfg) {
  //    var data = {};
  //    var id;
  //    var elems;
  //    var c;
  //    var obj;

  //    elems = $cnt.find(config.component.selector);

  //    elems.each(function(el) {
  //      id = el.getAttribute(config.component.dataIdAttr);
  //      c = cfg.instances[id];

  //      obj = new components[c.type](el, c.params);

  //      data[id] = obj;

  //      $(el).data('$hybridatvId', id).data('$instance', obj);
  //    });

  //    return data;
  //  },

  //  saveState: function(hash, $cnt, cfg) {
  //    states[hash] = {
  //      config: cfg,
  //      elem: $cnt,
  //    };

  //    return this;
  //  },


  //  getHistory: function() {
  //    return history;
  //  },

  //  goBack: function(step) {
  //    var len = history.length;
  //    var item;

  //    if (len <= 1) { return false; }

  //    if (typeof step !== 'number' || step < 1) {
  //      step = 1;
  //    }

  //    isBack = true;

  //    history.splice(-step);
  //    item = history[len - step - 1];
  //    window.location.hash = item;

  //    return this;
  //  },

  //  getInstanceById: function(id) {
  //    return instance[id];
  //  },

  //  getConfig: function() {
  //    return config;
  //  },


  //  hide: function() {
  //    // FIXME hide entire app-container
  //    $container.hide();
  //    return this;
  //  },

  //  show: function() {
  //    // FIXME show entire app-container
  //    $container.show();
  //    return this;
  //  },
  //};

  //document.addEventListener('keydown', function(evt) {
  //  trigger('keydown', evt);
  //});

  //window.addEventListener('hashchange', function(evt) {
  //  hashchange(evt);

  //  /* test-code */
  //  App._hashchange(evt);
  //  /* test-code-end */
  //});

  //function hashchange(evt) {
  //  var oldHash = evt.oldURL.split('#')[1];
  //  var newHash = evt.newURL.split('#')[1];
  //  var from, to, data;

  //  if (!newHash) {
  //    return;
  //  }

  //  from = url.parseHash(oldHash);
  //  to = url.parseHash(newHash);

  //  data = {
  //    from: from,
  //    to: to,
  //  };

  //  if (from.tmp !== to.tmp) {
  //    trigger('tmpChange', data);
  //  }

  //  App.browse(newHash.slice(1));
  //}

  //App.helper('Hybridatv', {
  //  $: $,
  //});

  //resetConfig();

  /*
   *init app
   *
   */

  var params = {
    maskValues: {
      RED: 1,
      GREEN: 2,
      YELLOW: 4,
      BLUE: 8,
      NAVIGATION: 16,
      VCR: 32,
      NUMERIC: 256,
    },
  },

    config = defaultConfig(),
    extension, handler, state, hashchangehandler, keydownhandler,
    isBack, elemcfg, appmgr, instance, history, $container;

  function trigger(eventName, params) {
    if (typeof handler[eventName] === 'function') {
      handler[eventName](params);
    }
  }

  function defaultConfig() {
    return {
      defaultHash: 'home',

      template: {
        dir: 'templates/',
        ext: '.html',
      },

      component: {
        selector: '.hb-component',
        activeSelector: '.active',
        dataIdAttr: 'data-id',
      },
    };
  }


  function HybridaTV(cfg) {
    var self = this;

    elemcfg = document.getElementById('oipfcfg');
    appmgr = document.getElementById('appmgr');
    handler = {};
    extension = {
      helper: {},
      module: {},
      component: {},
    };
    instance = {};
    history = [];
    state = {};
    isBack = false;

    hashchangehandler = function() {
      console.log(this, self);
    };

    keydownhandler = function(evt) {
      trigger('keydown', evt);
    };

    this.config(cfg).extend('helper', 'Hb', { $: $ });
  }

  HybridaTV.prototype.destroy = function() {
    window.removeEventListener('hashchange', hashchangehandler);
    document.removeEventListener('keydown', keydownhandler);
    this.hide();
  };

  HybridaTV.prototype.helper = function(name) {
    return extension.helper[name];
  };

  HybridaTV.prototype.config = function(data) {
    var prop;

    if (!arguments.length) {
      return config;
    }

    for (prop in data) {
      config[prop] = data[prop];
    }


    return this;
  };

  HybridaTV.prototype.extend = function(kind, name, obj) {
    if (['helper', 'module', 'component'].indexOf(kind) > -1) {
      if (typeof extension[kind][name] === 'undefined') {
        extension[kind][name] = obj;
      }
    }
    return this;
  };

  HybridaTV.prototype.getActiveComponent = function($cnt) {
    var match = $cnt.find(config.activeSelector + ':first');

    if (match.s.length) {
      return match.instance();
    }

    return null;
  };

  HybridaTV.prototype.run = function() {
    var hash;

    trigger('beforeRun');

    $container = $(config.container);

    /*
    if (!$container.s.length) {
      throw {
        message: 'Unable to find container in DOM',
        name: 'InputError',
      };
    }
    */

    if (window.location.hash) {
      hash = window.location.hash;
      window.location.hash = '';
    } else {
      hash = url.buildHash(config.defaultHash, {});
    }

    window.location.hash = hash;

    return this;
  };

  HybridaTV.prototype.loadNewContent = function(hash, $cnt, done) {
    var self = this;
    var html;
    var cfg;

    async.parallel([function getTemplate(over) {
      async.get(config.template.dir + hash +
      config.template.ext, {}, function(res) {
        html = res;
        over();
      });
    }, function getConfig(over) {
      async.get(config.template.dir + hash + '.json',
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

            self.extend('component', className, item);
          }

          over();
        });
      });
    }], function contentLoaded() {
      var components;
      var firstActiveComponent;

      $cnt.html(html);

      self.saveState(hash, $cnt, cfg);
      components = self.createComponents($cnt, cfg);

      if (cfg.firstActiveId) {
        firstActiveComponent = components[cfg.firstActiveId];
        self.focusComponent(firstActiveComponent);
      }

      done();
    });
  };

  HybridaTV.prototype.on = function(evtName, fn) {
    var oldHandler = handler[evtName];

    if (typeof oldHandler === 'function') {
      handler[evtName] = function(evt) {
        oldHandler(evt);
        fn(evt);
      };
    } else {
      handler[evtName] = function(evt) {
        fn(evt);
      };
    }

    return this;
  };

  HybridaTV.prototype.saveState = function(hash, $cnt, cfg) {
    state[hash] = {
      config: cfg,
      elem: $cnt,
    };

    return this;
  };

  HybridaTV.prototype.focusComponent = function(component) {
    try {
      component.focus();
    }
    catch (e) {}
    return this;
  };


  HybridaTV.prototype.browse = function(hash, done) {
    this.get(hash, $container, function($el) {
      if (!isBack) {
        history.push(hash);
      } else {
        isBack = false;
      }

      //FIXME
      trigger('tmpReady', {
        hash: hash,
        tmp: url.parseHash(hash).tmp,
        container: $el,
      });

      if (typeof done === 'function') {
        done($el);
      }
    });
    return this;
  };

  HybridaTV.prototype.state = function(name) {
    if (arguments.length) {
      return state[name];
    }

    return state;
  };

  HybridaTV.prototype.setKeyset = function(value) {
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
        val = params.maskValues[value[i]];
        mask += typeof val === 'number' ? val : 0;
      }
    }

    this.setMask(mask);

    return this;
  };

  HybridaTV.prototype.get = function(hash, $cnt, done) {
    var state = this.state(hash);
    var activeComponent;

    if (typeof state !== 'undefined') {
      // cache
      this.restoreState($cnt, state);
      activeComponent = this.getActiveComponent($cnt);
      this.focusComponent(activeComponent);

      finish();
    } else {
      this.loadNewContent(hash, $cnt, finish);
    }
    function finish() {
      if (typeof done === 'function') {
        done();
      }
    }
  };

  HybridaTV.prototype.restoreState = function($cnt, state) {
    $cnt.html('');

    state.elems.each(function(el) {
      $cnt.s[0].appendChild(el);
    });

    return this;
  };

  HybridaTV.prototype.setMask = function(mask) {
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
  };

  /*
   *end init app
   *
   *
   *
   *
   */


  return HybridaTV;
});
