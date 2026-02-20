import { useEffect, useState } from "react";

export const CursorGradient = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      style={{
        background: `radial-gradient(circle at ${position.x}px ${position.y}px, #00C5FF 0px,  #00FF7C 10px, transparent 10%)`,
      }}
    />
  );
};
