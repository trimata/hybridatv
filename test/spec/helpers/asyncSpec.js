define([
  'hybridatv/helpers/async',
], function(async) {
  'use strict';

  describe('async', function() {

    describe('#post', function() {
      beforeEach(function() {
        spyOn(async, 'request');
      });

      it('does not append params to url', function() {
        var data = { foo: 'bar', };
        var lastCall;

        async.post('fake_url', data);

        lastCall = async.request.calls.mostRecent();

        expect(lastCall.args[1]).toEqual('post');
        expect(lastCall.args[3]).toEqual('foo=bar');
      });
    });

    describe('#get', function() {
      beforeEach(function() {
        spyOn(async, 'request');
      });

      it('with callback', function() {
        var voidFn = function() {};

        async.get('fake_url?foo=bar', voidFn);

        expect(async.request).toHaveBeenCalledWith(
          'fake_url?foo=bar',
          'get',
          [],
          '',
          voidFn,
          undefined
        );
      });

      it('without data', function() {
        async.get('fake_url');

        expect(async.request).toHaveBeenCalledWith(
          'fake_url',
          'get',
          [],
          '',
          undefined,
          undefined
        );
      });

      it('data is appended to the url', function() {
        async.get('fake_url?a=42', { foo: 'bar',});

        expect(async.request).toHaveBeenCalledWith(
          'fake_url?a=42&foo=bar',
          'get',
          [],
          '',
          undefined,
          undefined
        );
      });
    });

    describe('#parallel', function() {
      beforeEach(function() {
        jasmine.clock().install();
      });

      afterEach(function() {
        jasmine.clock().uninstall();
      });

      it('handles parallel functions', function() {
        var spy = jasmine.createSpy();

        async.parallel([function(done) {
          done();
        }, function(done) {
          setTimeout(function() {
            done();
          }, 500);
        }], spy);

        jasmine.clock().tick(499);

        expect(spy).not.toHaveBeenCalled();

        jasmine.clock().tick(1);

        expect(spy).toHaveBeenCalled();
      });

    });
  });
});
