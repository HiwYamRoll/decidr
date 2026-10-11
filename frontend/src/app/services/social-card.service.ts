import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SocialCardService {
  constructor() {}

  // เรนเดอร์การ์ดสตอรี่ขนาด 1080 x 1920 px (9:16 สัดส่วน IG Story / TikTok)
  async generateStoryCard(data: {
    title: string;
    price: number | null;
    verdict: 'BUY' | 'BYE' | string;
    reason: string;
    mode: string;
    photoDataUrl?: string | null;
    guiltLevel?: number;
  }): Promise<string> {
    const canvas = document.createElement('canvas');
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // 1. พื้นหลังไล่เฉดสีสุดพรีเมียม (Cyberpunk / Modern Dark Gradient)
    const isBuy = data.verdict === 'BUY';
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    if (isBuy) {
      bgGrad.addColorStop(0, '#064e3b'); // Dark Emerald
      bgGrad.addColorStop(0.5, '#0f172a'); // Slate 900
      bgGrad.addColorStop(1, '#022c22');
    } else {
      bgGrad.addColorStop(0, '#450a0a'); // Dark Rose
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#180707');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // ลายตารางกริดจางๆ แบบล้ำๆ
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // 2. แบรนด์ดิ้งและเฮดเดอร์ด้านบน
    ctx.fillStyle = '#ffffff';
    ctx.font = "800 52px 'Kanit', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('⚖️ DECIDR — AI JUDGE CERTIFICATE', W / 2, 140);

    ctx.font = "400 32px 'Kanit', sans-serif";
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('ใบคำพิพากษาคดีความการเงิน & การตัดสินใจ', W / 2, 195);

    // 3. กรอบรูปสินค้า / สิ่งที่อยากได้ (ถ้ามีรูป)
    let cardContentTop = 270;
    if (data.photoDataUrl) {
      try {
        const img = await this.loadImage(data.photoDataUrl);
        const imgBoxSize = 580;
        const imgX = (W - imgBoxSize) / 2;
        const imgY = 250;

        // เงากรอบรูป
        ctx.save();
        ctx.shadowColor = isBuy ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#1e293b';
        this.roundRect(ctx, imgX, imgY, imgBoxSize, imgBoxSize, 28);
        ctx.fill();
        ctx.restore();

        // ตัดรูปเป็นมุมโค้ง
        ctx.save();
        this.roundRect(ctx, imgX, imgY, imgBoxSize, imgBoxSize, 28);
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgBoxSize, imgBoxSize);
        ctx.restore();

        // กรอบเส้นขอบ
        ctx.strokeStyle = isBuy ? '#10b981' : '#ef4444';
        ctx.lineWidth = 6;
        this.roundRect(ctx, imgX, imgY, imgBoxSize, imgBoxSize, 28);
        ctx.stroke();

        cardContentTop = 890;
      } catch (e) {
        cardContentTop = 320;
      }
    } else {
      cardContentTop = 320;
    }

    // 4. ชื่อเรื่องและราคา
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = "700 58px 'Kanit', sans-serif";
    this.wrapText(ctx, `"${data.title}"`, W / 2, cardContentTop, 900, 70);

    if (data.price) {
      ctx.font = "600 42px 'Kanit', sans-serif";
      ctx.fillStyle = '#f59e0b';
      const foodCount = Math.round(data.price / 60);
      const foodText = foodCount > 0 ? ` (เท่ากับกะเพราไข่ดาว ${foodCount} จาน!)` : '';
      ctx.fillText(`💸 ราคา: ${data.price.toLocaleString()} บาท${foodText}`, W / 2, cardContentTop + 140);
    }

    // 5. สแตมป์คำตัดสินตัวยักษ์ (BUY หรือ BYE)
    const stampY = cardContentTop + 330;
    ctx.save();
    ctx.translate(W / 2, stampY);
    ctx.rotate(isBuy ? -0.12 : 0.12);

    ctx.strokeStyle = isBuy ? '#10b981' : '#ef4444';
    ctx.lineWidth = 14;
    ctx.fillStyle = isBuy ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)';
    this.roundRect(ctx, -260, -90, 520, 180, 24);
    ctx.fill();
    ctx.stroke();

    ctx.font = "900 110px 'Kanit', sans-serif";
    ctx.fillStyle = isBuy ? '#34d399' : '#f87171';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.verdict, 0, 0);
    ctx.restore();

    // 6. กล่องคำพูด AI ผู้พิพากษา
    const speechY = stampY + 160;
    const speechW = 920;
    const speechH = 340;
    const speechX = (W - speechW) / 2;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    this.roundRect(ctx, speechX, speechY, speechW, speechH, 24);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = isBuy ? '#34d399' : '#f87171';
    ctx.font = "700 36px 'Kanit', sans-serif";
    ctx.fillText(`💬 คำพิพากษา (${data.mode.toUpperCase()} MODE):`, speechX + 40, speechY + 60);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = "400 36px 'Kanit', sans-serif";
    this.wrapText(ctx, data.reason, speechX + 40, speechY + 130, speechW - 80, 52);

    // 7. ฟุตเตอร์ด้านล่างสุด
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = "400 28px 'Kanit', sans-serif";
    ctx.fillText('แอปช่วยตัดสินใจชีวิต & ผู้พิพากษา AI • Decidr 2026', W / 2, H - 70);

    return canvas.toDataURL('image/png');
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split('');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }
}
