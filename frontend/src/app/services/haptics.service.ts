import { Injectable } from '@angular/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

@Injectable({
  providedIn: 'root'
})
export class HapticsService {
  constructor() {}

  // สั่นเบาๆ ตอนเข็มหมุนสะกิด (Tick)
  async tick() {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {}
  }

  // สั่นหนักตอนได้ผลลัพธ์หรือสแตมป์คำตัดสิน
  async heavyImpact() {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {}
  }

  // สั่นยินดีเมื่อชนะ/ได้ของ (Success)
  async successNotification() {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {}
  }

  // สั่นเตือนสติโดนด่า (Warning)
  async warningNotification() {
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (e) {}
  }
}
