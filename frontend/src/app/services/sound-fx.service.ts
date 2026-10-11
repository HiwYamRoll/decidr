import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundFxService {
  private audioCtx: any = null;

  constructor() {
    this.initAudio();
  }

  private initAudio() {
    try {
      if (!this.audioCtx) {
        const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioClass) {
          this.audioCtx = new AudioClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        const unlock = () => {
          this.audioCtx.resume();
          document.removeEventListener('click', unlock);
          document.removeEventListener('touchstart', unlock);
        };
        document.addEventListener('click', unlock);
        document.addEventListener('touchstart', unlock);
      }
    } catch (e) {
      console.warn('AudioContext not supported');
    }
  }

  private ensureAudioActive() {
    if (!this.audioCtx) {
      this.initAudio();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // เสียงหมุนติ๊กสั้นๆ
  playTick() {
    try {
      this.ensureAudioActive();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(850, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.02);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.025);
    } catch (e) {}
  }

  // เสียงวงล้อหยุดและได้ผลลัพธ์
  playWheelWin() {
    try {
      this.ensureAudioActive();
      if (!this.audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const start = this.audioCtx.currentTime + idx * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.linearRampToValueAtTime(0.001, start + 0.16);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(start);
        osc.stop(start + 0.18);
      });
    } catch (e) {}
  }

  // เสียง Roast Mode (ด่าตรง / ฟ้าผ่าตึ่งโป๊ะ กวนๆ)
  playRoast() {
    try {
      this.ensureAudioActive();
      if (!this.audioCtx) return;
      // เสียง Bass ดรอปหนักๆ สไตล์ฟ้าผ่าเตือนสติ
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.5);

      // เสียงตึ่งโป๊ะเบาๆ กวนๆ ตามหลัง
      setTimeout(() => {
        try {
          const osc2 = this.audioCtx.createOscillator();
          const gain2 = this.audioCtx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(400, this.audioCtx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.2);
          gain2.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
          gain2.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.22);
          osc2.connect(gain2);
          gain2.connect(this.audioCtx.destination);
          osc2.start();
          osc2.stop(this.audioCtx.currentTime + 0.25);
        } catch (e) {}
      }, 150);
    } catch (e) {}
  }

  // เสียง Spoil Mode (เชียร์ซื้อ / เหรียญทองกระดิ่งวิ้งๆ Ka-ching!)
  playSpoil() {
    try {
      this.ensureAudioActive();
      if (!this.audioCtx) return;
      const pitches = [987.77, 1318.51, 1567.98, 2093.00];
      pitches.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const start = this.audioCtx.currentTime + idx * 0.06;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.linearRampToValueAtTime(0.001, start + 0.18);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch (e) {}
  }

  // เสียง Logic Mode (เสียงประมวลผล ดิจิทัลไฮเทค)
  playLogic() {
    try {
      this.ensureAudioActive();
      if (!this.audioCtx) return;
      const frequencies = [600, 900, 1200, 800, 1500];
      frequencies.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const start = this.audioCtx.currentTime + idx * 0.05;
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.05, start);
        gain.gain.linearRampToValueAtTime(0.001, start + 0.04);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(start);
        osc.stop(start + 0.045);
      });
    } catch (e) {}
  }

  // เสียง Fortune Mode (แม่หมอ ลูกแก้วมนตรา)
  playFortune() {
    try {
      this.ensureAudioActive();
      if (!this.audioCtx) return;
      const chimeFreqs = [587.33, 880.00, 1174.66];
      chimeFreqs.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const start = this.audioCtx.currentTime + idx * 0.12;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(start);
        osc.stop(start + 0.65);
      });
    } catch (e) {}
  }

  // เสียงตรายางฟันธง BUY หรือ BYE
  playStamp(verdict: 'BUY' | 'BYE') {
    if (verdict === 'BUY') {
      this.playSpoil();
    } else {
      this.playRoast();
    }
  }
}
