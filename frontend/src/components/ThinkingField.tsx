import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface ThinkingFieldProps {
  inputText?: string;
  isAnalyzing?: boolean;
  isInputFocused?: boolean;
  selectedPriorities?: string[];
  hoveredConcept?: string | null;
}

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  depth: number; // 0 (far/faint), 1 (mid), 2 (near/focal)
  radius: number;
  alpha: number;
  keyword?: string;
  isPriority?: boolean;
}

interface Pulse {
  p1Index: number;
  p2Index: number;
  progress: number;
  speed: number;
}

export const ThinkingField: React.FC<ThinkingFieldProps> = ({
  inputText = '',
  isAnalyzing = false,
  isInputFocused = false,
  selectedPriorities = [],
  hoveredConcept = null,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Extract key concepts from text
  const extractKeywords = (text: string): string[] => {
    const stopWords = new Set([
      'should', 'i', 'the', 'a', 'to', 'or', 'in', 'and', 'my', 'for',
      'with', 'at', 'this', 'that', 'how', 'what', 'which', 'be', 'is',
      'it', 'of', 'on', 'an', 'do', 'can', 'we', 'me'
    ]);
    const cleanWords = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    return Array.from(new Set(cleanWords)).slice(0, 6);
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

    // Mouse tracking with smooth lerp
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Focus lerp
    let currentFocus = isInputFocused ? 1 : 0;

    // Generate multi-depth particles
    const particles: Particle[] = [];

    // 1. Far background stardust (subtle, slow drift)
    const dustCount = 42;
    for (let i = 0; i < dustCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        depth: 0,
        radius: Math.random() * 1.1 + 0.5,
        alpha: Math.random() * 0.18 + 0.05,
      });
    }

    // 2. Midground constellation nodes
    const midCount = 28;
    for (let i = 0; i < midCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        depth: 1,
        radius: Math.random() * 1.5 + 1.2,
        alpha: Math.random() * 0.35 + 0.2,
      });
    }

    // 3. Foreground semantic keyword nodes (from input & priorities)
    const keywords = extractKeywords(inputText);
    keywords.forEach((kw, idx) => {
      const angle = (idx / (keywords.length || 1)) * Math.PI * 2;
      const radius = 220 + Math.random() * 60;
      const cx = width / 2 + Math.cos(angle) * radius;
      const cy = height * 0.42 + Math.sin(angle) * radius;

      particles.push({
        x: cx,
        y: cy,
        baseX: cx,
        baseY: cy,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        depth: 2,
        radius: 2.8,
        alpha: 0.85,
        keyword: kw,
      });
    });

    // 4. Selected priority anchors (orbital visual links to core thought)
    selectedPriorities.forEach((p, idx) => {
      const angle = (idx / (selectedPriorities.length || 1)) * Math.PI - Math.PI * 0.5;
      const dist = 320;
      const px = width / 2 + Math.cos(angle) * dist;
      const py = height * 0.42 + Math.sin(angle) * (dist * 0.65);

      particles.push({
        x: px,
        y: py,
        baseX: px,
        baseY: py,
        vx: 0,
        vy: 0,
        depth: 2,
        radius: 3.5,
        alpha: 0.95,
        keyword: p,
        isPriority: true,
      });
    });

    // Active traveling pulses along filaments
    const pulses: Pulse[] = [];
    const maybeAddPulse = () => {
      if (pulses.length > 5) return;
      const p1Idx = Math.floor(Math.random() * particles.length);
      const p1 = particles[p1Idx];
      if (p1.depth < 1) return;

      for (let j = 0; j < particles.length; j++) {
        if (j === p1Idx) continue;
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 160 * 160) {
          pulses.push({
            p1Index: p1Idx,
            p2Index: j,
            progress: 0,
            speed: Math.random() * 0.015 + 0.008,
          });
          break;
        }
      }
    };

    let pulseTimer = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Smooth focus transition
      const targetFocus = isInputFocused ? 1 : 0;
      currentFocus += (targetFocus - currentFocus) * 0.08;

      // Parallax offsets
      const mouseOffsetX = (mouseX - width / 2) * 0.02;
      const mouseOffsetY = (mouseY - height / 2) * 0.02;

      // Center focal coordinate (where user's thought sits)
      const centerThoughtX = width / 2;
      const centerThoughtY = height * 0.42;

      // Atmospheric radial glow behind thought area
      const gradient = ctx.createRadialGradient(
        centerThoughtX,
        centerThoughtY,
        10,
        centerThoughtX,
        centerThoughtY,
        420
      );
      const glowIntensity = isAnalyzing ? 0.14 : 0.04 + currentFocus * 0.04;
      gradient.addColorStop(0, `rgba(0, 240, 255, ${glowIntensity})`);
      gradient.addColorStop(0.5, `rgba(56, 189, 248, ${glowIntensity * 0.4})`);
      gradient.addColorStop(1, 'rgba(3, 4, 7, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerThoughtX, centerThoughtY, 420, 0, Math.PI * 2);
      ctx.fill();

      // Occasionally add traveling energy pulses
      pulseTimer++;
      if (pulseTimer % 45 === 0) {
        maybeAddPulse();
      }

      // Draw filaments between midground & foreground nodes
      const maxConnectDist = 145;
      const maxConnectDistSq = maxConnectDist * maxConnectDist;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.depth === 0) continue; // background dust doesn't draw filaments

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.depth === 0) continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxConnectDistSq) {
            const dist = Math.sqrt(distSq);
            const baseAlpha = (1 - dist / maxConnectDist) * 0.12;
            const extraAlpha = (p1.keyword || p2.keyword ? 0.14 : 0) + currentFocus * 0.06;
            const totalAlpha = Math.min(baseAlpha + extraAlpha, 0.45);

            ctx.strokeStyle = p1.isPriority || p2.isPriority
              ? (isLight ? `rgba(2, 132, 199, ${totalAlpha * 1.5})` : `rgba(0, 240, 255, ${totalAlpha * 1.5})`)
              : (isLight ? `rgba(15, 23, 42, ${totalAlpha * 0.4})` : `rgba(255, 255, 255, ${totalAlpha})`);

            ctx.lineWidth = p1.isPriority || p2.isPriority ? 0.9 : 0.55;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Connect selected priority nodes directly to the core thought
        if (p1.isPriority) {
          const cdx = p1.x - centerThoughtX;
          const cdy = p1.y - centerThoughtY;
          const cDist = Math.sqrt(cdx * cdx + cdy * cdy);

          ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.28)' : 'rgba(0, 240, 255, 0.22)';
          ctx.setLineDash([4, 6]);
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(centerThoughtX, centerThoughtY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Render traveling energy pulses along connections
      for (let k = pulses.length - 1; k >= 0; k--) {
        const pulse = pulses[k];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(k, 1);
          continue;
        }

        const p1 = particles[pulse.p1Index];
        const p2 = particles[pulse.p2Index];
        if (!p1 || !p2) {
          pulses.splice(k, 1);
          continue;
        }

        const curX = p1.x + (p2.x - p1.x) * pulse.progress;
        const curY = p1.y + (p2.y - p1.y) * pulse.progress;

        ctx.fillStyle = isLight ? 'rgba(2, 132, 199, 0.85)' : 'rgba(0, 240, 255, 0.85)';
        ctx.shadowColor = isLight ? '#0284C7' : '#00F0FF';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(curX, curY, 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Update & Render all nodes
      particles.forEach(p => {
        // Subtle drift with boundaries
        p.x += p.vx * (isAnalyzing ? 1.6 : 1);
        p.y += p.vy * (isAnalyzing ? 1.6 : 1);

        // Soft bounce within viewport
        if (p.x < 10) { p.x = 10; p.vx *= -1; }
        if (p.x > width - 10) { p.x = width - 10; p.vx *= -1; }
        if (p.y < 10) { p.y = 10; p.vy *= -1; }
        if (p.y > height - 10) { p.y = height - 10; p.vy *= -1; }

        // Parallax offset applied dynamically
        const renderX = p.x + mouseOffsetX * (p.depth + 0.3);
        const renderY = p.y + mouseOffsetY * (p.depth + 0.3);

        // Check if hovered
        const isHovered = hoveredConcept && p.keyword && p.keyword.toLowerCase().includes(hoveredConcept.toLowerCase());

        // Node circle
        if (p.depth === 0) {
          // Far dust particle
          ctx.fillStyle = isLight ? `rgba(51, 65, 85, ${p.alpha * 0.6})` : `rgba(255, 255, 255, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(renderX, renderY, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.depth === 1) {
          // Midground constellation node
          const effectiveAlpha = p.alpha + currentFocus * 0.15;
          ctx.fillStyle = isLight ? `rgba(30, 41, 59, ${effectiveAlpha * 0.75})` : `rgba(255, 255, 255, ${effectiveAlpha})`;
          ctx.beginPath();
          ctx.arc(renderX, renderY, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Foreground semantic node
          const isSelectedOrHovered = p.isPriority || isHovered;
          ctx.fillStyle = isSelectedOrHovered
            ? (isLight ? '#0284C7' : '#00F0FF')
            : (isLight ? '#2563EB' : '#38BDF8');

          if (isSelectedOrHovered) {
            ctx.shadowColor = isLight ? '#0284C7' : '#00F0FF';
            ctx.shadowBlur = 10;
          }

          ctx.beginPath();
          ctx.arc(renderX, renderY, p.radius * (isSelectedOrHovered ? 1.3 : 1), 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Outer delicate halo ring
          ctx.strokeStyle = isSelectedOrHovered
            ? (isLight ? 'rgba(2, 132, 199, 0.5)' : 'rgba(0, 240, 255, 0.45)')
            : (isLight ? 'rgba(37, 99, 235, 0.25)' : 'rgba(56, 189, 248, 0.2)');
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.arc(renderX, renderY, p.radius + 3.5, 0, Math.PI * 2);
          ctx.stroke();
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
  }, [inputText, isAnalyzing, isInputFocused, selectedPriorities, hoveredConcept, isLight]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Modern Ambient Aurora Glows (Adapts to Light & Dark) */}
      <div className={`absolute -top-[15%] left-[10%] w-[600px] h-[600px] rounded-full blur-[140px] animate-aurora-1 ${
        isLight
          ? 'bg-gradient-to-br from-indigo-200/40 via-purple-100/30 to-transparent'
          : 'bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-transparent'
      }`} />
      <div className={`absolute top-[40%] -right-[10%] w-[650px] h-[650px] rounded-full blur-[150px] animate-aurora-2 ${
        isLight
          ? 'bg-gradient-to-bl from-cyan-200/35 via-blue-100/30 to-transparent'
          : 'bg-gradient-to-bl from-cyan-500/12 via-blue-600/10 to-transparent'
      }`} />
      <div className={`absolute -bottom-[20%] left-[30%] w-[700px] h-[500px] rounded-full blur-[160px] animate-aurora-1 ${
        isLight
          ? 'bg-gradient-to-tr from-violet-200/30 via-emerald-100/25 to-transparent'
          : 'bg-gradient-to-tr from-violet-600/10 via-emerald-500/8 to-transparent'
      }`} />
      
      {/* Subtle Dot-Matrix Vignette Grid */}
      <div className="absolute inset-0 grid-mesh-ambient pointer-events-none opacity-60" />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-90" />
      <div className={`absolute inset-0 bg-noise pointer-events-none mix-blend-overlay ${
        isLight ? 'opacity-15' : 'opacity-30'
      }`} />
    </div>
  );
};
