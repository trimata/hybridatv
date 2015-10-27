define([
  'hybridatv/core/hbbtv',
  'hybridatv/libs/sizzle.min',
  'hybridatv/helpers/polyfil',
  'hybridatv/helpers/async',
], function(hbbtv, sizzle, polyfil, async) {
  'use strict';

  //  component: function(name, constructor) {
  //    var component = components[name];

  //    if (typeof component === 'undefined') {
  //      components[name] = constructor;
  //      return this;
  //    }

  //    return component;
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

    isAppRunning, config, extension, handler, state,
    hashchangehandler, keydownhandler,
    isBack, instance, history, container, containerParent;

  function trigger(eventName, params) {
    if (typeof handler[eventName] === 'function') {
      handler[eventName](params);
    }
  }

  function defaultDeps() {
    return {
      dependencies: [],
    };
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
    isAppRunning = false;
    isBack = false;

    hashchangehandler = function(evt) {
      var oldHash = evt.oldURL.split('#')[1];
      var newHash = evt.newURL.split('#')[1];

      if (!isAppRunning || !newHash) {
        return;
      }

      if (config.enableCache && oldHash) {
        self.saveCurrentState(oldHash);
      }

      self.browse(newHash, oldHash);
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
    // TODO handle missing container scenario

    if (hash.length) {
      this.get(hash, container, function() {
        trigger('initialviewready');
      });
    } else {
      this.navigate(config.defaultHash);
    }

    trigger('run');

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

  HybridaTV.prototype.goBack = function() {
    var lastPage = history.pop();

    if (!lastPage) {
      trigger('historyempty');
      return false;
    }

    isBack = true;

    this.navigate(lastPage);
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
        cfg = res ? JSON.parse(res) : defaultDeps();

        requirejs(cfg.dependencies, function() {
          var len = arguments.length;
          var i;
          var constructor;
          var className;

          for (i = 0; i < len; i++) {
            constructor = arguments[i];

            className = constructor.prototype.name;
            //className = cfg.dependencies[i].split('/').slice(-1);

            self.extend('component', className, constructor);
          }

          over();
        });
      });
    }], function contentLoaded() {
      cnt.innerHTML = html;

      self.setupTemplate(cnt, cfg);

      done();
    });
  };

  HybridaTV.prototype.setupTemplate = function(cnt, cfg) {
    //TODO use params
    var elems = sizzle('.hb-component', cnt);
    var len = elems.length;
    var i;
    var el;
    var id;
    var data;
    var constructor;

    for (i = 0; i < len; i++) {
      //TODO use params
      el = elems[i];
      id = polyfil.getData(el, 'id');
      constructor = polyfil.getData(el, 'name');
      data = cfg.instances[id];

      //TODO in future this might be module or widget
      new extension.component[constructor](el, data);
    }

    // TODO if there is no firstActiveComponent prop
    if (elems.length) {
      this.focus(elems[0]);
    } else {
      //elems[0].focus();
    }
  };

  HybridaTV.prototype.saveCurrentState = function(hash) {
    var activeElement = document.activeElement;
    var elems = [];
    var len = container.children.length;
    var i;

    for (i = 0; i < len; i++) {
      elems[i] = container.removeChild(container.children[0]);
    }

    state[hash] = {
      activeElement: activeElement,
      elems: elems,
    };
  };

  HybridaTV.prototype.browse = function(hash, oldHash, done) {
    this.get(hash, container, function() {
      if (oldHash && !isBack) {
        history.push(oldHash);
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
        done();
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

  HybridaTV.prototype.focus = function(node) {
    if (node && node.nodeType === 1) {
      node.focus();
      return true;
    }

    return false;
  };

  HybridaTV.prototype.get = function(hash, cnt, done) {
    var state = this.state(hash);

    if (typeof state !== 'undefined') {
      // cache
      this.restoreState(cnt, state);

      this.focus(state.activeElement);
      finish();
    } else {
      this.loadNewContent(hash, cnt, finish);
    }
    function finish() {
      trigger('viewchange', {
        hash: hash,
      });

      if (typeof done === 'function') {
        done();
      }
    }
  };

  HybridaTV.prototype.restoreState = function(cnt, state) {
    var len = state.elems.length;
    var i;
    for (i = 0; i < len; i++) {
      cnt.appendChild(state.elems[i]);
    }

    return this;
  };

  return HybridaTV;
});
