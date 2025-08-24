import React, { useEffect, useRef } from 'react';

const DarkVeil: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const noise = (x: number, y: number) => {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return n - Math.floor(n);
    };

    const smoothNoise = (x: number, y: number) => {
      const intX = Math.floor(x);
      const intY = Math.floor(y);
      const fracX = x - intX;
      const fracY = y - intY;

      const a = noise(intX, intY);
      const b = noise(intX + 1, intY);
      const c = noise(intX, intY + 1);
      const d = noise(intX + 1, intY + 1);

      const i1 = a + (b - a) * fracX;
      const i2 = c + (d - c) * fracX;

      return i1 + (i2 - i1) * fracY;
    };

    const fbm = (x: number, y: number) => {
      let value = 0;
      let amplitude = 0.5;
      let frequency = 1;

      for (let i = 0; i < 5; i++) {
        value += amplitude * smoothNoise(x * frequency, y * frequency);
        amplitude *= 0.5;
        frequency *= 2;
      }

      return value;
    };

    const animate = () => {
      time += 0.01;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, 'rgba(15, 5, 25, 0.9)');
      gradient.addColorStop(0.5, 'rgba(8, 2, 15, 0.95)');
      gradient.addColorStop(1, 'rgba(2, 0, 6, 1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create flowing veil effect
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let x = 0; x < canvas.width; x += 2) {
        for (let y = 0; y < canvas.height; y += 2) {
          const normalizedX = (x / canvas.width) * 2 - 1;
          const normalizedY = (y / canvas.height) * 2 - 1;
          
          const flowX = Math.sin(time + normalizedY * 2) * 0.3;
          const flowY = Math.cos(time * 0.7 + normalizedX * 1.5) * 0.3;
          
          const veil1 = fbm(normalizedX * 3 + flowX + time * 0.5, normalizedY * 3 + flowY + time * 0.5);
          const veil2 = fbm(normalizedX * 5 - flowX * 0.5 + time * 0.3, normalizedY * 5 - flowY * 0.5 + time * 0.3);
          
          const finalVeil = veil1 * 0.6 + veil2 * 0.4;
          const dist = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
          const radialGradient = 1 - Math.min(dist / 1.5, 1);
          
          const intensity = Math.max(0, Math.min(1, finalVeil * radialGradient));
          
          const index = (y * canvas.width + x) * 4;
          if (index < data.length) {
            data[index] = Math.floor(15 + intensity * 25);     // R
            data[index + 1] = Math.floor(5 + intensity * 10);  // G
            data[index + 2] = Math.floor(25 + intensity * 40); // B
            data[index + 3] = Math.floor(200 + intensity * 55); // A
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
};

export default DarkVeil;
