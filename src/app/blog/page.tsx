"use client";
import React, { JSX } from "react";
import Link from "next/link";

// Blog post interface
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  authorInitials: string;
  readTime: string;
  views: string;
  imageGradient: string;
  image?: string;
  svgContent?: JSX.Element;
}

// Featured post data
const featuredPost: BlogPost = {
  id: "1",
  slug: "guia-definitiva-contratar-agencia-marketing-digital-2026",
  title:
    "Guía Definitiva para Contratar una Agencia de Marketing Digital en 2026",
  excerpt:
    "Descubre cómo elegir la agencia correcta que realmente impulse tu negocio. Desde definir objetivos hasta hacer las preguntas clave, esta guía te ayuda a tomar decisiones estratégicas e invertir inteligentemente en tu crecimiento digital.",
  category: "Marketing Digital",
  date: "January 19, 2026",
  author: "C Digital Team",
  authorInitials: "CD",
  readTime: "15 min read",
  views: "0 views",
  imageGradient: "linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)",
  image: "/blog1.png",
};

// // Blog posts data
// const blogPosts: BlogPost[] = [
//   {
//     id: "2",
//     title:
//       "Flutter App Development Cost: Complete Pricing Guide [2026 Updated]",
//     excerpt:
//       "Learn everything about Flutter app development costs and pricing strategies.",
//     category: "App Development",
//     date: "January 12, 2026",
//     author: "Paresh Mayani",
//     authorInitials: "PM",
//     readTime: "8 min read",
//     views: "1.8k views",
//     imageGradient: "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)",
//     svgContent: (
//       <svg viewBox="0 0 400 240" style={{ width: "100%", height: "100%" }}>
//         <circle cx="60" cy="80" r="30" fill="#5c6bc0" />
//         <rect x="100" y="120" width="200" height="80" rx="8" fill="#3f51b5" />
//         <rect x="120" y="90" width="50" height="60" rx="5" fill="#7986cb" />
//         <circle cx="140" cy="140" r="15" fill="#9fa8da" />
//         <text x="280" y="110" fontSize="12" fill="#3f51b5" fontWeight="600">
//           Flutter
//         </text>
//         <rect
//           x="260"
//           y="95"
//           width="80"
//           height="30"
//           rx="5"
//           fill="white"
//           stroke="#3f51b5"
//           strokeWidth="2"
//         />
//       </svg>
//     ),
//   },
//   {
//     id: "3",
//     title: "Real Estate CRM Software Development: A 2026 Guide",
//     excerpt: "Comprehensive guide to building real estate CRM systems.",
//     category: "Software Development",
//     date: "January 10, 2026",
//     author: "Satendra Bhadoria",
//     authorInitials: "SB",
//     readTime: "10 min read",
//     views: "1.5k views",
//     imageGradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
//     svgContent: (
//       <svg viewBox="0 0 400 240" style={{ width: "100%", height: "100%" }}>
//         <rect
//           x="150"
//           y="40"
//           width="100"
//           height="180"
//           rx="10"
//           fill="#1976d2"
//           stroke="#0d47a1"
//           strokeWidth="3"
//         />
//         <rect x="160" y="60" width="80" height="140" fill="white" />
//         <circle cx="200" cy="210" r="8" fill="#64b5f6" />
//         <text x="185" y="105" fontSize="10" fill="#1976d2" fontWeight="600">
//           Real Estate CRM
//         </text>
//         <circle cx="120" cy="100" r="20" fill="#2196f3" opacity="0.3" />
//         <circle cx="280" cy="140" r="25" fill="#42a5f5" opacity="0.3" />
//         <text x="275" y="145" fontSize="14" fill="#1976d2">
//           %
//         </text>
//       </svg>
//     ),
//   },
//   {
//     id: "4",
//     title:
//       "How to Hire an Offshore Development Team in 2026: Your Complete Guide",
//     excerpt:
//       "Everything you need to know about hiring offshore development teams.",
//     category: "How To Guides",
//     date: "January 8, 2026",
//     author: "Satendra Bhadoria",
//     authorInitials: "SB",
//     readTime: "15 min read",
//     views: "2.1k views",
//     imageGradient: "linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)",
//     svgContent: (
//       <svg viewBox="0 0 400 240" style={{ width: "100%", height: "100%" }}>
//         <rect x="100" y="80" width="200" height="120" rx="10" fill="#7cb342" />
//         <circle cx="320" cy="120" r="35" fill="#8bc34a" opacity="0.3" />
//         <text x="140" y="100" fontSize="10" fill="white" fontWeight="600">
//           Hire an Offshore
//         </text>
//         <text x="140" y="115" fontSize="10" fill="white" fontWeight="600">
//           Development Team
//         </text>
//         <circle cx="250" cy="150" r="25" fill="#aed581" />
//         <text x="240" y="157" fontSize="18" fill="#558b2f">
//           💻
//         </text>
//         <rect
//           x="50"
//           y="150"
//           width="40"
//           height="40"
//           fill="#9ccc65"
//           opacity="0.3"
//         />
//       </svg>
//     ),
//   },
//   {
//     id: "5",
//     title: "Optimize React App Performance: Complete Developer Guide 2026",
//     excerpt: "Learn advanced techniques to optimize your React applications.",
//     category: "App Development",
//     date: "January 7, 2026",
//     author: "Paresh Mayani",
//     authorInitials: "PM",
//     readTime: "12 min read",
//     views: "1.9k views",
//     imageGradient: "linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%)",
//     svgContent: (
//       <svg viewBox="0 0 400 240" style={{ width: "100%", height: "100%" }}>
//         <rect
//           x="120"
//           y="60"
//           width="120"
//           height="160"
//           rx="10"
//           fill="#0288d1"
//           stroke="#01579b"
//           strokeWidth="3"
//         />
//         <rect x="130" y="80" width="100" height="130" fill="white" />
//         <text x="145" y="105" fontSize="9" fill="#0288d1" fontWeight="600">
//           Optimize React
//         </text>
//         <text x="145" y="120" fontSize="9" fill="#0288d1" fontWeight="600">
//           App Performance
//         </text>
//         <circle cx="180" cy="160" r="20" fill="#03a9f4" opacity="0.3" />
//         <circle cx="310" cy="140" r="25" fill="#29b6f6" opacity="0.3" />
//       </svg>
//     ),
//   },
//   {
//     id: "6",
//     title: "CRM Software Development: Complete Guide for Business Growth",
//     excerpt: "Build powerful CRM solutions that drive business growth.",
//     category: "Software Development",
//     date: "January 6, 2026",
//     author: "Satendra Bhadoria",
//     authorInitials: "SB",
//     readTime: "11 min read",
//     views: "1.7k views",
//     imageGradient: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
//     svgContent: (
//       <svg viewBox="0 0 400 240" style={{ width: "100%", height: "100%" }}>
//         <circle cx="140" cy="140" r="50" fill="#ff9800" />
//         <text x="115" y="150" fontSize="24" fill="white" fontWeight="bold">
//           CRM
//         </text>
//         <rect x="220" y="100" width="100" height="80" rx="5" fill="#ffb74d" />
//         <text x="235" y="125" fontSize="10" fill="white" fontWeight="600">
//           CRM Software
//         </text>
//         <text x="235" y="140" fontSize="10" fill="white" fontWeight="600">
//           Development
//         </text>
//         <circle cx="280" cy="80" r="15" fill="#ffa726" />
//       </svg>
//     ),
//   },
//   {
//     id: "7",
//     title: "AI Agents in Healthcare: Transforming Patient Care in 2026",
//     excerpt: "Discover how AI is revolutionizing healthcare delivery.",
//     category: "Healthcare",
//     date: "January 5, 2026",
//     author: "Paresh Mayani",
//     authorInitials: "PM",
//     readTime: "9 min read",
//     views: "2.2k views",
//     imageGradient: "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)",
//     svgContent: (
//       <svg viewBox="0 0 400 240" style={{ width: "100%", height: "100%" }}>
//         <rect
//           x="140"
//           y="50"
//           width="120"
//           height="180"
//           rx="10"
//           fill="#5e35b1"
//           stroke="#4527a0"
//           strokeWidth="3"
//         />
//         <rect x="150" y="70" width="100" height="150" fill="white" />
//         <circle cx="200" cy="120" r="30" fill="#7e57c2" />
//         <text x="190" y="130" fontSize="24" fill="white">
//           🤖
//         </text>
//         <circle cx="310" cy="100" r="20" fill="#9575cd" opacity="0.3" />
//         <circle cx="90" cy="150" r="25" fill="#b39ddb" opacity="0.3" />
//         <text x="175" y="95" fontSize="9" fill="#5e35b1" fontWeight="600">
//           AI Agents in
//         </text>
//         <text x="175" y="107" fontSize="9" fill="#5e35b1" fontWeight="600">
//           Healthcare
//         </text>
//       </svg>
//     ),
//   },
// ];

