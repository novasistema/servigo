/**
 * Web Audio API based chime synthesizer for new incoming orders
 * Plays a pleasant 3-tone notification chime for incoming delivery orders
 */
class SoundNotifier {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.audioCtx = new AudioCtx();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch (err) {
      console.warn('AudioContext not available:', err);
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('servigo_delivery_muted', muted ? 'true' : 'false');
    }
  }

  public getIsMuted(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('servigo_delivery_muted') === 'true';
    }
    return this.isMuted;
  }

  /**
   * Plays a high-attention, cheerful 3-tone chime for incoming PENDING orders
   */
  public playNewOrderChime() {
    if (this.getIsMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Frequencies: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.5Hz)
      const notes = [
        { freq: 523.25, start: now + 0.0, duration: 0.16 },
        { freq: 659.25, start: now + 0.14, duration: 0.18 },
        { freq: 783.99, start: now + 0.30, duration: 0.22 },
        { freq: 1046.5, start: now + 0.48, duration: 0.38 },
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, n.start);

        // Smooth envelope
        gain.gain.setValueAtTime(0.001, n.start);
        gain.gain.exponentialRampToValueAtTime(0.3, n.start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, n.start + n.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(n.start);
        osc.stop(n.start + n.duration + 0.05);
      });
    } catch (e) {
      console.warn('Failed to play new order chime:', e);
    }
  }

  public playOrderIncomingChime() {
    this.playNewOrderChime();
  }

  /**
   * Short success beep (when order is accepted or delivered)
   */
  public playSuccessBeep() {
    if (this.getIsMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('Failed to play success beep:', e);
    }
  }
}

export const soundNotifier = new SoundNotifier();
