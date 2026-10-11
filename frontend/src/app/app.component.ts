import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  protected readonly appPages = [
    { title: '🎡 วงล้อสุ่ม (Spin Wheel)', shortTitle: 'วงล้อสุ่ม', url: '/wheel', icon: 'disc' },
    { title: '⚖️ ผู้พิพากษา AI (Buy or Bye)', shortTitle: 'AI ตัดสิน', url: '/ai-judge', icon: 'sparkles' },
    { title: '📜 ประวัติ & กระปุกออมสิน', shortTitle: 'กระปุกออม', url: '/history', icon: 'stats-chart' },
    { title: '👤 เข้าสู่ระบบ / บัญชี', shortTitle: 'โปรไฟล์', url: '/login', icon: 'person' },
  ];

  currentUser: any = null;

  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout();
  }
}
