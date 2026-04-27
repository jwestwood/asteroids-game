let audioCtx = null;
let masterGain = null;
let thrustOsc = null;
let thrustGain = null;
let thrustActive = false;

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioCtx.destination);
}

function resumeAudio() {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function createNoise(duration) {
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    return source;
}

const SOUNDS = {
    shoot: () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    },

    explosion: () => {
        const noise = createNoise(0.3);
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start();
        noise.stop(audioCtx.currentTime + 0.3);
    },

    shieldHit: () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    },

    shipHit: () => {
        const noise = createNoise(0.6);
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.6, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start();
        noise.stop(audioCtx.currentTime + 0.6);
    },

    powerup: () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.08);
        osc.frequency.setValueAtTime(784, audioCtx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    },

    nuke: () => {
        const noise = createNoise(1.5);
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 1.5);
        gain.gain.setValueAtTime(0.7, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start();
        noise.stop(audioCtx.currentTime + 1.5);
    },

    levelComplete: () => {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            const t = audioCtx.currentTime + i * 0.12;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(t);
            osc.stop(t + 0.2);
        });
    },

    gameOver: () => {
        const notes = [440, 370, 311, 261];
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            const t = audioCtx.currentTime + i * 0.25;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(t);
            osc.stop(t + 0.3);
        });
    },

    gameStart: () => {
        const notes = [261, 329, 392, 523];
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            const t = audioCtx.currentTime + i * 0.1;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(t);
            osc.stop(t + 0.2);
        });
    },

    respawn: () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    },
};

export function playSound(name) {
    if (!audioCtx) return;
    resumeAudio();
    const soundFn = SOUNDS[name];
    if (soundFn) soundFn();
}

export function startThrust() {
    if (!audioCtx || thrustActive) return;
    resumeAudio();
    thrustActive = true;
    thrustOsc = audioCtx.createOscillator();
    thrustGain = audioCtx.createGain();
    thrustOsc.type = 'sawtooth';
    thrustOsc.frequency.setValueAtTime(80, audioCtx.currentTime);
    thrustGain.gain.setValueAtTime(0, audioCtx.currentTime);
    thrustGain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.05);
    thrustOsc.connect(thrustGain);
    thrustGain.connect(masterGain);
    thrustOsc.start();
}

export function stopThrust() {
    if (!audioCtx || !thrustActive) return;
    thrustActive = false;
    if (thrustGain) {
        thrustGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.05);
        setTimeout(() => {
            if (thrustOsc) {
                thrustOsc.stop();
                thrustOsc = null;
                thrustGain = null;
            }
        }, 60);
    }
}

export { initAudio };
