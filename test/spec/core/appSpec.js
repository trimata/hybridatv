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

      it('sets number', function() {
        app.setKeyset(3);

        expect(app._setMask).toHaveBeenCalledWith(3);
      });

    });
  });
});
