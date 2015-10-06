define([
  'hybridatv/core/app'
], function(App) {
  'use strict';

  document.body.innerHTML = '<div id="app-test"><div id="app">' +
  '<div id="app-container"></div></div></div>';

  describe('App', function() {
    var appContainer;
    var app;
    var $;
    var $container;

    beforeAll(function() {
      appContainer = document.getElementById('app-test');
      app = new App();
      $ = app.helper('Hb').$;
      $container = $(document.getElementById('app-container'));
    });

    afterAll(function() {
      appContainer.parentNode.removeChild(appContainer);
    });

    describe('when handling events', function() {
      var spy;

      beforeEach(function() {
        spy = jasmine.createSpy();
        app = new App();
      });

      it('triggers beforeRun event', function() {
        app.on('beforeRun', spy).run();
        expect(spy).toHaveBeenCalled();
      });

      it('triggers multiple events', function() {
        var spy2 = jasmine.createSpy();

        app
          .on('beforeRun', spy)
          .on('beforeRun', spy2)
          .run();

        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
      });

    });

    describe('configuration', function() {
      beforeEach(function() {
        app = new App();
      });

      it('sets options', function() {
        app.config({
          a: 42,
        });

        expect(app.config().a).toEqual(42);
      });

      xit('throws error if container does not exist', function() {
      });

    });

    describe('states', function() {
      var config = {};

      afterEach(function() {
        app = new App();
      });

      it('has empty state by default', function() {
        expect(app.state()).toEqual({});
      });

      it('saves a state', function() {
        app.saveState('main', $container, config);

        expect(app.state('main')).toEqual(jasmine.objectContaining({
          elem: $container,
          config: config,
        }));
      });

      it('overwrites state', function() {
        app
          .saveState('main', $container, config)
          .saveState('main', $container, null);

        expect(app.state('main')).toEqual(jasmine.objectContaining({
          elem: $container,
          config: null,
        }));
      });

      describe('when requesting a view', function() {
        beforeEach(function() {
          app.saveState('main', $container);
        });

        it('tries to restore the state if available', function() {
          spyOn(app, 'restoreState');

          app.get('main', $container);
          expect(app.restoreState).toHaveBeenCalled();
        });

        it('loads new content if no state', function() {
          spyOn(app, 'loadNewContent');

          app.get('other', $container);
          expect(app.loadNewContent).toHaveBeenCalled();
        });
      });
    });

    xdescribe('history data', function() {
      afterEach(function() {
        app._resetHistory();
      });

      it('is empty when initialized', function() {
        expect(app.getHistory()).toEqual([]);
      });

      /*
      xit('spec message', function() {
        app._updateContent();
        expect();
      });
      */
    });

    xdescribe('when dealing with helpers', function() {
      afterEach(function() {
        app._resetHelpers();
      });

      it('gets helper undefined if not defined', function() {
        app.helper('fake', 42);
        expect(app.helper('dummy')).not.toBeDefined();
      });

      it('gets helper if defined', function() {
        app.helper('dummy', 42);
        expect(app.helper('dummy')).toBeDefined();
      });

      it('can not redefine helper', function() {
        app.helper('dummy', 42);
        app.helper('dummy', 43);

        expect(app.helper('dummy'), 42);
      });
    });

    xdescribe('when setting bitmask', function() {
      beforeEach(function() {
        spyOn(app, '_setMask');
      });

      it('sets 0 if no arguments are passed', function() {
        app.setKeyset();

        expect(app._setMask).toHaveBeenCalledWith(0);
      });

      it('sets 0 if empty array is passed', function() {
        app.setKeyset([]);

        expect(app._setMask).toHaveBeenCalledWith(0);
      });

      it('sets value of 15 if the four colors are passed', function() {
        app.setKeyset(['RED', 'GREEN', 'BLUE', 'YELLOW']);

        expect(app._setMask).toHaveBeenCalledWith(15);
      });

      it('invalid labels are ignored', function() {
        app.setKeyset(['VCR', 'INVALID', 'RED']);

        expect(app._setMask).toHaveBeenCalledWith(33);
      });

      it('sets any number', function() {
        app.setKeyset(3);

        expect(app._setMask).toHaveBeenCalledWith(3);

        app.setKeyset(-3);

        expect(app._setMask).toHaveBeenCalledWith(-3);
      });

    });
  });
});
