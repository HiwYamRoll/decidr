import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SoundFxService } from '../../services/sound-fx.service';
import { ConfettiService } from '../../services/confetti.service';
import { HapticsService } from '../../services/haptics.service';
import { SocialCardService } from '../../services/social-card.service';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-ai-judge',
  templateUrl: './ai-judge.page.html',
  styleUrls: ['./ai-judge.page.scss'],
  standalone: false
})
export class AiJudgePage {
  title: string = '';
  price: number | null = null;
  selectedMode: string = 'roast';
  photoDataUrl: string | null = null;
  selectedBlob: Blob | null = null;

  // เกจวัดความหน้ามืดตามัว / กิเลสในใจ (1 - 100%)
  guiltLevel: number = 75;

  isJudging = false;
  judgmentResult: any = null;

  // บัตรคำพิพากษาสำหรับแชร์ลงโซเชียล
  generatedStoryCardUrl: string | null = null;
  isGeneratingCard = false;

  // ตัวอย่างเคสยอดฮิตสำหรับคลิกเดียวเติมฟอร์ม (Quick Dilemmas)
  quickCases = [
    { label: '🧋 ชานมไข่มุก', title: 'ชานมไข่มุกหวาน 100% เพิ่มไข่มุก', price: 65, mode: 'roast', guilt: 65 },
    { label: '👟 รองเท้าผ้าใบ', title: 'รองเท้าผ้าใบคู่นี้ Limited Edition', price: 3900, mode: 'roast', guilt: 90 },
    { label: '🎮 เติมเกมกาชา', title: 'เติมเกมกาชาหาตัวละครใหม่ 10 โรล', price: 1200, mode: 'spoil', guilt: 85 },
    { label: '🍲 บุฟเฟต์ชาบู', title: 'บุฟเฟต์ชาบูมื้อดึกกับเพื่อน', price: 799, mode: 'logic', guilt: 70 },
    { label: '📱 เคสมือถือ', title: 'เคสมือถืออันที่สิบ ลายน่ารักมาก', price: 250, mode: 'fortune', guilt: 50 },
  ];

  modes = [
    { 
      id: 'roast', 
      name: '😈 สายด่าตรง (Roast)', 
      desc: 'ขวานผ่าซาก ดึงสติแรงๆ แต่ฮา',
      avatar: '😈',
      quote: 'เงินในบัญชีมีเท่าไหร่ กล้ามาถามว่าซื้อดีไหม!'
    },
    { 
      id: 'spoil', 
      name: '😇 สายสปอยล์ (Spoil)', 
      desc: 'ให้รางวัลตัวเอง ตัวแม่จะแคร์เพื่อ',
      avatar: '💸',
      quote: 'เกิดมาชาติเดียว ชาติหน้าไม่มีเงินให้ใช้แล้ว จัดไป!'
    },
    { 
      id: 'logic', 
      name: '🧠 สายตรรกะ (Logic)', 
      desc: 'วิเคราะห์ค่าแรงขั้นต่ำ & ROI',
      avatar: '🤖',
      quote: 'คำนวณแล้ว ต้องทำงานกี่ชั่วโมงเพื่อแลกกับชิ้นนี้?'
    },
    { 
      id: 'fortune', 
      name: '🔮 สายหมอดู (Fortune)', 
      desc: 'เปิดไพ่ทายดวงชะตากระเป๋าตังค์',
      avatar: '🧙‍♂️',
      quote: 'ดาวราหูเล็งลัคนา ซื้อวันนี้ระวังได้แทะแกลบ!'
    },
  ];

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    private soundFx: SoundFxService,
    private confetti: ConfettiService,
    private haptics: HapticsService,
    private socialCard: SocialCardService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  // เลือกเคสตัวอย่างรวดเร็ว
  applyQuickCase(c: any) {
    this.haptics.tick();
    this.title = c.title;
    this.price = c.price;
    this.selectedMode = c.mode;
    this.guiltLevel = c.guilt;
    this.cdr.detectChanges();
    this.presentToast(`เลือกตัวอย่าง "${c.label}" แล้ว!`);
  }

  // คำอธิบายระดับกิเลสตาม Slider
  getGuiltText(val: number): string {
    if (val <= 25) return '😌 แค่เดินผ่าน ไม่ซื้อก็ได้ ไม่ตาย';
    if (val <= 50) return '🤔 เริ่มลังเล แต่ถ้าไม่ได้ก็เฉยๆ';
    if (val <= 75) return '🔥 มือเริ่มสั่น ใจเต้นตึกตัก อยากได้ม๊ากกก';
    return '🚨 กิเลสพุ่งปรี๊ด 100%! ยอมอดข้าวเพื่อสิ่งนี้!';
  }

