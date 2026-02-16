/* ==========================================================================
   VIB3+ Samsung TV — Remote Control Module
   Tizen TV Input Device API + keyboard fallback for desktop testing
   Key mappings from REPORT_1_ONBOARDING.md
   ========================================================================== */

window.VIB3Remote = (function () {
  'use strict';

  var callbacks = {};

  // Tizen TV remote key codes
  var KEYS = {
    // Color buttons
    RED: 403,
    GREEN: 404,
    YELLOW: 405,
    BLUE: 406,
    // Navigation
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ENTER: 13,
    BACK: 10009,
    // Transport
    PLAY_PAUSE: 10252,
    STOP: 413,
    // Channel / Volume
    CH_UP: 427,
    CH_DOWN: 428,
    VOL_UP: 447,
    VOL_DOWN: 448,
    // Info
    INFO: 457,
    // Number keys (0-9)
    NUM_0: 48,
    NUM_1: 49,
    NUM_2: 50,
    NUM_3: 51,
    NUM_4: 52,
    NUM_5: 53,
    NUM_6: 54,
    NUM_7: 55,
    NUM_8: 56,
    NUM_9: 57
  };

  // Keys that need explicit Tizen registration
  var TIZEN_REGISTER_KEYS = [
    'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue',
    'MediaPlayPause', 'MediaStop',
    'ChannelUp', 'ChannelDown',
    'VolumeUp', 'VolumeDown',
    'Info'
  ];

  /**
   * Initialize remote control.
   * @param {Object} cbs - Callback object:
   *   onSystemSwitch(systemIdx)     - 0=Faceted, 1=Quantum, 2=Holographic
   *   onGeometryChange(delta)       - +1/-1 for cycling
   *   onGeometryDirect(baseIdx)     - 0-7 direct base selection
   *   onCoreWarpChange(delta)       - +1/-1 for core warp cycling
   *   onParamAdjust(delta)          - +1/-1 for focused param in menu
   *   onParamNavigate(delta)        - +1/-1 to move param focus
   *   onToggleHud()
   *   onToggleMenu()
   *   onToggleFreeze()
   *   onReset()
   *   onSensitivity(delta)          - +0.1/-0.1
   *   onAnyKey()                    - dismiss startup, reset idle timer
   *   isMenuOpen()                  - returns bool
   */
  function init(cbs) {
    callbacks = cbs || {};

    // Register Tizen-specific keys (fails gracefully on non-Tizen)
    registerTizenKeys();

    // Keyboard event listener
    document.addEventListener('keydown', handleKeyDown, false);
  }

  function registerTizenKeys() {
    try {
      if (typeof tizen !== 'undefined' && tizen.tvinputdevice) {
        for (var i = 0; i < TIZEN_REGISTER_KEYS.length; i++) {
          try {
            tizen.tvinputdevice.registerKey(TIZEN_REGISTER_KEYS[i]);
          } catch (e) {
            // Some keys may not be available on all models
          }
        }
        console.log('VIB3Remote: Tizen keys registered');
      }
    } catch (e) {
      console.log('VIB3Remote: Not a Tizen device, using keyboard fallback');
    }
  }

  function handleKeyDown(e) {
    var code = e.keyCode;
    var menuOpen = callbacks.isMenuOpen ? callbacks.isMenuOpen() : false;

    // Always fire onAnyKey for startup dismiss / idle reset
    if (callbacks.onAnyKey) callbacks.onAnyKey();

    // Prevent default for handled keys
    var handled = true;

    switch (code) {
      // ── Color Buttons: System Switching ──
      case KEYS.RED:
        if (callbacks.onSystemSwitch) callbacks.onSystemSwitch(0); // Faceted
        break;
      case KEYS.GREEN:
        if (callbacks.onSystemSwitch) callbacks.onSystemSwitch(1); // Quantum
        break;
      case KEYS.YELLOW:
        if (callbacks.onSystemSwitch) callbacks.onSystemSwitch(2); // Holographic
        break;
      case KEYS.BLUE:
        if (callbacks.onToggleHud) callbacks.onToggleHud();
        break;

      // ── D-pad Navigation ──
      case KEYS.LEFT:
        if (menuOpen) {
          if (callbacks.onParamAdjust) callbacks.onParamAdjust(-1);
        } else {
          if (callbacks.onGeometryChange) callbacks.onGeometryChange(-1);
        }
        break;
      case KEYS.RIGHT:
        if (menuOpen) {
          if (callbacks.onParamAdjust) callbacks.onParamAdjust(1);
        } else {
          if (callbacks.onGeometryChange) callbacks.onGeometryChange(1);
        }
        break;
      case KEYS.UP:
        if (menuOpen) {
          if (callbacks.onParamNavigate) callbacks.onParamNavigate(-1);
        }
        break;
      case KEYS.DOWN:
        if (menuOpen) {
          if (callbacks.onParamNavigate) callbacks.onParamNavigate(1);
        }
        break;

      // ── Confirm / Back ──
      case KEYS.ENTER:
        if (callbacks.onToggleMenu) callbacks.onToggleMenu();
        break;
      case KEYS.BACK:
        if (menuOpen) {
          if (callbacks.onToggleMenu) callbacks.onToggleMenu();
        }
        // On Tizen, BACK should exit app if not in menu — handled in app.js
        break;

      // ── Transport ──
      case KEYS.PLAY_PAUSE:
        if (callbacks.onToggleFreeze) callbacks.onToggleFreeze();
        break;
      case KEYS.STOP:
        if (callbacks.onReset) callbacks.onReset();
        break;

      // ── Channel: Core Warp Cycling ──
      case KEYS.CH_UP:
        if (callbacks.onCoreWarpChange) callbacks.onCoreWarpChange(1);
        break;
      case KEYS.CH_DOWN:
        if (callbacks.onCoreWarpChange) callbacks.onCoreWarpChange(-1);
        break;

      // ── Volume: Audio Sensitivity ──
      case KEYS.VOL_UP:
        if (callbacks.onSensitivity) callbacks.onSensitivity(0.1);
        break;
      case KEYS.VOL_DOWN:
        if (callbacks.onSensitivity) callbacks.onSensitivity(-0.1);
        break;

      // ── Info: Toggle HUD ──
      case KEYS.INFO:
        if (callbacks.onToggleHud) callbacks.onToggleHud();
        break;

      // ── Number Keys: Direct Geometry Selection ──
      default:
        if (code >= KEYS.NUM_0 && code <= KEYS.NUM_9) {
          var num = code - KEYS.NUM_0;
          if (num < 8) {
            if (callbacks.onGeometryDirect) callbacks.onGeometryDirect(num);
          }
        } else {
          // Desktop testing shortcuts
          switch (code) {
            case 49: // '1' key (non-numpad) on desktop
            case 50:
            case 51:
              // 1/2/3 = system switch on desktop (matches VIB3+ keyboard shortcuts)
              if (callbacks.onSystemSwitch) callbacks.onSystemSwitch(code - 49);
              break;
            case 70: // 'F' = toggle freeze on desktop
              if (callbacks.onToggleFreeze) callbacks.onToggleFreeze();
              break;
            case 72: // 'H' = toggle HUD on desktop
              if (callbacks.onToggleHud) callbacks.onToggleHud();
              break;
            case 77: // 'M' = toggle menu on desktop
              if (callbacks.onToggleMenu) callbacks.onToggleMenu();
              break;
            case 82: // 'R' = reset on desktop
              if (callbacks.onReset) callbacks.onReset();
              break;
            default:
              handled = false;
          }
        }
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function destroy() {
    document.removeEventListener('keydown', handleKeyDown, false);
  }

  return {
    init: init,
    destroy: destroy,
    KEYS: KEYS
  };
})();
