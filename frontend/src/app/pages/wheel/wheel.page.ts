import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { SoundFxService } from '../../services/sound-fx.service';
import { ConfettiService } from '../../services/confetti.service';
import { HapticsService } from '../../services/haptics.service';
import { AlertController, ToastController } from '@ionic/angular';

interface WheelOption {
  label: string;
  color: string;
}

@Component({
  selector: 'app-wheel',
  templateUrl: './wheel.page.html',
  styleUrls: ['./wheel.page.scss'],
  standalone: false
})
export class WheelPage implements OnInit, AfterViewInit {
  @ViewChild('wheelCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // หัวข้อการตัดสินใจ
  wheelTitle: string = 'มื้อนี้กินอะไรดี?';

  // รายการตัวเลือกเริ่มต้น
  defaultOptions: WheelOption[] = [
    { label: 'ข้าวกะเพราหมูกรอบ', color: '#ef4444' },
    { label: 'ก๋วยเตี๋ยวต้มยำ', color: '#f97316' },
    { label: 'ข้าวมันไก่ทอด', color: '#10b981' },
    { label: 'ส้มตำไก่ย่าง', color: '#06b6d4' },
    { label: 'ชาบูบุฟเฟต์', color: '#6366f1' },
    { label: 'มาม่าปลากระป๋อง', color: '#ec4899' },
  ];

  // หัวข้อสำเร็จรูปสนุกๆ กวนๆ
  funPresets = [
    {
      title: 'มื้อนี้กินอะไรดี?',
      options: ['ข้าวกะเพราหมูกรอบ', 'ก๋วยเตี๋ยวต้มยำ', 'ข้าวมันไก่ทอด', 'ส้มตำไก่ย่าง', 'ชาบูบุฟเฟต์', 'มาม่าปลากระป๋อง']
    },
    {
      title: 'ชานมไข่มุกแก้วนี้ ซื้อดีไหม?',
      options: ['ซื้อเลย! เหนื่อยมาทั้งวัน', 'ดื่มน้ำเปล่าเถอะ พุงจะออกแล้ว', 'สั่งหวาน 25% ประนีประนอม', 'ห้ามใจไว้ เอาเงินไปหยอดกระปุก']
    },
    {
      title: 'เลิกงาน/เลิกเรียนแล้ว ไปไหนดี?',
      options: ['กลับห้องนอนงีบ', 'เดินห้างตากแอร์', 'ตีป้อม ROV สักตา', 'ออกกำลังกายฟิตเนส', 'แวะร้านบุฟเฟต์หมูกระทะ']
    },
    {
      title: 'วันหยุดนี้ทำอะไรดี?',
      options: ['นอนกลิ้งดูซีรีส์', 'ลุยอ่านสไลด์ Web App ล่วงหน้า', 'ไปคาเฟ่ถ่ายรูปลง IG', 'ทำความสะอาดห้องชุดใหญ่']
    }
  ];

  options: WheelOption[] = [];
  newOptionText: string = '';

  // สถานะการหมุน
  isSpinning = false;
  currentAngle = 0;
  spinResult: string | null = null;

  // พาเลทสีสดใส
  colorPalette = [
    '#ef4444', '#f97316', '#f59e0b', '#10b981', 
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'
  ];

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private soundFx: SoundFxService,
    private confetti: ConfettiService,
    private haptics: HapticsService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadSavedState();
  }

  ngAfterViewInit() {
    if ((document as any).fonts) {
      (document as any).fonts.ready.then(() => {
        this.initCanvasAndDraw();
      });
    } else {
      setTimeout(() => this.initCanvasAndDraw(), 150);
    }
  }

