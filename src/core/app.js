define([
  'hybridatv/core/hbbtv',
  'hybridatv/libs/sizzle.min',
  'hybridatv/helpers/polyfil',
  'hybridatv/helpers/async',
], function(hbbtv, sizzle, polyfil, async) {
  'use strict';

  var params = {
    maskValues: {
      RED: 1,
      GREEN: 2,
      YELLOW: 4,
      BLUE: 8,
      NAVIGATION: 16,
      VCR: 32,
      SCROLL: 64,
      INFO: 128,
      NUMERIC: 256,
      ALPHA: 512,
      OTHER: 1024,
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

      componentClass: 'hb-component',
    };
  }

  //TODO why don't we extend core Class?

  function HybridaTV(cfg) {
    var self = this;

    handler = {};
    extension = {
      helper: {},
      module: {},
      widget: {},
    };
    config = cfg || defaultConfig();
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

  HybridaTV.prototype.widget = function(name, val) {
    if (arguments.length > 1) {
      return this.extend('widget', name, val);
    }

    return extension.widget[name];
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
    if (['helper', 'module', 'widget'].indexOf(kind) > -1) {
      if (typeof extension[kind][name] === 'undefined') {
        extension[kind][name] = obj;
      }
    }
    return this;
  };

  HybridaTV.prototype.goBack = function() {
    //TODO check out history.back
    var lastPage = history.pop();

    if (!lastPage) {
      trigger('historyempty');
      return false;
    }

    isBack = true;

    this.navigate(lastPage);
  };

  //TODO
  HybridaTV.prototype.exit = function() {};

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

  HybridaTV.prototype._loadNewContent = function(hash, cnt, done) {
    var self = this;
    var html;
    var cfg;

    async.parallel([function getTemplate(over) {
      async.get(config.template.dir + hash +
      config.template.ext, function(res) {
        var myRegexp = /data-type=\"(.+?)\"/g;
        var deps = [];
        var classNames = [];
        var match;

        do {
          match = myRegexp.exec(res);
          if (match) {
            classNames.push(match[1]);
            deps.push(config.widgets[match[1]]);
          }

        } while(match);

        requirejs(deps, function() {
          var len = arguments.length;
          var i;
          var constructor;
          var className;

          for (i = 0; i < len; i++) {
            constructor = arguments[i];
            className = classNames[i];

            //TODO in future this might be module or widget
            self.widget(className, constructor);
          }
          over();
        });

        html = res;
      });
    }, function getConfig(over) {
      async.get(config.template.dir + hash + '.json',
        function(res) {
        cfg = res ? JSON.parse(res) : defaultDeps();
        /*

        requirejs(cfg.dependencies, function() {
          var len = arguments.length;
          var i;
          var constructor;
          var className;

          for (i = 0; i < len; i++) {
            constructor = arguments[i];

            className = config.components[cfg.dependencies[i]];

            //TODO in future this might be module or widget
            self.extend('component', className, constructor);
          }

          over();
        });
        */
        over();
      }, over);
    }], function contentLoaded() {
      cnt.innerHTML = html;

      self.setupTemplate(cnt, cfg);

      done();
    });
  };

  HybridaTV.prototype.setupTemplate = function(cnt, cfg) {
    var elems = sizzle('.' + config.componentClass, cnt);
    var len = elems.length;
    var i;
    var el;
    var data;
    var constructor;

    for (i = 0; i < len; i++) {
      el = elems[i];
      //TODO use params
      data = polyfil.data(el);
      constructor = data.type;

      //TODO in future this might be module or widget
      new extension.widget[constructor](el);
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

  //FIXME
  HybridaTV.prototype.extension = function() {
    return extension;
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
      //ugly but necessary
      setTimeout(function() {
        node.focus();
      }, 0);
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
      this._loadNewContent(hash, cnt, finish);
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

  HybridaTV.prototype.trigger = function(evtName, data) {
    trigger(evtName, data);

    return this;
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