// const categories = [
//   "All",
//   "AI ML Development",
//   "App Development",
//   "App Ideas",
//   "Best Apps",
//   "Fintech",
// ];

export default function BlogPage() {
  return (
    <div className="min-h-screen text-white relative overflow-x-hidden">
      {/* Background Pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(0, 217, 255, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0, 217, 255, 0.03) 0%, transparent 50%)",
        }}
      />

      <div className="container relative z-10 mx-auto px-6 max-w-[1400px]">
        {/* Header */}
        <header className="pt-20 pb-12 text-center animate-fadeInDown">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white tracking-tight leading-tight">
            Conocimiento Experto que Impulsa la Innovación y el Crecimiento
          </h1>
          <p className="text-lg text-gray-400 max-w-[700px] mx-auto font-normal">
            Descubre perspectivas expertas para generar ideas y fortalecer tu
            conocimiento en marketing digital y diseño.
          </p>
        </header>

        {/* Categories Filter */}
        {/* <div className="flex gap-3 justify-center flex-wrap mb-16 animate-fadeInUp">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 ${activeCategory === category
                ? "bg-[rgba(0,217,255,0.05)] border-[#00d9ff] text-[#00d9ff] transform -translate-y-0.5"
                : "text-gray-400 hover:bg-[rgba(0,217,255,0.05)] hover:border-[#00d9ff] hover:text-[#00d9ff] hover:-translate-y-0.5"
                }`}
            >
              {category}
            </button>
          ))}
          <button className="px-6 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 text-gray-400 hover:bg-[rgba(0,217,255,0.05)] hover:border-[#00d9ff] hover:text-[#00d9ff] hover:-translate-y-0.5 flex items-center gap-1">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div> */}

        {/* Featured Card */}
        <Link href={`/blog/${featuredPost.slug}`}>
          <article className="grid lg:grid-cols-[1.2fr_1fr] gap-0 bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl overflow-hidden mb-16 cursor-pointer transition-all duration-400 hover:border-[#00d9ff] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,217,255,0.15)] animate-fadeIn">
            <div className="relative bg-[#000000] min-h-[400px] overflow-hidden">
              {featuredPost.image ? (
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                featuredPost.svgContent
              )}
            </div>
            <div className="p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-5">
                <span className="px-3 py-1.5 bg-[rgba(0,217,255,0.1)] border border-[rgba(0,217,255,0.3)] rounded-lg text-xs font-semibold text-[#00d9ff] uppercase tracking-wide">
                  {featuredPost.category}
                </span>
                <span className="text-sm text-gray-400">
                  {featuredPost.date}
                </span>
              </div>
              <h2 className="text-3xl font-extrabold leading-tight mb-4 tracking-tight text-white">
                {featuredPost.title}
              </h2>
              <p className="text-base leading-relaxed text-gray-400 mb-7">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center justify-between pt-6 border-t border-[#1a1a1a]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 min-w-[36px] rounded-full bg-gradient-to-br from-[#00d9ff] to-[#0099cc] flex items-center justify-center text-xs font-bold text-[#000000]">
                    {featuredPost.authorInitials}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {featuredPost.author}
                  </span>
                </div>
                <div className="flex items-center gap-5 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      className="opacity-70"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {featuredPost.readTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      className="opacity-70"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {featuredPost.views}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </Link>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {blogPosts.map((post, index) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <article
                className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden transition-all duration-400 cursor-pointer hover:border-[#00d9ff] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,217,255,0.1)] animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className="relative w-full h-60 overflow-hidden"
                  style={{ background: post.imageGradient }}
                >
                  <div className="absolute inset-0 transition-transform duration-600 hover:scale-110">
                    {post.svgContent}
                  </div>
                  <span className="absolute top-4 left-4 px-3 py-1.5 bg-[rgba(0,0,0,0.8)] backdrop-blur-[10px] border border-[rgba(0,217,255,0.3)] rounded-lg text-xs font-semibold text-[#00d9ff] uppercase tracking-wide">
                    {post.category}
                  </span>
                </div>
                <div className="p-7">
                  <div className="mb-4 text-xs text-gray-400">
                    <span>{post.date}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-5 leading-snug tracking-tight min-h-[56px] text-white">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2.5 mt-5 pt-5 border-t border-[#1a1a1a]">
                    <div className="w-9 h-9 min-w-[36px] rounded-full bg-gradient-to-br from-[#00d9ff] to-[#0099cc] flex items-center justify-center text-xs font-bold text-[#000000]">
                      {post.authorInitials}
                    </div>
                    <span className="text-sm font-medium text-white">
                      {post.author}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div> */}

        {/* Newsletter Section */}
        <div className="relative my-20 p-12 bg-gradient-to-br from-[#00C5FF]/10 to-[#00FF7C]/10 border-2 border-[#00C5FF]/30 rounded-3xl overflow-hidden">
          <div className="relative z-10 max-w-[600px] mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] rounded-2xl flex items-center justify-center">
              <svg
                width="32"
                height="32"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                className="text-black"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold font-['Poppins'] mb-3 bg-gradient-to-r from-white to-[#00C5FF] bg-clip-text text-transparent">
              Mantente al Día con Nosotros
            </h3>
            <p className="text-gray-400 mb-8">
              Únete a nuestra Comunidad y recibe contenido exclusivos,
              estrategias y actualizaciones directamente en tu inbox o WhatsApp.
            </p>

            <form className="space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Tu nombre"
                  className="flex-1 px-5 py-4 bg-black/50 border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00C5FF]"
                />
                <input
                  type="tel"
                  placeholder="+1 (809) 000-0000"
                  className="flex-1 px-5 py-4 bg-black/50 border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00C5FF]"
                />
              </div>
              <input
                type="email"
                placeholder="tu@email.com"
                className="w-full px-5 py-4 bg-black/50 border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00C5FF]"
              />
              <button
                type="submit"
                className="w-full px-8 py-4 bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-black font-bold rounded-xl hover:-translate-y-1 transition-transform"
              >
                Suscribirme Ahora
              </button>
              <p className="text-xs text-gray-500">
                Al suscribirte, aceptas nuestra Política de Privacidad y
                consientes recibir actualizaciones.
              </p>
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-10 text-center border-t border-[#1a1a1a] text-gray-400 text-sm">
          <p>© 2026 C Digital. Todos los derechos reservados.</p>
        </footer>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.8s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
}