  loadSavedState() {
    const saved = localStorage.getItem('decidr_single_wheel');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.wheelTitle = parsed.title || 'มื้อนี้กินอะไรดี?';
        this.options = parsed.options && parsed.options.length >= 2 ? parsed.options : [...this.defaultOptions];
        return;
      } catch (e) {}
    }
    this.options = [...this.defaultOptions];
  }

  saveState() {
    localStorage.setItem('decidr_single_wheel', JSON.stringify({
      title: this.wheelTitle,
      options: this.options
    }));
  }

  applyPreset(preset: { title: string; options: string[] }) {
    this.haptics.tick();
    this.wheelTitle = preset.title;
    this.options = preset.options.map((opt, i) => ({
      label: opt,
      color: this.colorPalette[i % this.colorPalette.length]
    }));
    this.spinResult = null;
    this.saveState();
    this.drawWheel();
    this.presentToast(`เปลี่ยนเป็นหัวข้อ "${preset.title}" แล้ว`);
  }

  resetToDefault() {
    this.haptics.tick();
    this.wheelTitle = 'มื้อนี้กินอะไรดี?';
    this.options = [...this.defaultOptions];
    this.spinResult = null;
    this.saveState();
    this.drawWheel();
    this.presentToast('รีเซ็ตเป็นตัวเลือกตั้งต้นแล้ว');
  }

  initCanvasAndDraw() {
    this.drawWheel();
  }

  // วาดวงล้อความละเอียดสูง (HiDPI / Retina) พร้อมฟอนต์ Kanit
  drawWheel() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const displaySize = 340;
    const dpr = window.devicePixelRatio || 1;

    if (canvas.width !== displaySize * dpr) {
      canvas.width = displaySize * dpr;
      canvas.height = displaySize * dpr;
      canvas.style.width = `${displaySize}px`;
      canvas.style.height = `${displaySize}px`;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const centerX = displaySize / 2;
    const centerY = displaySize / 2;
    const radius = centerX - 12;

    ctx.clearRect(0, 0, displaySize, displaySize);

    if (this.options.length === 0) {
      ctx.restore();
      return;
    }

    const numSlices = this.options.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    // 1. วาดแต่ละชิ้นพาย
    for (let i = 0; i < numSlices; i++) {
      const angle = this.currentAngle + i * sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      ctx.closePath();

      ctx.fillStyle = this.options[i].color || this.colorPalette[i % this.colorPalette.length];
      ctx.fill();

      // ขอบแบ่งชิ้นสีขาว
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 2. วาดข้อความตัวเลือก (ไม่ตัดคำ และอ่านจากซ้ายไปขวาเสมอ)
      ctx.save();
      ctx.translate(centerX, centerY);

      const midAngle = angle + sliceAngle / 2;
      const normRot = ((midAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const isLeftHemisphere = normRot > Math.PI / 2 && normRot < (3 * Math.PI) / 2;

      const outerEdgeMargin = 10;
      let drawX = 0;
      if (isLeftHemisphere) {
        ctx.rotate(midAngle + Math.PI);
        ctx.textAlign = 'left';
        drawX = -(radius - outerEdgeMargin);
      } else {
        ctx.rotate(midAngle);
        ctx.textAlign = 'right';
        drawX = radius - outerEdgeMargin;
      }

      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';

      const label = this.options[i].label;

      const centerSafeRadius = 26;
      const maxAvailableWidth = (radius - outerEdgeMargin) - centerSafeRadius;

      let fontSize = numSlices > 8 ? 13 : (numSlices > 6 ? 14 : 15);
      ctx.font = `600 ${fontSize}px 'Kanit', sans-serif`;

      while (ctx.measureText(label).width > maxAvailableWidth && fontSize > 8) {
        fontSize -= 0.5;
        ctx.font = `600 ${fontSize}px 'Kanit', sans-serif`;
      }

      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillText(label, drawX, 0);
      ctx.restore();
    }

    // 3. ขอบวงล้อด้านนอก (Outer Rim)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 5;
    ctx.stroke();

    // 4. แกนหมุนตรงกลาง (Center Hub 18px ไม่บังตัวอักษร)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 7, 0, 2 * Math.PI);
    ctx.fillStyle = '#6366f1';
    ctx.fill();

    ctx.restore();
  }

  // เริ่มหมุนวงล้อแบบสปีดติดเทอร์โบ 0.8 วินาที
  spin() {
    if (this.isSpinning || this.options.length < 2) return;

    this.isSpinning = true;
    this.spinResult = null;
    this.haptics.tick();

    const extraRounds = 3 + Math.random() * 1.5;
    const randomStopAngle = Math.random() * 2 * Math.PI;
    const targetAngle = this.currentAngle + extraRounds * 2 * Math.PI + randomStopAngle;

    const duration = 800;
    const startTime = performance.now();
    const initialAngle = this.currentAngle;
    let lastTickAngle = initialAngle;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = progress * (2 - progress);
      this.currentAngle = initialAngle + (targetAngle - initialAngle) * easeOut;

      if (Math.abs(this.currentAngle - lastTickAngle) > 0.45) {
        this.soundFx.playTick();
        this.haptics.tick();
        lastTickAngle = this.currentAngle;
      }

      this.drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.ngZone.run(() => {
          this.currentAngle = targetAngle;
          this.drawWheel();
          this.isSpinning = false;
          this.cdr.detectChanges();
          this.determineWinner();
        });
      }
    };

    requestAnimationFrame(animate);

    setTimeout(() => {
      this.ngZone.run(() => {
        if (this.isSpinning) {
          this.isSpinning = false;
          this.cdr.detectChanges();
        }
      });
    }, duration + 300);
  }

  // คำนวณผู้ชนะให้ตรงกับเข็มชี้ด้านบนสุด 100%
  determineWinner() {
    const numSlices = this.options.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    let needleAngle = (3 * Math.PI) / 2 - (this.currentAngle % (2 * Math.PI));
    needleAngle = ((needleAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    const winnerIndex = Math.floor(needleAngle / sliceAngle) % numSlices;
    this.spinResult = this.options[winnerIndex].label;

    // เอฟเฟกต์เสียง + สั่น + พลุกระดาษระเบิด
    this.soundFx.playWheelWin();
    this.haptics.successNotification();
    this.confetti.burst('rainbow');

    // บันทึกประวัติการสุ่มลงฐานข้อมูล MySQL หากล็อกอินอยู่
    if (this.authService.isLoggedIn() && this.spinResult) {
      this.apiService.recordSpin(1, this.spinResult).subscribe({
        next: () => console.log('Spin history recorded to MySQL'),
        error: (err) => console.warn('Record spin error (offline/guest):', err)
      });
    }

    // เด้ง Popup แจ้งกลางหน้าจอทันที
    this.showWinnerAlert(this.spinResult);
  }

  // ป๊อปอัปแจ้งผลลัพธ์กลางจอทันทีที่หยุด
  async showWinnerAlert(winner: string) {
    const alert = await this.alertCtrl.create({
      header: '🎉 ได้อันนี้!',
      subHeader: this.wheelTitle,
      message: `👉  ${winner}  👈`,
      buttons: [{
        text: 'ตกลง',
        role: 'cancel',
        handler: () => {
          this.ngZone.run(() => {
            this.isSpinning = false;
            this.cdr.detectChanges();
          });
        }
      }]
    });

    alert.onDidDismiss().then(() => {
      this.ngZone.run(() => {
        this.isSpinning = false;
        this.cdr.detectChanges();
      });
    });

    await alert.present();
    this.cdr.detectChanges();
  }

  addOption() {
    const text = this.newOptionText.trim();
    if (!text) return;
    this.haptics.tick();

    const nextColor = this.colorPalette[this.options.length % this.colorPalette.length];
    this.options.push({ label: text, color: nextColor });
    this.newOptionText = '';
    this.saveState();
    this.drawWheel();
  }

  removeOption(index: number) {
    if (this.options.length <= 2) {
      this.presentToast('วงล้อต้องมีอย่างน้อย 2 ตัวเลือกครับ');
      return;
    }
    this.haptics.tick();
    this.options.splice(index, 1);
    this.saveState();
    this.drawWheel();
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}
