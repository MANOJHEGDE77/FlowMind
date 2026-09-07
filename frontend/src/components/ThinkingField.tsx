import React, { useEffect, useRef } from 'react';

interface ThinkingFieldProps {
  inputText?: string;
  isAnalyzing?: boolean;
}

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  alpha: number;
  keyword?: string;
}

export const ThinkingField: React.FC<ThinkingFieldProps> = ({ inputText = '', isAnalyzing = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Extract dynamic keywords from input
  const extractKeywords = (text: string): string[] => {
    const commonWords = new Set(['should', 'i', 'the', 'a', 'to', 'or', 'in', 'and', 'my', 'for', 'with', 'at', 'this', 'that']);
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !commonWords.has(w));
    
    // Default semantic constellation points if input is empty
    if (words.length === 0) {
      return ['ambition', 'leverage', 'velocity', 'trade-offs', 'optionality'];
    }
    return Array.from(new Set(words)).slice(0, 7);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const keywords = extractKeywords(inputText);

    // Generate spatial points
    const pointCount = 38;
    const points: Point[] = Array.from({ length: pointCount }, (_, i) => {
      const kw = i < keywords.length ? keywords[i] : undefined;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isAnalyzing ? 1.2 : 0.4),
        vy: (Math.random() - 0.5) * (isAnalyzing ? 1.2 : 0.4),
        baseRadius: kw ? 3.5 : Math.random() * 1.5 + 1,
        alpha: kw ? 0.8 : Math.random() * 0.3 + 0.1,
        keyword: kw,
      };
    });

    let mouseX = width / 2;
    let mouseY = height / 2;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Connect nearby points with delicate lines
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = points[i].keyword || points[j].keyword ? 160 : 90;
          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.15;
            ctx.strokeStyle = points[i].keyword ? `rgba(56, 189, 248, ${opacity * 2})` : `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = points[i].keyword ? 1 : 0.6;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw points & floating keywords
      points.forEach(p => {
        // Subtle attraction to mouse
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        if (distToMouse < 200) {
          p.x += (dx / distToMouse) * 0.2;
          p.y += (dy / distToMouse) * 0.2;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Bounce from edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw dot
        ctx.fillStyle = p.keyword ? '#38BDF8' : `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.baseRadius, 0, Math.PI * 2);
        ctx.fill();

        // If it's an extracted semantic keyword, draw subtle label
        if (p.keyword) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillText(p.keyword.toUpperCase(), p.x + 8, p.y + 3);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [inputText, isAnalyzing]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
};
