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

      it('sets 0 if empty array is passed', function() {
        app.setKeyset([]);

        expect(app._setMask).toHaveBeenCalledWith(0);
      });
    });


  });

});
