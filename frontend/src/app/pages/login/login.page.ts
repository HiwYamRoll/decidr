import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  mode: 'login' | 'register' = 'login';
  username = '';
  password = '';
  confirmPassword = '';
  currentUser: any = null;

  constructor(
    public authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  async submit() {
    if (!this.username.trim() || !this.password) {
      this.presentToast('กรุณากรอก Username และ Password');
      return;
    }

    if (this.mode === 'register' && this.password !== this.confirmPassword) {
      this.presentToast('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: this.mode === 'login' ? 'กำลังเข้าสู่ระบบ...' : 'กำลังสมัครสมาชิก...',
      spinner: 'crescent'
    });
    await loading.present();

    if (this.mode === 'login') {
      this.authService.login({ username: this.username.trim(), password: this.password }).subscribe({
        next: (res) => {
          loading.dismiss();
          this.presentToast(`ยินดีต้อนรับ ${res.user.username}!`);
          this.router.navigate(['/wheel']);
        },
        error: (err) => {
          loading.dismiss();
          this.presentToast(err.error?.message || 'เข้าสู่ระบบไม่สำเร็จ');
        }
      });
    } else {
      this.authService.register({ username: this.username.trim(), password: this.password }).subscribe({
        next: (res) => {
          loading.dismiss();
          this.presentToast('สมัครสมาชิกสำเร็จแล้ว!');
          this.router.navigate(['/wheel']);
        },
        error: (err) => {
          loading.dismiss();
          this.presentToast(err.error?.message || 'สมัครสมาชิกไม่สำเร็จ');
        }
      });
    }
  }

  async quickDemoLogin() {
    const loading = await this.loadingCtrl.create({
      message: '⚡ กำลังเข้าสู่ระบบบัญชีตัวอย่าง...',
      spinner: 'crescent'
    });
    await loading.present();

    const demoCreds = { username: 'demo_student', password: 'password123' };
    this.authService.login(demoCreds).subscribe({
      next: (res) => {
        loading.dismiss();
        this.presentToast(`ยินดีต้อนรับ ${res.user.username}!`);
        this.router.navigate(['/history']);
      },
      error: () => {
        this.authService.register(demoCreds).subscribe({
          next: (regRes) => {
            loading.dismiss();
            this.presentToast(`สร้างและเข้าสู่ระบบ ${regRes.user.username} สำเร็จ!`);
            this.router.navigate(['/history']);
          },
          error: () => {
            loading.dismiss();
            this.presentToast('ไม่สามารถเข้าสู่ระบบตัวอย่างได้');
          }
        });
      }
    });
  }

  logout() {
    this.authService.logout();
    this.presentToast('ออกจากระบบเรียบร้อย');
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
