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
      this._packages = config.packages || packages;
      this._history = [];
      this._states = {};
      this._handler = {};
      this._template = {};
      this._hashParams = {};

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

      this.helper('sizzle', sizzle);

      window.addEventListener('hashchange', this._hashchangehandler);
      document.addEventListener('keydown', this._keydownhandler);
    },

    custom: {},

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

    template: function(key, html) {
      this._template[key] = html;

      return this;
    },

    run: function() {
      var hash = window.location.hash.slice(1);
      var self = this;

      this.trigger('beforerun');

      this._container = this._config.container;
      this._containerParent = this._container.parentNode;

      this._isAppRunning = true;
      // TODO handle missing container scenario

      if (hash) {
        this._browse(hash, '', function() {
          self.trigger('initialviewready');
        });
      } else {
        //redirect
        this.navigate(this._config.defaultView);
      }

      this.trigger('run');

      return this;
    },

    navigate: function(hash, params) {
      //TODO add success and error callbacks
      //
      var _location = hash;
      var data;

      params = params || {};

      for (data in params) {
        _location += '/' + data + ':' + params[data];
      }

      window.location.hash = _location;

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
      var lastPage;

      if (!this._history.length) {
        this.trigger('historyempty');
        return false;
      }

      lastPage = this._history.pop();

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
        cfg = {};
        over();
        /*
        async.get(self._config.template.dir + view + '.json',
        function(res) {
          cfg = res ? JSON.parse(res) : {};
          over();
        }, over);
        */
      }], function contentLoaded() {
        self._parseHTML(cnt, html, false, cfg, done);
      });
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
          //if (typeof data === 'undefined') {
          //}
          data.name = match[1];
          deps.push(data);
        }

      } while(match);

      return deps;
    },

    _parseTemplate: function(html) {
      var self = this;

      return html.replace(settings.templateRegex, function() {
        return self._template[arguments[1]];
      });
    },

    //FIXME
    //will be deprecated
    parse: function(cnt, html, stealFocus, cfg) {
      cfg = cfg || {};
      stealFocus = stealFocus || false;

      this._parseHTML(cnt, html, stealFocus, cfg);
    },

    //rename to render
    parseAsync: function(cnt, fn, stealFocus, cfg, done) {
      var self = this;

      if (arguments.length < 4) {
        done = stealFocus;
        cfg = {};
        stealFocus = false;
      } else if (arguments.length < 5) {
        done = cfg;
        cfg = {};
      }

      cnt.innerHTML = '';
      polyfil.addClass(cnt, this._config.loadingClass);

      if (typeof fn === 'string') {
        this._parseHTML(cnt, fn, stealFocus, cfg, done);
      } else {
        fn(function(html) {
          self._parseHTML(cnt, html, stealFocus, cfg, done);
        });
      }

      return this;
    },

    _parseHTML: function(cnt, html, stealFocus, cfg, done) {
      var self = this;
      var deps;
      var elems;
      var el;

      if (this._config.parseHTML) {
        html = this._parseTemplate(html);
      }

      polyfil.addClass(cnt, this._config.loadingClass);

      deps = this._getDeps(html);
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

        polyfil.removeClass(cnt, self._config.loadingClass);
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

        if (stealFocus) {
          if (len) {
            target = elems[0];
          } else {
            target = cnt;
          }

          self.trigger('focusinit', target);
        }

        self.trigger('contentchange', cnt);
        self.trigger('newcontentadded', cnt);

        if (typeof done === 'function') {
          done();
        }
      });

      return this;
    },

    _saveCurrentState: function(hash) {
      var activeElement = polyfil.getActiveElement(this._config.focusClass);
      var elems = [];
      var len = this._container.children.length;
      var view = url.getHashData(hash).view;
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

    resetHistory: function() {
      this._history = [];

      return this;
    },

    hashParams: function() {
      //TODO
      //return this._hashParams;
    },

    _browse: function(newHash, oldHash, done) {
      var self = this;

      this.get(newHash, this._container, function() {
        if (oldHash && !self._isGoingBack) {
          self._history.push(oldHash);
        } else {
          self._isGoingBack = false;
        }

        if (typeof done === 'function') {
          done();
        }
      });

      return this;
    },

    get: function(hash, cnt, done) {
      var self = this;
      var data = url.getHashData(hash);
      var state = this._states[data.view];

      if (typeof state !== 'undefined') {
        // cache
        this._restoreState(cnt, state);

        this.trigger('focusrestore', state.activeElement);

        finish();
      } else {
        this._loadNewContent(data.view, cnt, finish);
      }

      function finish() {
        self.trigger('viewchange', data);
        self.trigger('containerhtmlchange', cnt);

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
