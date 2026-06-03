// Custom Web Audio API synthesizer for retro-arcade sound effects
let audioCtx: AudioContext | null = null;
let bgmInterval: any = null;
let bgmCurrentTime = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  // Try to resume if suspended (browser security autoplay policy)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playSound = {
  // Jump sound effect - rising frequency sweep (pitch bend up)
  jump: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle'; // Retro square/triangle feel
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {
      console.log('Audio playback error', e);
    }
  },

  // Collect item sound - shining major arpeggio
  collect: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const time = ctx.currentTime + index * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.linearRampToValueAtTime(0.01, time + 0.12);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.15);
      });
    } catch (e) {
      console.log(e);
    }
  },

  // Hit block / bounce sound - clean pop
  bounce: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      console.log(e);
    }
  },

  // Hit block / trigger skills
  powerUp: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.setValueAtTime(450, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.16);
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.24);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.32);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    } catch (e) {}
  },

  // Hurt / Hit enemy sound - sudden noisy crash
  hurt: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.2);
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  },

  // Defeat/Level fail - descending slide
  defeat: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  },

  // Level transition / victory slide - high-energy arpeggio
  levelUp: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    try {
      const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio up scale
      freqs.forEach((f, i) => {
        const time = ctx.currentTime + i * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, time);
        
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.linearRampToValueAtTime(0.01, time + 0.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.25);
      });
    } catch (e) {}
  },

  // Cosmic swell sound - for accepting the mirror Yoyo self reflection
  swell: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    try {
      // Create a few osc/modulators for rich pad sound
      const frequencies = [220, 275, 330, 440]; // lovely harmonic structure
      frequencies.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        // slow vibrato
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        mod.frequency.setValueAtTime(4, ctx.currentTime);
        modGain.gain.setValueAtTime(3, ctx.currentTime);
        
        mod.connect(modGain);
        modGain.connect(osc.frequency);
        
        // Volume swell
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.5);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 3.0);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        mod.start();
        osc.start();
        
        mod.stop(ctx.currentTime + 3.0);
        osc.stop(ctx.currentTime + 3.0);
      });
    } catch (e) {}
  },

  // Soft background retro sequence music player
  startBgm: (mute: boolean) => {
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
    if (mute) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    // Retro step sequencer looping
    // Simulates an 8-beat loop melody with low volume
    const melody = [
      261.63, 293.66, 329.63, 392.00, // C D E G
      349.23, 329.63, 293.66, 392.00, // F E D G
      329.63, 392.00, 440.00, 523.25, // E G A C
      440.00, 392.00, 329.63, 261.63  // A G E C
    ];
    let step = 0;

    bgmInterval = setInterval(() => {
      const innerCtx = getAudioContext();
      if (!innerCtx || innerCtx.state === 'suspended' || step === undefined) return;

      try {
        const f = melody[step % melody.length];
        // Play simple triangle bass/lead blend
        const osc = innerCtx.createOscillator();
        const gain = innerCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f / 2, innerCtx.currentTime); // lower octave for chill vibes
        osc.frequency.linearRampToValueAtTime(f / 2 + 2, innerCtx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.02, innerCtx.currentTime); // extremely quiet background hum
        gain.gain.linearRampToValueAtTime(0.001, innerCtx.currentTime + 0.38);
        
        osc.connect(gain);
        gain.connect(innerCtx.destination);
        
        osc.start();
        osc.stop(innerCtx.currentTime + 0.4);
        
        // Add a soft percussion tap on beat 0 and 4
        if (step % 4 === 0) {
          const tickOsc = innerCtx.createOscillator();
          const tickGain = innerCtx.createGain();
          tickOsc.type = 'sine';
          tickOsc.frequency.setValueAtTime(800, innerCtx.currentTime);
          tickGain.gain.setValueAtTime(0.015, innerCtx.currentTime);
          tickGain.gain.linearRampToValueAtTime(0.001, innerCtx.currentTime + 0.05);
          tickOsc.connect(tickGain);
          tickGain.connect(innerCtx.destination);
          tickOsc.start();
          tickOsc.stop(innerCtx.currentTime + 0.06);
        }
        
        step++;
      } catch (err) {
        // Safe fail
      }
    }, 400); // 150 BPM
  },

  stopBgm: () => {
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
  }
};
