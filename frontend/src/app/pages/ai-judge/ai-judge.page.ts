import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SoundFxService } from '../../services/sound-fx.service';
import { ConfettiService } from '../../services/confetti.service';
import { HapticsService } from '../../services/haptics.service';
import { SocialCardService } from '../../services/social-card.service';
import { LoadingController, ToastController, ModalController } from '@ionic/angular';

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
    private toastCtrl: ToastController
  ) {}

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

      this.photoDataUrl = image.dataUrl || null;

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

    if (!this.authService.isLoggedIn()) {
      this.presentToast('กรุณาเข้าสู่ระบบก่อน เพื่อบันทึกคำตัดสินลงประวัติ');
      return;
    }

    this.haptics.tick();
    const loading = await this.loadingCtrl.create({
      message: '⚖️ ท่านผู้พิพากษา AI กำลังเปิดแฟ้มคดีความ...',
      spinner: 'bubbles'
    });
    await loading.present();

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
      next: (res) => {
        loading.dismiss();
        this.judgmentResult = res;

        // ไฮไลท์เสียงและเอฟเฟกต์ทันทีที่คำพิพากษาปรากฏ
        const isBuy = res.ai_verdict === 'BUY';
        this.soundFx.playStamp(isBuy ? 'BUY' : 'BYE');
        this.haptics.heavyImpact();
        this.confetti.burst(isBuy ? 'gold' : 'danger');
      },
      error: (err) => {
        loading.dismiss();
        console.error('Judge error:', err);
        this.presentToast('เกิดข้อผิดพลาดในการเรียก AI');
      }
    });
  }

  // สร้าง Social Story Card สำหรับแชร์ลง Instagram / TikTok
  async generateCard() {
    if (!this.judgmentResult) return;
    this.isGeneratingCard = true;
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

      this.generatedStoryCardUrl = cardDataUrl;
      this.presentToast('🎉 สร้างบัตรคำพิพากษา Story 9:16 สำเร็จแล้ว!');
    } catch (e) {
      console.error('Generate card error:', e);
      this.presentToast('ไม่สามารถสร้างการ์ดรูปภาพได้');
    } finally {
      this.isGeneratingCard = false;
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
    if (!this.judgmentResult?.id) return;
    this.haptics.tick();
    this.apiService.updateFeedback(this.judgmentResult.id, feedback).subscribe({
      next: () => {
        this.judgmentResult.user_feedback = feedback;
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
