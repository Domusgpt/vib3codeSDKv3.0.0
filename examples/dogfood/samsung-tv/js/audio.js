// Hybrid Audio Pipeline: Mic -> Synthetic Fallback

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.analyser = null;
        this.bands = new Float32Array(8);
        this.bass = 0;
        this.mid = 0;
        this.high = 0;
        this.isSynthetic = false;

        // FFT Buffers
        this.freqData = null;
    }

    async init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.ctx.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
            this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

            if (this.ctx.state === 'suspended') await this.ctx.resume();

            // Try Mic
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = this.ctx.createMediaStreamSource(stream);
            source.connect(this.analyser);
            console.log("Mic initialized");
        } catch (e) {
            console.warn("Mic failed, using synthetic audio:", e);
            this.startSynthetic();
        }
    }

    startSynthetic() {
        this.isSynthetic = true;
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (!this.analyser) {
            this.analyser = this.ctx.createAnalyser();
            this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
        }

        // Evolving Drone
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.value = 60; // Bass

        osc2.type = 'sine';
        osc2.frequency.value = 200; // Mid

        // LFO for movement
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.2;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 50;

        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);

        gain.gain.value = 0.1;

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.analyser);
        gain.connect(this.ctx.destination); // Optional: hear it

        osc1.start();
        osc2.start();
        lfo.start();
    }

    update() {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(this.freqData);

        // Simple 3-band averaging
        // Bass: 0-10
        let sum = 0;
        for(let i=0; i<10; i++) sum += this.freqData[i];
        this.bass = (sum / 10) / 255;

        // Mid: 20-100
        sum = 0;
        for(let i=20; i<100; i++) sum += this.freqData[i];
        this.mid = (sum / 80) / 255;

        // High: 200-500
        sum = 0;
        for(let i=200; i<500; i++) sum += this.freqData[i];
        this.high = (sum / 300) / 255;

        // Populate 8 bands for UI visualization
        for(let i=0; i<8; i++) {
            // Rough mapping
            let start = Math.floor(Math.pow(2, i) * 2);
            let end = Math.floor(Math.pow(2, i+1) * 2);
            let bSum = 0;
            for(let j=start; j<end && j<this.freqData.length; j++) bSum += this.freqData[j];
            this.bands[i] = (bSum / (end-start)) / 255;
        }
    }
}
