"use client";
import { Container } from "@bitnation-dev/components";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// Team member interface
interface TeamMember {
  name: string;
  role: string;
  title: string;
  bio: string;
  initials: string;
  socials: { platform: string; url: string }[];
}

export default function EquipoPage() {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);

  // Team members data
  const teamMembers: TeamMember[] = [
    {
      name: "Carlos Digital",
      role: "Founder & CEO",
      title: "CEO & Founder",
      bio: "Visionario digital con más de 10 años de experiencia. Lidera la estrategia y dirección de C Digital con pasión por la innovación.",
      initials: "CD",
      socials: [
        { platform: "linkedin", url: "#" },
        { platform: "twitter", url: "#" },
        { platform: "instagram", url: "#" },
      ],
    },
    {
      name: "María Rodríguez",
      role: "Creative Director",
      title: "Creative Director",
      bio: "Diseñadora gráfica especializada en branding y diseño de experiencias. Convierte conceptos en identidades visuales impactantes.",
      initials: "MR",
      socials: [
        { platform: "linkedin", url: "#" },
        { platform: "youtube", url: "#" },
        { platform: "instagram", url: "#" },
      ],
    },
    {
      name: "Josue Sanchez",
      role: "Lead Developer",
      title: "Lead Developer",
      bio: "Desarrollador full-stack con experiencia en React, Node.js y tecnologías cloud. Construye aplicaciones escalables y robustas.",
      initials: "JS",
      socials: [
        { platform: "github", url: "#" },
        { platform: "linkedin", url: "#" },
        { platform: "twitter", url: "#" },
      ],
    },
    {
      name: "Ana López",
      role: "UX Designer",
      title: "UX/UI Designer",
      bio: "Experta en diseño centrado en el usuario. Crea interfaces intuitivas que conectan emocionalmente con las personas.",
      initials: "AL",
      socials: [
        { platform: "instagram", url: "#" },
        { platform: "linkedin", url: "#" },
        { platform: "behance", url: "#" },
      ],
    },
    {
      name: "Pedro Martínez",
      role: "Marketing Lead",
      title: "Marketing Strategist",
      bio: "Especialista en marketing digital y growth hacking. Desarrolla estrategias que generan resultados medibles y escalables.",
      initials: "PM",
      socials: [
        { platform: "linkedin", url: "#" },
        { platform: "twitter", url: "#" },
        { platform: "instagram", url: "#" },
      ],
    },
    {
      name: "Laura García",
      role: "Content Creator",
      title: "Content Strategist",
      bio: "Creadora de contenido y copywriter. Transforma ideas complejas en narrativas convincentes que conectan con audiencias.",
      initials: "LG",
      socials: [
        { platform: "linkedin", url: "#" },
        { platform: "twitter", url: "#" },
        { platform: "medium", url: "#" },
      ],
    },
  ];

  // Stats data
  const stats = [
    { number: 150, label: "Proyectos Completados" },
    { number: 50, label: "Clientes Felices" },
    { number: 12, label: "Miembros del Equipo" },
    { number: 5, label: "Años de Experiencia" },
  ];

  // Values data
  const values = [
    {
      title: "Innovación",
      description:
        "Constantemente exploramos nuevas tecnologías y metodologías para ofrecer soluciones vanguardistas.",
      icon: "innovation",
    },
    {
      title: "Excelencia",
      description:
        "Nos comprometemos con la calidad en cada detalle, desde el código hasta la experiencia del usuario.",
      icon: "excellence",
    },
    {
      title: "Colaboración",
      description:
        "Trabajamos en equipo con nuestros clientes, convirtiéndolos en socios de cada proyecto.",
      icon: "collaboration",
    },
    {
      title: "Agilidad",
      description:
        "Nos adaptamos rápidamente a los cambios y entregamos valor de forma continua e iterativa.",
      icon: "agility",
    },
  ];

  // Auto-scroll functionality
  useEffect(() => {
    const startAutoScroll = () => {
      if (!scrollRef.current || !isAutoScrolling) return;

      autoScrollInterval.current = setInterval(() => {
        if (!scrollRef.current) return;

        const maxScroll =
          scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
        const currentScroll = scrollRef.current.scrollLeft;

        if (currentScroll >= maxScroll - 1) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          const cardWidth = 360 + 32; // card width + gap
          scrollRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
        }
      }, 3000);
    };

    startAutoScroll();

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [isAutoScrolling]);

  const handleScrollLeft = () => {
    if (!scrollRef.current) return;
    setIsAutoScrolling(false);
    const cardWidth = 360 + 32;
    scrollRef.current.scrollBy({ left: -cardWidth, behavior: "smooth" });
  };

  const handleScrollRight = () => {
    if (!scrollRef.current) return;
    setIsAutoScrolling(false);
    const cardWidth = 360 + 32;
    scrollRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
  };

  const handleDotClick = (index: number) => {
    if (!scrollRef.current) return;
    setIsAutoScrolling(false);
    const cardWidth = 360 + 32;
    scrollRef.current.scrollTo({ left: cardWidth * index, behavior: "smooth" });
  };

  // Update active card on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const scrollPosition = scrollRef.current.scrollLeft;
      const cardWidth = 360 + 32;
      const activeIndex = Math.round(scrollPosition / cardWidth);
      setActiveCardIndex(activeIndex);
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Counter animation component
  const AnimatedCounter = ({
    target,
    label,
  }: {
    target: number;
    label: string;
  }) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
              current += step;
              if (current >= target) {
                setCount(target);
                clearInterval(timer);
              } else {
                setCount(Math.floor(current));
              }
            }, 16);
          }
        },
        { threshold: 0.1 },
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }, [target, hasAnimated]);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center p-10 border border-[#1a1a1a] rounded-3xl hover:border-[#00C5FF] hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden group"
      >
        <div className="text-6xl font-black text-transparent bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] bg-clip-text mb-2">
          {count}+
        </div>
        <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold">
          {label}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[400px] h-[400px] -top-[200px] -left-[200px] rounded-full bg-gradient-radial from-[#00C5FF]/10 to-transparent animate-float" />
        <div className="absolute w-[300px] h-[300px] top-1/2 -right-[150px] rounded-full bg-gradient-radial from-[#00C5FF]/10 to-transparent animate-float-delayed" />
        <div className="absolute w-[500px] h-[500px] -bottom-[250px] left-1/2 rounded-full bg-gradient-radial from-[#00C5FF]/10 to-transparent animate-float-slow" />
      </div>

      <Container>
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="pt-32 pb-20 text-center relative"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#00C5FF]/10 border border-[#00C5FF]/30 rounded-full text-[#00C5FF] text-xs font-bold uppercase tracking-wider mb-8"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            Sobre Nosotros
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-white to-[#00C5FF] bg-clip-text text-transparent">
              We Build Digital
              <br />
              Experiences That Matter
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-['Avenir']"
          >
            Somos un equipo apasionado de creativos, estrategas y
            desarrolladores dedicados a transformar ideas en realidades
            digitales excepcionales.
          </motion.p>
        </motion.section>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 my-20">
          {stats.map((stat, index) => (
            <AnimatedCounter
              key={index}
              target={stat.number}
              label={stat.label}
            />
          ))}
        </div>

        {/* Team Section */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-4 font-['Poppins']">
              Conoce al Equipo
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Profesionales talentosos unidos por la pasión de crear
              experiencias digitales extraordinarias
            </p>
          </motion.div>

          {/* Horizontal Scroll Container */}
          <div className="relative">
            <div
              ref={scrollRef}
              onMouseEnter={() => {
                if (autoScrollInterval.current) {
                  clearInterval(autoScrollInterval.current);
                }
              }}
              onMouseLeave={() => setIsAutoScrolling(true)}
              className="flex gap-8 overflow-x-auto pb-8 scrollbar-thin scrollbar-track-[#0a0a0a] scrollbar-thumb-[#00C5FF] scroll-smooth"
              style={{ scrollbarWidth: "thin" }}
            >
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex-shrink-0 w-[360px] bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl overflow-hidden hover:border-[#00C5FF] hover:-translate-y-3 hover:scale-[1.02] transition-all duration-500 cursor-pointer group"
                >
                  {/* Card Image */}
                  <div className="relative h-80 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                    <div className="w-full h-full flex items-center justify-center text-8xl font-black bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500">
                      {member.initials}
                    </div>
                    <div className="absolute top-5 left-5 px-4 py-1.5 bg-black/80 backdrop-blur-md border border-[#00C5FF]/30 rounded-full text-[#00C5FF] text-xs font-semibold uppercase tracking-wide z-20">
                      {member.role}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-8 relative">
                    <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#00C5FF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                    <p className="text-[#00C5FF] font-semibold mb-4">
                      {member.title}
                    </p>
                    <p className="text-sm text-gray-400 leading-relaxed mb-5">
                      {member.bio}
                    </p>

                    {/* Social Icons */}
                    <div className="flex gap-3">
                      {member.socials.map((social, i) => (
                        <a
                          key={i}
                          href={social.url}
                          className="w-9 h-9 rounded-full bg-white/5 border border-[#1a1a1a] flex items-center justify-center text-gray-400 hover:bg-[#00C5FF] hover:text-black hover:-translate-y-1 hover:rotate-[360deg] transition-all duration-300"
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Scroll Controls */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handleScrollLeft}
                className="w-12 h-12 rounded-full bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center text-gray-400 hover:bg-[#00C5FF] hover:text-black hover:scale-110 transition-all duration-300"
                aria-label="Scroll left"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={handleScrollRight}
                className="w-12 h-12 rounded-full bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center text-gray-400 hover:bg-[#00C5FF] hover:text-black hover:scale-110 transition-all duration-300"
                aria-label="Scroll right"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Scroll Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {teamMembers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeCardIndex === index
                      ? "w-6 bg-[#00C5FF]"
                      : "w-2 bg-[#1a1a1a] hover:bg-[#00C5FF] hover:scale-125"
                  }`}
                  aria-label={`Go to team member ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 my-20 bg-[#0a0a0a] border-y border-[#1a1a1a] -mx-6 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-4 font-['Poppins']">
              Nuestros Valores
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Principios que guían cada proyecto y decisión que tomamos
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mt-16">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-10 rounded-3xl hover:-translate-y-2 transition-all duration-500 relative group"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#00C5FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-[#00C5FF]/50 transition-colors duration-500" />

                <div className="relative w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#00C5FF]/10 to-[#00C5FF]/5 rounded-2xl flex items-center justify-center group-hover:rotate-y-180 transition-transform duration-500">
                  <svg
                    width="40"
                    height="40"
                    fill="none"
                    stroke="#00C5FF"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:scale-110 transition-transform duration-500"
                  >
                    {value.icon === "innovation" && (
                      <>
                        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                    {value.icon === "excellence" && (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                      </>
                    )}
                    {value.icon === "collaboration" && (
                      <>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </>
                    )}
                    {value.icon === "agility" && (
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    )}
                  </svg>
                </div>

                <h3 className="text-2xl font-bold mb-3 relative">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed relative">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto p-20 bg-gradient-to-br from-[#00C5FF]/10 to-[#00C5FF]/5 border-2 border-[#00C5FF]/30 rounded-[30px] relative overflow-hidden"
          >
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-radial from-[#00C5FF]/10 to-transparent animate-spin-slow" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-5 font-['Poppins']">
                ¿Listo para Trabajar Juntos?
              </h2>
              <p className="text-lg text-gray-400 mb-10">
                Transformemos tu visión en una realidad digital excepcional.
                Hablemos de tu próximo proyecto.
              </p>

              <Link
                href="/contacto"
                className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-black font-bold rounded-xl hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,217,255,0.4)] transition-all duration-300"
              >
                Comenzar Proyecto
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </section>
      </Container>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-25px, 25px) scale(1.05);
          }
          66% {
            transform: translate(15px, -15px) scale(0.95);
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -40px) scale(1.08);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 20s ease-in-out infinite 7s;
        }

        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite 14s;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .bg-gradient-radial {
          background: radial-gradient(
            circle,
            rgba(0, 217, 255, 0.1),
            transparent
          );
        }

        .scrollbar-thin::-webkit-scrollbar {
          height: 8px;
        }

        .scrollbar-track-\\[\\#0a0a0a\\]::-webkit-scrollbar-track {
          background: #0a0a0a;
          border-radius: 10px;
        }

        .scrollbar-thumb-\\[\\#00C5FF\\]::-webkit-scrollbar-thumb {
          background: #00c5ff;
          border-radius: 10px;
        }

        .scrollbar-thumb-\\[\\#00C5FF\\]::-webkit-scrollbar-thumb:hover {
          background: #00b8db;
        }
      `}</style>
    </div>
  );
}
