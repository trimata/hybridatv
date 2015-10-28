define([
  'hybridatv/helpers/url',
], function(url) {
  'use strict';

  describe('url', function() {
    describe('#getParams', function() {
      it('empty string', function() {
        expect(url.getParams('')).toEqual({});
      });

      it('single key/value', function() {
        expect(url.getParams('foo=bar')).toEqual({
          foo: 'bar',
        });
      });

      //FIXME
      xit('complex string', function() {
        expect(url.getParams('foo[]=bar&foo[]=baz&beta=42'))
        .toEqual({
          foo: ['bar', 'baz'], beta: 42,
        });
      });
    });

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

