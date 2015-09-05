/* globals KeyEvent */
define([], function() {
  'use strict';

  var keyCodes = {};

  if (typeof KeyEvent !== 'undefined') {
    if (typeof KeyEvent.VK_LEFT !== 'undefined') {
      keyCodes.VK_LEFT = KeyEvent.VK_LEFT;
      keyCodes.VK_UP = KeyEvent.VK_UP;
      keyCodes.VK_RIGHT = KeyEvent.VK_RIGHT;
      keyCodes.VK_DOWN = KeyEvent.VK_DOWN;
    }
    if (typeof KeyEvent.VK_ENTER !== 'undefined') {
      keyCodes.VK_ENTER = KeyEvent.VK_ENTER;
    }
    if (typeof KeyEvent.VK_RED !== 'undefined') {
      keyCodes.VK_RED = KeyEvent.VK_RED;
      keyCodes.VK_GREEN = KeyEvent.VK_GREEN;
      keyCodes.VK_YELLOW = KeyEvent.VK_YELLOW;
      keyCodes.VK_BLUE = KeyEvent.VK_BLUE;
    }
    if (typeof KeyEvent.VK_PLAY !== 'undefined') {
      keyCodes.VK_PLAY = KeyEvent.VK_PLAY;
      keyCodes.VK_PAUSE = KeyEvent.VK_PAUSE;
      keyCodes.VK_STOP = KeyEvent.VK_STOP;
    }
    if (typeof KeyEvent.VK_FAST_FWD !== 'undefined') {
      keyCodes.VK_FAST_FWD = KeyEvent.VK_FAST_FWD;
      keyCodes.VK_REWIND = KeyEvent.VK_REWIND;
    }
    if (typeof KeyEvent.VK_BACK !== 'undefined') {
      keyCodes.VK_BACK = KeyEvent.VK_BACK;
    }
    if (typeof KeyEvent.VK_0 !== 'undefined') {
      keyCodes.VK_0 = KeyEvent.VK_0;
      keyCodes.VK_1 = KeyEvent.VK_1;
      keyCodes.VK_2 = KeyEvent.VK_2;
      keyCodes.VK_3 = KeyEvent.VK_3;
      keyCodes.VK_4 = KeyEvent.VK_4;
      keyCodes.VK_5 = KeyEvent.VK_5;
      keyCodes.VK_6 = KeyEvent.VK_6;
      keyCodes.VK_7 = KeyEvent.VK_7;
      keyCodes.VK_8 = KeyEvent.VK_8;
      keyCodes.VK_9 = KeyEvent.VK_9;
    }
  }
  if (typeof keyCodes.VK_LEFT === 'undefined') {
    keyCodes.VK_LEFT = 0x25;
    keyCodes.VK_UP = 0x26;
    keyCodes.VK_RIGHT = 0x27;
    keyCodes.VK_DOWN = 0x28;
  }
  if (typeof keyCodes.VK_ENTER === 'undefined') {
    keyCodes.VK_ENTER = 0x0d;
  }
  if (typeof keyCodes.VK_RED === 'undefined') {
    keyCodes.VK_RED = 0x74;
    keyCodes.VK_GREEN = 0x75;
    keyCodes.VK_YELLOW = 0x76;
    keyCodes.VK_BLUE = 0x77;
  }
  if (typeof keyCodes.VK_PLAY === 'undefined') {
    keyCodes.VK_PLAY = 0x50;
    keyCodes.VK_PAUSE = 0x51;
    keyCodes.VK_STOP = 0x53;
  }
  if (typeof keyCodes.VK_FAST_FWD === 'undefined') {
    keyCodes.VK_FAST_FWD = 0x46;
    keyCodes.VK_REWIND = 0x52;
  }
  if (typeof keyCodes.VK_BACK === 'undefined') {
    keyCodes.VK_BACK = 0xa6;
  }
  if (typeof keyCodes.VK_0 === 'undefined') {
    keyCodes.VK_0 = 0x30;
    keyCodes.VK_1 = 0x31;
    keyCodes.VK_2 = 0x32;
    keyCodes.VK_3 = 0x33;
    keyCodes.VK_4 = 0x34;
    keyCodes.VK_5 = 0x35;
    keyCodes.VK_6 = 0x36;
    keyCodes.VK_7 = 0x37;
    keyCodes.VK_8 = 0x38;
    keyCodes.VK_9 = 0x39;
  }

  return keyCodes;
  /*
    states: {
      STOPPED: 0,
      PLAYING: 1,
      PAUSED: 2,
      CONNECTING: 3,
      BUFFERRING: 4,
      FINISHED: 5,
      ERROR: 6
    }
  */
});
