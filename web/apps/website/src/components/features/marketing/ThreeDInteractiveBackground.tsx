"use client";

import React, { useEffect, useRef } from "react";

export function ThreeDInteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Grid properties
    const cols = 28;
    const rows = 20;
    const spacingX = 85;
    const spacingY = 85;
    const focalLength = 400; // perspective focal length

    interface Point3D {
      x: number;
      y: number;
      z: number;
      ox: number; // original coordinates
      oy: number;
      oz: number;
    }

    const points: Point3D[] = [];

    // Initialize 3D points
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        // Center the grid around origin (0, 0, 0)
        const x = (c - cols / 2) * spacingX;
        const z = (r - rows / 2) * spacingY;
        const y = 80; // horizontal plane offset downwards

        points.push({
          x,
          y,
          z,
          ox: x,
          oy: y,
          oz: z,
        });
      }
    }

    // Handles window resizing
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.tx = e.clientX;
      mouseRef.current.ty = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Get color from CSS variable
    const getThemeColors = () => {
      const rootStyle = getComputedStyle(document.documentElement);
      const brandVal = rootStyle.getPropertyValue("--color-brand-500").trim();
      const accentVal = rootStyle.getPropertyValue("--color-accent-500").trim();
      
      return {
        brand: brandVal ? `rgb(${brandVal})` : "#8B5CF6",
        accent: accentVal ? `rgb(${accentVal})` : "#06B6D4",
      };
    };

    let time = 0;

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      const mouse = mouseRef.current;
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      const colors = getThemeColors();

      // Slow rotational angles
      const rotY = Math.sin(time * 0.15) * 0.15;
      const rotX = 0.5 + Math.cos(time * 0.1) * 0.05; // tilt downwards

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const centerX = width / 2;
      const centerY = height / 3;

      // Project and draw grid connections
      const projected: { px: number; py: number; depth: number; color: string }[] = [];

      points.forEach((p) => {
        // Add animated ripple wave
        const distFromCenter = Math.sqrt(p.ox * p.ox + p.oz * p.oz);
        const wave = Math.sin(distFromCenter * 0.007 - time * 2.5) * 35;

        // Apply mouse interaction (push grid down or create a dynamic valley)
        const mx = mouse.x - centerX;
        const my = mouse.y - centerY;
        const dx = p.ox - mx;
        const dz = p.oz - my;
        const mouseDist = Math.sqrt(dx * dx + dz * dz);
        const mouseImpact = Math.max(0, 180 - mouseDist) * 0.45;

        const currentY = p.oy + wave + mouseImpact;

        // Rotate Y (yaw)
        let x1 = p.ox * cosY - p.oz * sinY;
        let z1 = p.ox * sinY + p.oz * cosY;

        // Rotate X (pitch)
        let y2 = currentY * cosX - z1 * sinX;
        let z2 = currentY * sinX + z1 * cosX;

        // Push grid forward in Z to be visible
        const finalZ = z2 + 550;

        // Perspective Projection
        if (finalZ > 50) {
          const scale = focalLength / finalZ;
          const px = centerX + x1 * scale;
          const py = centerY + y2 * scale;

          projected.push({
            px,
            py,
            depth: finalZ,
            // Fade particles based on distance from mouse
            color: mouseDist < 160 ? colors.accent : colors.brand,
          });
        } else {
          projected.push({ px: -9999, py: -9999, depth: finalZ, color: colors.brand });
        }
      });

      // Draw Grid Lines (cols and rows)
      ctx.lineWidth = 1.2;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const idx = c * rows + r;
          const p1 = projected[idx];

          if (!p1 || p1.px < -1000) continue;

          // Connect to right neighbor
          if (c < cols - 1) {
            const idxRight = (c + 1) * rows + r;
            const p2 = projected[idxRight];
            if (p2 && p2.px > -1000) {
              const alpha = Math.max(0, 1 - (p1.depth + p2.depth) / 1400); // depth fade
              ctx.strokeStyle = p1.color.replace("rgb", "rgba").replace(")", `, ${alpha * 0.18})`);
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.stroke();
            }
          }

          // Connect to bottom neighbor
          if (r < rows - 1) {
            const idxBottom = c * rows + (r + 1);
            const p3 = projected[idxBottom];
            if (p3 && p3.px > -1000) {
              const alpha = Math.max(0, 1 - (p1.depth + p3.depth) / 1400); // depth fade
              ctx.strokeStyle = p1.color.replace("rgb", "rgba").replace(")", `, ${alpha * 0.18})`);
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p3.px, p3.py);
              ctx.stroke();
            }
          }

          // Draw small grid nodes
          if (p1.depth < 1000) {
            const alpha = Math.max(0, 1 - p1.depth / 1000);
            ctx.fillStyle = p1.color.replace("rgb", "rgba").replace(")", `, ${alpha * 0.35})`);
            ctx.beginPath();
            ctx.arc(p1.px, p1.py, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 -z-20 h-full w-full opacity-45 dark:opacity-20 transition-opacity duration-700"
    />
  );
}
