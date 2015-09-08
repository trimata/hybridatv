define([
  'hybridatv/core/app'
], function(app) {
  'use strict';

  document.body.innerHTML = '<div id="app-test"><div id="app"></div></div>';

  describe('App', function() {
    var appContainer;

    beforeAll(function() {
      appContainer = document.getElementById('app-test');
    });

    afterAll(function() {
      appContainer.parentNode.removeChild(appContainer);
    });

    describe('when handling events', function() {
      var spy;

      beforeEach(function() {
        spy = jasmine.createSpy();
      });

      afterEach(function() {
        app._resetHandlers();
      });

      it('triggers beforeRun event', function() {
        app.on('beforeRun', spy).run();
        expect(spy).toHaveBeenCalled();
      });

    });

    describe('when dealing with helpers', function() {
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

    describe('when setting bitmask', function() {
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
