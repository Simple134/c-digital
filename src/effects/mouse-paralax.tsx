import { motion } from "framer-motion";
import { useMotionValue } from "framer-motion";
import { useEffect } from "react";

export const MouseParallaxSection = ({
  children,
  className = "",
  depth = 20,
  centerX = 0.5,
  centerY = 0.5,
}: {
  children: React.ReactNode;
  className?: string;
  depth?: number;
  centerX?: number;
  centerY?: number;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { innerWidth, innerHeight } = window;

      const moveX = (clientX / innerWidth - centerX) * 2;
      const moveY = (clientY / innerHeight - centerY) * 2;

      x.set(moveX * depth);
      y.set(moveY * depth);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y, depth, centerX, centerY]);

  return (
    <motion.div
      style={{ x, y }}
      className={className}
      transition={{ duration: 1.5 }}
    >
      {children}
    </motion.div>
  );
};
