/* ==========================================================================
   VIB3+ Samsung TV — Audio Module
   8-band FFT analysis with mic capture + synthetic fallback
   Matching synesthesia.html bin ranges (44100 Hz, 2048-point FFT)
   ========================================================================== */

window.VIB3Audio = (function () {
  'use strict';

  // 8-band bin ranges for 44100 Hz sample rate, FFT size 2048
  // Each bin = 44100/2048 ≈ 21.53 Hz
  var BAND_RANGES = [
    [1, 3],     // Band 0: Sub-bass   (21-65 Hz)
    [3, 9],     // Band 1: Bass       (65-194 Hz)
    [9, 23],    // Band 2: Low-mid    (194-496 Hz)
    [23, 56],   // Band 3: Mid        (496-1.2kHz)
    [56, 139],  // Band 4: Upper-mid  (1.2-3kHz)
    [139, 279], // Band 5: Presence   (3-6kHz)
    [279, 558], // Band 6: Brilliance (6-12kHz)
    [558, 930]  // Band 7: Air        (12-20kHz)
  ];

  var audioCtx = null;
  var analyser = null;
  var freqData = null;       // Uint8Array from analyser
  var prevFreqData = null;   // Float32Array for spectral flux
  var audioActive = false;
  var syntheticMode = false;
  var sensitivity = 1.0;

  // Pre-allocated output buffers (no GC in render loop)
  var bands = new Float32Array(8);
  var prevBands = new Float32Array(8);
  var spectralFlux = 0;
  var spectralFluxAvg = 0;
  var onset = false;
  var lastOnsetTime = 0;

  // Synthetic state
  var syntheticPhases = new Float32Array(8);

  function init() {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      freqData = new Uint8Array(analyser.frequencyBinCount);
      prevFreqData = new Float32Array(analyser.frequencyBinCount);
    } catch (e) {
      console.warn('VIB3Audio: Web Audio API not available, using synthetic');
      syntheticMode = true;
    }
  }

  function start() {
    if (audioActive) return;

    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Try microphone capture (TV picks up room audio from its own speakers)
    if (audioCtx && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
          var source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          audioActive = true;
          syntheticMode = false;
          console.log('VIB3Audio: Microphone capture active');
        })
        .catch(function () {
          console.warn('VIB3Audio: Mic denied, falling back to synthetic');
          startSynthetic();
        });
    } else {
      startSynthetic();
    }
  }

  function startSynthetic() {
    syntheticMode = true;
    audioActive = true;

    if (!audioCtx) return;

    // Evolving multi-oscillator signal for FFT analysis
    var osc1 = audioCtx.createOscillator();
    var osc2 = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 110;
    osc2.type = 'sawtooth';
    osc2.frequency.value = 220;
    gain.gain.value = 0.03;
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(analyser);

    // LFO modulates frequency for evolving spectrum
    var lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.1;
    var lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 80;
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    osc1.start();
    osc2.start();
    lfo.start();

    console.log('VIB3Audio: Synthetic audio active');
  }

  function stop() {
    audioActive = false;
    if (audioCtx) {
      audioCtx.suspend();
    }
  }

  /**
   * Process audio data. Call once per frame.
   * @param {number} dt - delta time in seconds
   */
  function process(dt) {
    if (!audioActive) {
      // Zero out when inactive
      for (var i = 0; i < 8; i++) bands[i] = 0;
      onset = false;
      return;
    }

    if (analyser && freqData) {
      analyser.getByteFrequencyData(freqData);

      // 8-band energy extraction
      for (var b = 0; b < 8; b++) {
        var sum = 0;
        var lo = BAND_RANGES[b][0];
        var hi = BAND_RANGES[b][1];
        for (var j = lo; j < hi && j < freqData.length; j++) {
          sum += freqData[j];
        }
        var raw = sum / ((hi - lo) * 255) * sensitivity;

        // EMA smoothing: alpha = 1 - exp(-dt/tc), tc~0.1s
        var alpha = 1 - Math.exp(-dt / 0.1);
        bands[b] += (raw - bands[b]) * alpha;
      }

      // Spectral flux for onset detection
      var flux = 0;
      for (var k = 0; k < freqData.length; k++) {
        var diff = freqData[k] / 255 - prevFreqData[k];
        if (diff > 0) flux += diff;
        prevFreqData[k] = freqData[k] / 255;
      }
      var fluxAlpha = 1 - Math.exp(-dt / 0.3);
      spectralFluxAvg += (flux - spectralFluxAvg) * fluxAlpha;
      spectralFlux = flux;

      // Onset detection with 100ms cooldown
      var now = performance.now();
      if (flux > spectralFluxAvg * 3.0 && flux > 0.05 && (now - lastOnsetTime) > 100) {
        onset = true;
        lastOnsetTime = now;
      } else {
        onset = false;
      }
    } else if (syntheticMode) {
      // Pure synthetic band generation (when audioCtx unavailable)
      var t = performance.now() * 0.001;
      for (var s = 0; s < 8; s++) {
        syntheticPhases[s] += dt * (0.3 + s * 0.15);
        bands[s] = (Math.sin(syntheticPhases[s]) * 0.5 + 0.5) *
                   (0.3 + Math.random() * 0.2) * sensitivity;
      }
      onset = (Math.random() < 0.005); // ~1 onset every 6-7 seconds at 30fps
    }
  }

  /**
   * Get current audio data. No allocation — returns shared buffers.
   * @returns {{ bands: Float32Array, bass: number, mid: number, high: number, onset: boolean }}
   */
  function getAudioData() {
    return {
      bands: bands,
      bass: bands[1],
      mid: bands[3],
      high: bands[6],
      onset: onset,
      spectralFlux: spectralFlux
    };
  }

  function setSensitivity(val) {
    sensitivity = Math.max(0.1, Math.min(3.0, val));
  }

  function getSensitivity() {
    return sensitivity;
  }

  function isSynthetic() {
    return syntheticMode;
  }

  function isActive() {
    return audioActive;
  }

  return {
    init: init,
    start: start,
    stop: stop,
    process: process,
    getAudioData: getAudioData,
    setSensitivity: setSensitivity,
    getSensitivity: getSensitivity,
    isSynthetic: isSynthetic,
    isActive: isActive
  };
})();
