class OmegaAudioController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.4;
  private humOscillator: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private isHumming: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.humGain) {
      this.humGain.gain.setValueAtTime(0, this.ctx ? this.ctx.currentTime : 0);
    } else if (!muted && this.humGain && this.isHumming && this.ctx) {
      this.humGain.gain.setValueAtTime(this.volume * 0.05, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.humGain && !this.isMuted && this.ctx) {
      this.humGain.gain.setValueAtTime(this.volume * 0.05, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Subtle futuristic terminal click
   */
  public playClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(this.volume * 0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Success / Access Granted chime
   */
  public playSuccess() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(this.volume * 0.25, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch {
      // Ignore audio policy errors
    }
  }

  /**
   * Warning / Denied buzz
   */
  public playError() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(95, now + 0.25);

      gain.gain.setValueAtTime(this.volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignore
    }
  }

  /**
   * Countdown pulse / radar blip
   */
  public playCountdownBeep(highPitch: boolean = false) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(highPitch ? 1760 : 880, now);

      gain.gain.setValueAtTime(this.volume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Ignore
    }
  }

  /**
   * Low futuristic background reactor hum
   */
  public startAmbientHum() {
    if (this.isHumming) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      this.humOscillator = this.ctx.createOscillator();
      this.humGain = this.ctx.createGain();

      this.humOscillator.type = 'sine';
      this.humOscillator.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A1 hum

      this.humGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.04, this.ctx.currentTime);

      this.humOscillator.connect(this.humGain);
      this.humGain.connect(this.ctx.destination);

      this.humOscillator.start();
      this.isHumming = true;
    } catch {
      // Browser user-gesture restrictions
    }
  }

  public stopAmbientHum() {
    if (this.humOscillator) {
      try {
        this.humOscillator.stop();
        this.humOscillator.disconnect();
      } catch {
        // Ignore
      }
      this.humOscillator = null;
      this.humGain = null;
      this.isHumming = false;
    }
  }
}

export const omegaAudio = new OmegaAudioController();
