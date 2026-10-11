import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfettiService {
  constructor() {}

  // ระเบิดพลุกระดาษหลากสี
  burst(type: 'gold' | 'rainbow' | 'danger' = 'rainbow') {
    if (typeof window === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      document.body.removeChild(canvas);
      return;
    }

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    let colors = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
    if (type === 'gold') {
      colors = ['#f59e0b', '#fbbf24', '#fde047', '#d97706', '#ffffff'];
    } else if (type === 'danger') {
      colors = ['#ef4444', '#dc2626', '#b91c1c', '#f87171', '#450a0a'];
    }

    const particleCount = 80;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }> = [];

    const originX = width / 2;
    const originY = height * 0.45;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 5 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    let startTime = performance.now();
    const duration = 2200; // 2.2 วินาที

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.vx *= 0.98; // friction
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - elapsed / duration);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      }
    };

    requestAnimationFrame(animate);
  }
}
