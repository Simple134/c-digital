import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

interface TypingTextProps {
  text: string;
  duration?: number;
  className?: string;
  delay?: number;
  repeat?: boolean;
  repeatDelay?: number;
  startAt?: number;
}

const Cursor = () => {
  return (
    <motion.span
      style={{
        display: "inline-block",
        width: "2px",
        height: "1em",
        marginLeft: "4px",
        transform: "translateY(4px)",
        background: "linear-gradient(to bottom right, #F2B83D, #F73E50)",
      }}
      animate={{
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        repeatDelay: 0,
        ease: "linear",
        times: [0, 0.5, 0.5, 1],
      }}
    />
  );
};

export default function TypingText({
  text,
  duration = 1,
  className = "",
  delay = 0,
  repeat = false,
  startAt = 0,
  repeatDelay = 1,
}: TypingTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const count = useMotionValue(startAt);
  const rounded = useTransform(count, (latest: number) => Math.round(latest));
  const displayText = useTransform(rounded, (latest: number) =>
    text.slice(0, latest),
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const controls = animate(count, text.length, {
              type: "tween",
              duration,
              ease: "easeInOut",
              delay,
              repeat: repeat ? Infinity : 0,
              repeatDelay,
            });
            observer.disconnect();
            return () => controls.stop();
          }
        });
      },
      {
        threshold: 0.1, // Start when at least 10% of the element is visible
      },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [count, text.length, duration, delay, repeat, repeatDelay]);

  return (
    <span ref={containerRef} className={className}>
      <motion.span>{displayText}</motion.span>
      <Cursor />
    </span>
  );
}