  // คำนวณเทียบเป็นของกิน
  getFoodEquivalent(): string {
    if (!this.price || this.price <= 0) return '';
    const kaprao = Math.round(this.price / 60);
    const boba = Math.round(this.price / 45);
    return `🍛 เท่ากับข้าวกะเพราไข่ดาว ${kaprao} จาน หรือชานมไข่มุก ${boba} แก้ว!`;
  }

  // ถ่ายรูปหรือเลือกรูปจากเครื่องด้วย Capacitor Camera
  async takePhoto() {
    this.haptics.tick();
    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });

      this.ngZone.run(() => {
        this.photoDataUrl = image.dataUrl || null;
        this.cdr.detectChanges();
      });

      if (this.photoDataUrl) {
        const response = await fetch(this.photoDataUrl);
        this.selectedBlob = await response.blob();
      }
    } catch (error) {
      console.warn('User cancelled photo or error:', error);
    }
  }

  removePhoto() {
    this.haptics.tick();
    this.photoDataUrl = null;
    this.selectedBlob = null;
    this.cdr.detectChanges();
  }

  selectMode(modeId: string) {
    this.selectedMode = modeId;
    this.haptics.tick();
    if (modeId === 'roast') this.soundFx.playRoast();
    else if (modeId === 'spoil') this.soundFx.playSpoil();
    else if (modeId === 'logic') this.soundFx.playLogic();
    else if (modeId === 'fortune') this.soundFx.playFortune();
  }

  // ส่งข้อมูลให้ AI ตัดสิน
  async submitToJudge() {
    if (!this.title.trim()) {
      this.presentToast('กรุณาระบุเรื่องที่กำลังลังเลใจก่อนครับ');
      return;
    }

    // 🔒 ป้องกัน Double-click / Spam request เด็ดขาด
    if (this.isJudging) {
      return;
    }
    this.isJudging = true;
    this.cdr.detectChanges();

    this.haptics.tick();
    let loading: HTMLIonLoadingElement | null = null;
    try {
      loading = await this.loadingCtrl.create({
        message: '⚖️ ท่านผู้พิพากษา AI กำลังเปิดแฟ้มคดีความ...',
        spinner: 'bubbles',
        duration: 10000
      });
      await loading.present();
    } catch (e) {
      console.warn('Loading modal error:', e);
    }

    // 🔓 Guest Mode Fallback (ถ้ายังไม่ได้ล็อกอิน ให้ทดลองเล่นได้ทันที!)
    if (!this.authService.isLoggedIn()) {
      setTimeout(async () => {
        const numPrice = this.price || 0;
        const foodCount = Math.round(numPrice / 60);
        const guestPool: any = {
          roast: {
            ai_verdict: 'BYE',
            ai_reason: `(Roast AI) "${this.title.trim()}" ราคาตั้ง ${numPrice.toLocaleString()} บาท! เงินในบัญชียังมีไม่ถึงพันเลยมั้ง ซื้อไปสิ้นเดือนได้แทะแกลบแน่ บ๊ายบายไปซะ อย่าหาทำ!`
          },
          spoil: {
            ai_verdict: 'BUY',
            ai_reason: `(Spoil AI) จัดไปอย่าให้เสีย! เกิดมาชาติเดียว ชาติหน้าก็ไม่มีเงินให้ใช้แล้ว ซื้อความสุขให้ตัวเองโลดดด!`
          },
          logic: {
            ai_verdict: numPrice > 500 ? 'BYE' : 'BUY',
            ai_reason: `(Logic AI) จากการคำนวณความจำเป็นเทียบกับราคา ${numPrice.toLocaleString()} บาท แนะนำให้พักไว้ก่อน 24 ชม. เพื่อลด Impulse Buying`
          },
          fortune: {
            ai_verdict: 'BUY',
            ai_reason: `(Fortune AI) ไพ่ทาโรต์เปิดออกมาได้ The Sun! ชิ้นนี้มีรังสีนำโชค ซื้อแล้วชีวิตจะสดใสเฮงๆ!`
          }
        };

        const chosen = guestPool[this.selectedMode] || guestPool.roast;
        if (loading) {
          try { await loading.dismiss(); } catch (e) {}
        }

        this.ngZone.run(() => {
          this.judgmentResult = {
            id: null,
            title: this.title.trim(),
            price: numPrice,
            mode: this.selectedMode,
            isGuest: true,
            food_equivalent: numPrice > 0 ? `เท่ากับข้าวกะเพราไข่ดาว ${foodCount} จาน 🍛` : null,
            ai_verdict: chosen.ai_verdict,
            ai_reason: chosen.ai_reason
          };
          this.isJudging = false;
          this.cdr.detectChanges();
        });

        const isBuy = this.judgmentResult.ai_verdict === 'BUY';
        this.soundFx.playStamp(isBuy ? 'BUY' : 'BYE');
        this.haptics.heavyImpact();
        this.confetti.burst(isBuy ? 'gold' : 'danger');
        this.presentToast('ℹ️ โหมดทดลองเล่น: คดีนี้ไม่ถูกบันทึกในประวัติ');
      }, 500);
      return;
    }

    // กรณี Logged in -> ส่งบันทึกลง Backend REST API + MySQL
    const formData = new FormData();
    formData.append('title', this.title.trim());
    formData.append('mode', this.selectedMode);
    formData.append('guilt_level', this.guiltLevel.toString());
    if (this.price) {
      formData.append('price', this.price.toString());
    }
    if (this.selectedBlob) {
      formData.append('image', this.selectedBlob, 'snap.jpg');
    }

    this.apiService.judgeDilemma(formData).subscribe({
      next: async (res) => {
        if (loading) {
          try { await loading.dismiss(); } catch (e) {}
        }

        // ปลุก NgZone ทันทีเพื่อให้ Template สลับไปแสดงผลคำตัดสินใน 0ms
        this.ngZone.run(() => {
          this.judgmentResult = res;
          this.isJudging = false;
          this.cdr.detectChanges();
        });

        const isBuy = res.ai_verdict === 'BUY';
        this.soundFx.playStamp(isBuy ? 'BUY' : 'BYE');
        this.haptics.heavyImpact();
        this.confetti.burst(isBuy ? 'gold' : 'danger');
      },
      error: async (err) => {
        if (loading) {
          try { await loading.dismiss(); } catch (e) {}
        }
        this.ngZone.run(() => {
          this.isJudging = false;
          this.cdr.detectChanges();
        });
        console.error('Judge error:', err);
        this.presentToast('เกิดข้อผิดพลาดในการเรียก AI');
      }
    });
  }

  // สร้าง Social Story Card สำหรับแชร์ลง Instagram / TikTok
  async generateCard() {
    if (!this.judgmentResult) return;
    this.isGeneratingCard = true;
    this.cdr.detectChanges();
    this.haptics.tick();

    try {
      const cardDataUrl = await this.socialCard.generateStoryCard({
        title: this.judgmentResult.title,
        price: this.judgmentResult.price,
        verdict: this.judgmentResult.ai_verdict,
        reason: this.judgmentResult.ai_reason,
        mode: this.judgmentResult.mode,
        photoDataUrl: this.photoDataUrl,
        guiltLevel: this.guiltLevel
      });

      this.ngZone.run(() => {
        this.generatedStoryCardUrl = cardDataUrl;
        this.cdr.detectChanges();
      });
      this.presentToast('🎉 สร้างบัตรคำพิพากษา Story 9:16 สำเร็จแล้ว!');
    } catch (e) {
      console.error('Generate card error:', e);
      this.presentToast('ไม่สามารถสร้างการ์ดรูปภาพได้');
    } finally {
      this.ngZone.run(() => {
        this.isGeneratingCard = false;
        this.cdr.detectChanges();
      });
    }
  }

  downloadCard() {
    if (!this.generatedStoryCardUrl) return;
    const a = document.createElement('a');
    a.href = this.generatedStoryCardUrl;
    a.download = `Decidr-Verdict-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.presentToast('📥 กำลังดาวน์โหลดรูปลงเครื่อง...');
  }

  // ส่งฟีดแบ็ก (ภูมิใจ / เสียดาย)
  sendFeedback(feedback: 'proud' | 'regret') {
    if (!this.judgmentResult?.id) {
      this.presentToast('โหมดทดลองเล่น: เข้าสู่ระบบเพื่อบันทึกสถิติ');
      return;
    }
    this.haptics.tick();
    this.apiService.updateFeedback(this.judgmentResult.id, feedback).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.judgmentResult.user_feedback = feedback;
          this.cdr.detectChanges();
        });
        if (feedback === 'proud') {
          this.confetti.burst('gold');
          this.presentToast('บันทึกแล้ว: ดีใจที่เชื่อ AI!');
        } else {
          this.presentToast('บันทึกแล้ว: รู้งี้ไม่น่าเลย...');
        }
      }
    });
  }

  resetForm() {
    this.haptics.tick();
    this.title = '';
    this.price = null;
    this.photoDataUrl = null;
    this.selectedBlob = null;
    this.judgmentResult = null;
    this.generatedStoryCardUrl = null;
    this.guiltLevel = 75;
    this.isJudging = false;
    this.cdr.detectChanges();
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'bottom'
    });
    toast.present();
  }
}
