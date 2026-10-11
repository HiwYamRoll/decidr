import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfettiService } from '../../services/confetti.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: false
})
export class HistoryPage implements OnInit {
  dilemmas: any[] = [];
  stats: any = {
    total_dilemmas: 0,
    money_saved: 0,
    proud_count: 0,
    regret_count: 0
  };
  isLoading = true;

  // เป้าหมายการออมเงินในฝัน (Piggy Bank Milestone)
  goalName: string = 'iPad Air สำหรับเรียน';
  goalAmount: number = 21900;

  // ตัวกรองรายการ (All / BUY / BYE)
  filterVerdict: string = 'all';

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    private confetti: ConfettiService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadGoal();
    this.loadData();
  }

  ionViewWillEnter() {
    this.loadGoal();
    this.loadData();
  }

  loadGoal() {
    const savedGoal = localStorage.getItem('decidr_piggy_goal');
    if (savedGoal) {
      try {
        const parsed = JSON.parse(savedGoal);
        this.goalName = parsed.name || this.goalName;
        this.goalAmount = parsed.amount || this.goalAmount;
      } catch (e) {}
    }
  }

  saveGoal() {
    localStorage.setItem('decidr_piggy_goal', JSON.stringify({
      name: this.goalName,
      amount: this.goalAmount
    }));
  }

  // แก้ไขเป้าหมายเงินเก็บ
  async editGoal() {
    const alert = await this.alertCtrl.create({
      header: '🎯 ตั้งเป้าหมายเงินเก็บกวนๆ',
      subHeader: 'เงินที่เซฟได้จากคำสั่ง BYE จะถูกนับเข้าเป้าหมายนี้!',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'เช่น ทริปเที่ยวญี่ปุ่น / ตั๋วคอนเสิร์ต',
          value: this.goalName
        },
        {
          name: 'amount',
          type: 'number',
          placeholder: 'จำนวนเงินเป้าหมาย (บาท)',
          value: this.goalAmount
        }
      ],
      buttons: [
        { text: 'ยกเลิก', role: 'cancel' },
        {
          text: 'บันทึก',
          handler: (data) => {
            if (data.name && data.amount > 0) {
              this.goalName = data.name;
              this.goalAmount = Number(data.amount);
              this.saveGoal();
              this.presentToast('บันทึกเป้าหมายออมเงินแล้ว!');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  get progressRatio(): number {
    if (!this.goalAmount || this.goalAmount <= 0) return 0;
    const ratio = (this.stats.money_saved || 0) / this.goalAmount;
    return Math.min(Math.max(ratio, 0), 1);
  }

  get progressPercent(): number {
    return Math.round(this.progressRatio * 100);
  }

  get kapraoCount(): number {
    return Math.round((this.stats.money_saved || 0) / 60);
  }

  get filteredDilemmas(): any[] {
    if (this.filterVerdict === 'all') return this.dilemmas;
    return this.dilemmas.filter(d => d.ai_verdict === this.filterVerdict);
  }

  loadData() {
    if (!this.authService.isLoggedIn()) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.apiService.getStats().subscribe({
      next: (res) => {
        this.stats = res;
        if (this.progressPercent >= 100) {
          this.confetti.burst('gold');
        }
      },
      error: (err) => console.error('Get stats error:', err)
    });

    this.apiService.getMyDilemmas().subscribe({
      next: (res) => {
        this.dilemmas = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Get dilemmas error:', err);
        this.isLoading = false;
      }
    });
  }

  setFeedback(dilemma: any, feedback: 'proud' | 'regret') {
    this.apiService.updateFeedback(dilemma.id, feedback).subscribe({
      next: () => {
        dilemma.user_feedback = feedback;
        this.loadData();
      }
    });
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
