define([
  'hybridatv/core/class',
  'hybridatv/settings',
  'hybridatv/core/hbbtv',
  'hybridatv/libs/sizzle.min',
  'hybridatv/helpers/polyfil',
  'hybridatv/helpers/async',
  'hybridatv/helpers/url',
], function(Class, settings, hbbtv, sizzle, polyfil, async, url) {
  'use strict';

  var HybridaTV = Class.extend({
    init: function(config, packages) {
      var self = this;

      this._config = config;
      this._packages = packages;
      this._history = [];
      this._states = {};
      this._handler = {};

      this._isGoingBack = false;
      this._isAppRunning = false;

      this._extension = {
        helper: {},
        component: {},
      };

      this._hashchangehandler = function(evt) {
        var oldHash = evt.oldURL.split('#')[1];
        var newHash = evt.newURL.split('#')[1];

        if (!self._isAppRunning || !newHash) {
          return;
        }

        if (config.enableCache && oldHash) {
          self._saveCurrentState(oldHash);
        }

        self._browse(newHash, oldHash);
      };

      this._keydownhandler = function(evt) {
        if (self._isAppRunning) {
          self.trigger('keydown', evt);
        }
      };

      window.addEventListener('hashchange', this._hashchangehandler);
      document.addEventListener('keydown', this._keydownhandler);
    },

    destroy: function() {
      window.removeEventListener('hashchange', this._hashchangehandler);
      document.removeEventListener('keydown', this._keydownhandler);
      this._isAppRunning = false;

      //TODO add before destroy
      this.trigger('destroy');
    },

    helper: function(name, val) {
      if (arguments.length > 1) {
        return this._extend('helper', name, val);
      }

      return this._extension.helper[name];
    },

    component: function(name, val) {
      if (arguments.length > 1) {
        return this._extend('component', name, val);
      }

      return this._extension.component[name];
    },

    config: function(data) {
      var prop;

      if (!arguments.length) {
        return this._config;
      }

      for (prop in data) {
        this._config[prop] = data[prop];
      }

      return this;
    },

    run: function() {
      var data = url.getHashData(window.location.hash.slice(1));
      var self = this;

      this.trigger('beforerun');

      this._container = this._config.container;
      this._containerParent = this._container.parentNode;

      this._isAppRunning = true;
      // TODO handle missing container scenario

      if (data.view.length) {
        this.get(data.view, this._container, function() {
          self.trigger('initialviewready');
        });
      } else {
        this.navigate(this._config.defaultView);
      }

      this.trigger('run');

      return this;
    },

    navigate: function(hash) {
      //TODO add success and error callbacks

      window.location.hash = hash;

      return this;
    },

    on: function(evtName, fn) {
      var oldHandler = this._handler[evtName];

      if (typeof oldHandler === 'function') {
        this._handler[evtName] = function(evt) {
          oldHandler(evt);
          fn(evt);
        };
      } else {
        this._handler[evtName] = function(evt) {
          fn(evt);
        };
      }

      return this;
    },

    _extend: function(type, name, obj) {
      if (settings.types.indexOf(type) > -1) {
        if (typeof this._extension[type][name] === 'undefined') {
          this._extension[type][name] = obj;
        }
      }
      return this;
    },

    goBack: function() {
      //TODO check out history.back
      var lastPage = this._history.pop();

      if (!lastPage) {
        this.trigger('historyempty');
        return false;
      }

      this._isGoingBack = true;

      return this.navigate(lastPage);
    },

    setKeyset: function(val) {
      var mask = 0;
      var len;
      var i;
      var value;

      if (polyfil.isArray(val)) {
        len = val.length;

        for (i = 0; i < len; i++) {
          if (typeof val[i] === 'string') {
            value = settings.maskValues[val[i].toUpperCase()] || 0;
            mask += value;
          }
        }
      } else {
        mask = parseInt(val, 10) || 0;
      }

      hbbtv.setKeyset(mask);

      return this;
    },

    exit: function() {},

    _loadNewContent: function(view, cnt, done) {
      var self = this;
      var html;
      var cfg;

      async.parallel([function getTemplate(over) {
        async.get(self._config.template.dir + view +
        self._config.template.ext, function(res) {

          html = res;
          over();
        });
      }, function getConfig(over) {
        //TODO use async.json()
        async.get(self._config.template.dir + view + '.json',
        function(res) {
          cfg = res ? JSON.parse(res) : {};
          over();
        }, over);
      }], function contentLoaded() {
        self.setup(cnt, html, cfg, done);
      });
    },

    DOMInstance: function(el) {
      return el[settings.domProperty];
    },

    _getDeps: function(html) {
      var myRegexp = new RegExp(settings.htmlRegex);
      var deps = [];
      var match;
      var data;

      do {
        match = myRegexp.exec(html);
        if (match) {
          data = this._packages[match[1]];
          data.name = match[1];
          deps.push(data);
        }

      } while(match);

      return deps;
    },

    setup: function(cnt, html, cfg, done) {
      var self = this;
      var deps = this._getDeps(html);
      var elems;
      var el;

      cfg = cfg || {};

      requirejs(polyfil.map(deps, function(el) {
        return el.path;
      }), function() {
        var len = arguments.length;
        var i;
        var constructor;
        var className;
        var data;
        var target;

        for (i = 0; i < len; i++) {
          constructor = arguments[i];
          className = deps[i].name;

          self.component(className, constructor);
        }

        cnt.innerHTML = html;
        elems = sizzle(self._config.componentSelector, cnt);
        len = elems.length;

        for (i = 0; i < len; i++) {
          el = elems[i];
          data = polyfil.data(el);
          constructor = data.type;

          new self._extension.component[constructor](el, cfg);
        }

        //TODO determine focus
        if (elems.length) {
          target = elems[0];
        } else {
          //elems[0].focus();
        }

        self.DOMInstance(target).focus();

        if (typeof done === 'function') {
          done();
        }
      });

      return this;
    },

    _saveCurrentState: function(view) {
      var activeElement = polyfil.getActiveElement();
      var elems = [];
      var len = this._container.children.length;
      var i;

      for (i = 0; i < len; i++) {
        elems[i] = this._container.removeChild(
          this._container.children[0]);
      }

      this._states[view] = {
        activeElement: activeElement,
        elems: elems,
      };
    },

    _browse: function(newHash, oldHash, done) {
      var data = url.getHashData(newHash);
      var self = this;

      this.get(data.view, this._container, function() {
        if (oldHash && !self._isGoingBack) {
          self._history.push(oldHash);
        } else {
          self._isGoingBack = false;
        }

        //FIXME
        /*
        self.trigger('tmpReady', {
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
    },

    focus: function(el) {
      if (typeof el !== 'undefined' &&
        typeof el.focus === 'function') {
        el.focus();
      }

      return this;
    },

    get: function(view, cnt, done) {
      var state = this._states[view];
      var self = this;

      if (typeof state !== 'undefined') {
        // cache
        this._restoreState(cnt, state);

        this.focusNode(state.activeElement);
        finish();
      } else {
        this._loadNewContent(view, cnt, finish);
      }

      function finish() {
        self.trigger('viewchange', {
          view: view,
        });

        if (typeof done === 'function') {
          done();
        }
      }
    },

    trigger: function(evtName, data) {
      if (typeof this._handler[evtName] === 'function') {
        this._handler[evtName](data);
      }

      return this;
    },

    _restoreState: function(cnt, state) {
      var len = state.elems.length;
      var i;
      for (i = 0; i < len; i++) {
        cnt.appendChild(state.elems[i]);
      }

      return this;
    },

  });

  return HybridaTV;
});
