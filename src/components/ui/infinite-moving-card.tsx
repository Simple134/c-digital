"use client";

import { cn } from "@/app/lib/utils";
import Image from "next/image";
import React, { useEffect, useState, useCallback, useRef } from "react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    image: string;
    name?: string;
    title?: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);
  const animationCreated = useRef(false);

  const getDirection = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "forwards" : "reverse"
      );
    }
  }, [direction]);

  const getSpeed = useCallback(() => {
    if (containerRef.current) {
      const speeds = {
        fast: "20s",
        normal: "40s",
        slow: "100s"
      };
      containerRef.current.style.setProperty("--animation-duration", speeds[speed]);
    }
  }, [speed]);

  const addAnimation = useCallback(() => {
    if (containerRef.current && scrollerRef.current && !animationCreated.current) {
      // Limpiar contenido duplicado existente
      const originalChildren = Array.from(scrollerRef.current.children).slice(0, items.length);
      scrollerRef.current.innerHTML = '';
      originalChildren.forEach(child => scrollerRef.current?.appendChild(child));

      // Duplicar contenido una sola vez
      originalChildren.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        scrollerRef.current?.appendChild(duplicatedItem);
      });

      getDirection();
      getSpeed();
      setStart(true);
      animationCreated.current = true;
    }
  }, [items.length, getDirection, getSpeed]);

  useEffect(() => {
    addAnimation();

    return () => {
      animationCreated.current = false;
    };
  }, [addAnimation]);

  // Actualizar dirección y velocidad cuando cambien las props
  useEffect(() => {
    getDirection();
    getSpeed();
  }, [direction, speed, getDirection, getSpeed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 overflow-hidden max-w-[95vw] flex items-center justify-center [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap overflow-hidden",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <li
            className="w-[350px] max-w-full relative rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 px-8 py-6 md:w-[450px]"
            style={{
              background: "linear-gradient(180deg, var(--slate-800), var(--slate-900)"
            }}
            key={`${item.name}-${idx}`}
          >
            <blockquote>
              <div
                aria-hidden="true"
                className="user-select-none overflow-hidden -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)] flex items-center justify-center"
              ></div>
              <Image
                src={item.image}
                alt={item?.name || ""}
                width={200}
                height={200}
                className="w-fit h-fit object-cover overflow-hidden"
              />
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};
