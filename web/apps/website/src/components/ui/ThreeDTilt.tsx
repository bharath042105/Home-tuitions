"use client";

import React, { useRef, useState } from "react";

interface ThreeDTiltProps {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number; // Maximum rotation angle in degrees
  scale?: number;       // Hover scale factor
}

export function ThreeDTilt({
  children,
  className = "",
  maxRotation = 10,
  scale = 1.02,
}: ThreeDTiltProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to the element center (range -0.5 to 0.5)
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;

    // Calculate rotation angles.
    const rotateX = -y * maxRotation;
    const rotateY = x * maxRotation;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: "transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)", // faster transition while moving
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)", // smooth snapback
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`preserve-3d ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
