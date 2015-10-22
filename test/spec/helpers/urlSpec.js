define([
  'hybridatv/helpers/url',
], function(url) {
  'use strict';

  describe('url', function() {
    describe('#queryString', function() {

      it('empty object', function() {
        var data = {};

        expect(url.queryString(data)).toEqual('');
      });

      it('plain object', function() {
        var data = { foo: 'bar', };

        expect(url.queryString(data)).toEqual('foo=bar');
      });

      it('array as a property', function() {
        var data = { foo: ['bar', 'baz'], beta: 42, };

        expect(url.queryString(data))
          .toEqual('foo[]=bar&foo[]=baz&beta=42');
      });
    });
  });
});

