define([
  'hybridatv/core/hbbtv',
  'hybridatv/libs/sizzle.min',
  'hybridatv/helpers/polyfil',
  'hybridatv/helpers/async',
], function(hbbtv, sizzle, polyfil, async) {
  'use strict';
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

  //}

  //var isBack = false;


  //var App = {

  //  component: function(name, constructor) {
  //    var component = components[name];

  //    if (typeof component === 'undefined') {
  //      components[name] = constructor;
  //      return this;
  //    }

  //    return component;
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


  //  getHistory: function() {
  //    return history;
  //  },

  //  goBack: function(step) {
  //    var len = history.length;
  //    var constructor;

  //    if (len <= 1) { return false; }

  //    if (typeof step !== 'number' || step < 1) {
  //      step = 1;
  //    }

  //    isBack = true;

  //    history.splice(-step);
  //    constructor = history[len - step - 1];
  //    window.location.hash = constructor;

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
  //    return this;
  //  },

  //  show: function() {
  //    // FIXME show entire app-container
  //    return this;
  //  },
  //};

  //document.addEventListener('keydown', function(evt) {
  //  trigger('keydown', evt);
  //});

  //window.addEventListener('hashchange', function(evt) {
  //  hashchange(evt);

  //
  //});

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

    isAppRunning = false,
    config, extension, handler, state,
    hashchangehandler, keydownhandler,
    isBack, instance, history, container, containerParent;

  function trigger(eventName, params) {
    if (typeof handler[eventName] === 'function') {
      handler[eventName](params);
    }
  }

  function defaultConfig() {
    return {
      defaultHash: 'index',

      enableCache: true,

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

    handler = {};
    extension = {
      helper: {},
      module: {},
      component: {},
    };
    config = defaultConfig();
    instance = {};
    history = [];
    state = {};
    isBack = false;

    hashchangehandler = function(evt) {
      var oldHash = evt.oldURL.split('#')[1];
      var newHash = evt.newURL.split('#')[1];
      //var from, to, data;

      if (!isAppRunning || !newHash) {
        return;
      }

      /*
      from = url.parseHash(oldHash);
      to = url.parseHash(newHash);

      data = {
        from: from,
        to: to,
      };

      if (from.tmp !== to.tmp) {
        trigger('tmpChange', data);
      }
      */

      //TODO check if view is different and trigger

      if (config.enableCache && oldHash) {
        self.saveCurrentState(oldHash);
      }

      self.browse(newHash, container);
    };

    keydownhandler = function(evt) {
      if (isAppRunning) {
        trigger('keydown', evt);
      }
    };

    this.config(cfg);

    window.addEventListener('hashchange', hashchangehandler);
    document.addEventListener('keydown', keydownhandler);
  }

  HybridaTV.prototype.destroy = function() {
    window.removeEventListener('hashchange', hashchangehandler);
    document.removeEventListener('keydown', keydownhandler);
    isAppRunning = false;

    trigger('destroy');
  };

  HybridaTV.prototype.helper = function(name, val) {
    if (arguments.length > 1) {
      return this.extend('helper', name, val);
    }

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

  HybridaTV.prototype.history = function() {
    return history;
  };

  HybridaTV.prototype.run = function() {
    var hash = window.location.hash.slice(1);

    trigger('beforerun');

    container = config.container;
    containerParent = container.parentNode;

    isAppRunning = true;
    /*
    if (!$container.s.length) {
      throw {
        message: 'Unable to find container in DOM',
        name: 'InputError',
      };
    }
    */

    if (hash.length) {
      this.get(hash, container, function() {
        trigger('initialviewready');
      });
    } else {
      this.navigate(config.defaultHash);
    }

    return this;
  };

  HybridaTV.prototype.navigate = function(hash) {
    window.location.hash = hash;

    return this;
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

  HybridaTV.prototype.extend = function(kind, name, obj) {
    if (['helper', 'module', 'component'].indexOf(kind) > -1) {
      if (typeof extension[kind][name] === 'undefined') {
        extension[kind][name] = obj;
      }
    }
    return this;
  };

  HybridaTV.prototype.getActiveComponent = function(cnt) {
    // FIXME not cool
    var match = cnt.find(config.activeSelector + ':first');

    if (match.s.length) {
      return match.instance();
    }

    return null;
  };

  HybridaTV.prototype.setKeyset = function(val) {
    var mask = 0;
    var len;
    var i;
    var value;

    if (polyfil.isArray(val)) {
      len = val.length;

      for (i = 0; i < len; i++) {
        if (typeof val[i] === 'string') {
          value = params.maskValues[val[i].toUpperCase()] || 0;
          mask += value;
        }
      }
    } else {
      mask = parseInt(val, 10) || 0;
    }

    hbbtv.setKeyset(mask);

    return this;
  };

  HybridaTV.prototype.loadNewContent = function(hash, cnt, done) {
    var self = this;
    var html;
    var cfg;

    async.parallel([function getTemplate(over) {
      async.get(config.template.dir + hash +
      config.template.ext, function(res) {
        html = res;
        over();
      });
    }, function getConfig(over) {
      async.get(config.template.dir + hash + '.json',
        function(res) {
        cfg = res ? JSON.parse(res) : {
          dependencies: [],
        };

        requirejs(cfg.dependencies, function() {
          var len = arguments.length;
          var i;
          var constructor;
          var className;

          for (i = 0; i < len; i++) {
            constructor = arguments[i];

            className = cfg.dependencies[i].split('/').slice(-1);

            console.log(cfg.dependencies);
            self.extend('component', className, constructor);
          }

          over();
        });
      });
    }], function contentLoaded() {
     // var components;
     // var firstActiveComponent;

      cnt.innerHTML = html;

      self.setupTemplate(cnt, cfg);
      /*
      components = self.createComponents($cnt, cfg);

      if (cfg.firstActiveId) {
        firstActiveComponent = components[cfg.firstActiveId];
        self.focusComponent(firstActiveComponent);
      }
      */

      done();
    });
  };

  HybridaTV.prototype.setupTemplate = function(cnt, cfg) {
    var elems = sizzle('.hb-component', cnt);
    console.log(elems);
    var len = elems.length;
    var i;
    var x;
    var id;

    for (i = 0; i < len; i++) {
      x = elems[i];
      id = polyfil.getData(x, 'id');
      console.log(cfg.instances[id]);
    }
  };

  HybridaTV.prototype.focusComponent = function(component) {
    try {
      component.focus();
    }
    catch (e) {}
    return this;
  };


  HybridaTV.prototype.saveCurrentState = function(hash) {
    state[hash] = {
      elem: container.cloneNode(true),
    };
  };

  HybridaTV.prototype.browse = function(hash, done) {
    this.get(hash, container, function($el) {
      if (!isBack) {
        history.push(hash);
      } else {
        isBack = false;
      }

      //FIXME
      /*
      trigger('tmpReady', {
        hash: hash,
        tmp: url.parseHash(hash).tmp,
        container: $el,
      });
      */

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

  HybridaTV.prototype.get = function(hash, cnt, done) {
    var state = this.state(hash);
    //var activeComponent;

    if (typeof state !== 'undefined') {
      // cache
      this.restoreState(cnt, state);
      /*
      activeComponent = this.getActiveComponent($cnt);
      this.focusComponent(activeComponent);
      */
      finish();
    } else {
      this.loadNewContent(hash, cnt, finish);
    }
    function finish() {

      if (typeof done === 'function') {
        done();
      }
    }
  };

  HybridaTV.prototype.restoreState = function(cnt, state) {
    cnt.innerHTML = '';

    // TODO verify this
    while (state.elem.children.length) {
      cnt.appendChild(state.elem.children[0]);
    }

    return this;
  };

  return HybridaTV;
});
