define({
  domProperty: '__hybridatv__',

  types: ['helper', 'component'],

  htmlRegex: /data-type=\"(.+?)\"/g,

  templateRegex: /\{\$(.+?)\}/g,

  maskValues: {
    RED        : 1,
    GREEN      : 2,
    YELLOW     : 4,
    BLUE       : 8,
    NAVIGATION : 16,
    VCR        : 32,
    SCROLL     : 64,
    INFO       : 128,
    NUMERIC    : 256,
    ALPHA      : 512,
    OTHER      : 1024,
  },
});
