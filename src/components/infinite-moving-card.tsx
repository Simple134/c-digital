"use client";

import React, { useEffect, useState, useRef } from "react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
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
  const [hasDuplicated, setHasDuplicated] = useState(false);

  useEffect(() => {
    if (
      document.documentElement &&
      !document.documentElement.classList.contains("tailwind-config-set")
    ) {
      const speeds = {
        fast: "25s",
        normal: "40s",
        slow: "60s",
      };

      const style = document.createElement("style");
      style.textContent = `
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(${direction === "left" ? "-" : ""}100%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll ${speeds[speed]} linear infinite ${direction === "right" ? "reverse" : "normal"};
        }
        .hover\:pause:hover {
          animation-play-state: paused;
        }
      `;
      document.head.appendChild(style);
      document.documentElement.classList.add("tailwind-config-set");
    }
  }, [speed, direction]);

  useEffect(() => {
    if (scrollerRef.current && !hasDuplicated) {
      const duplicatedContent = Array.from(scrollerRef.current.children).map(
        (child) => child.cloneNode(true),
      );

      const newUl = scrollerRef.current.cloneNode(false) as HTMLUListElement;
      duplicatedContent.forEach((item) => {
        newUl.appendChild(item);
      });

      newUl.setAttribute("aria-hidden", "true");

      newUl.classList.add("animate-infinite-scroll");
      if (pauseOnHover) {
        newUl.classList.add("hover:pause");
      }

      containerRef.current?.appendChild(newUl);
      setHasDuplicated(true);
    }
  }, [hasDuplicated, pauseOnHover]);

  return (
    <div
      ref={containerRef}
      className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
    >
      <ul
        ref={scrollerRef}
        className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll"
      >
        {items.map((item, idx) => (
          <li
            className="relative rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 px-8 py-6"
            key={`${item.name}-${idx}`}
          >
            <img
              src={item.image}
              alt={item?.name || ""}
              className="object-contain overflow-hidden w-32 h-32 md:w-48 md:h-48"
              style={{
                aspectRatio: "4/3",
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
