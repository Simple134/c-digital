"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";

// Función helper para combinar clases
const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

export const InfiniteReviewCards = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  items: {
    image: string;
    name: string;
    date: string;
    rating: number;
    review: string;
    score?: string;
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
        slow: "80s"
      };
      containerRef.current.style.setProperty("--animation-duration", speeds[speed]);
    }
  }, [speed]);

  const addAnimation = useCallback(() => {
    if (containerRef.current && scrollerRef.current && !animationCreated.current) {
      const originalChildren = Array.from(scrollerRef.current.children).slice(0, items.length);
      scrollerRef.current.innerHTML = '';
      originalChildren.forEach(child => scrollerRef.current?.appendChild(child));
      
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

  useEffect(() => {
    getDirection();
    getSpeed();
  }, [direction, speed, getDirection, getSpeed]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ));
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 overflow-hidden w-full [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-6 py-4 w-max flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <li
            className="w-[220px] max-w-full relative rounded-2xl bg-white shadow-lg flex flex-col items-center p-5 flex-shrink-0 border border-gray-100"
            key={`${item.name}-${idx}`}
          >
            {/* Foto de perfil */}
            <div className="w-20 h-20 rounded-full overflow-hidden mb-3 ring-2 ring-blue-100">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Nombre */}
            <h3 className="text-gray-900 font-semibold text-lg mb-1">
              {item.name}
            </h3>

            {/* Fecha */}
            <p className="text-gray-400 text-sm mb-3">
              {item.date}
            </p>

            {/* Estrellas */}
            <div className="flex gap-0.5 text-xl mb-4">
              {renderStars(item.rating)}
            </div>

            {/* Texto de reseña */}
            <p className="text-gray-700 text-center text-sm leading-relaxed mb-3">
              {item.review}
            </p>

            {/* Score */}
            {item.score && (
              <div className="text-gray-900 font-bold text-lg mb-3">
                {item.score}
              </div>
            )}

            {/* Logo de Google */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </li>
        ))}
      </ul>

      <style jsx>{`
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50%));
          }
        }
        .animate-scroll {
          animation: scroll var(--animation-duration, 80s) var(--animation-direction, forwards) linear infinite;
        }
      `}</style>
    </div>
  );
};

// Ejemplo de uso
export default function ReviewCarouselDemo() {
  const reviews = [
    {
      image: "https://i.pravatar.cc/150?img=1",
      name: "Maren Calzoni",
      date: "14/03/2023",
      rating: 5,
      review: "The place is super clean, everything is new and the beds are super comfortable!",
      score: "10/10"
    },
    {
      image: "https://i.pravatar.cc/150?img=2",
      name: "Sarah Johnson",
      date: "20/04/2023",
      rating: 5,
      review: "Amazing experience! The staff was incredibly friendly and the location is perfect.",
      score: "10/10"
    },
    {
      image: "https://i.pravatar.cc/150?img=3",
      name: "Carlos Méndez",
      date: "05/05/2023",
      rating: 5,
      review: "Exceeded all expectations. Would definitely recommend to anyone visiting the area.",
      score: "9/10"
    },
    {
      image: "https://i.pravatar.cc/150?img=4",
      name: "Emma Wilson",
      date: "12/06/2023",
      rating: 4,
      review: "Great value for money. Clean, comfortable, and conveniently located.",
      score: "9/10"
    },
    {
      image: "https://i.pravatar.cc/150?img=5",
      name: "Michael Chen",
      date: "28/06/2023",
      rating: 5,
      review: "Outstanding service and beautiful facilities. Will definitely come back!",
      score: "10/10"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center py-20">
      <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
        Lo que dicen nuestros clientes
      </h2>
      <p className="text-gray-600 mb-12 text-center max-w-2xl">
        Lee las experiencias reales de personas que han confiado en nosotros
      </p>
      <InfiniteReviewCards items={reviews} speed="slow" />
    </div>
  );
}