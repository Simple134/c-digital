"use client";
import React, { JSX, useState } from "react";
import Link from "next/link";

// Blog post interface
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  authorInitials: string;
  readTime: string;
  views: string;
  imageGradient: string;
  svgContent: JSX.Element;
}

// Featured post data
const featuredPost: BlogPost = {
  id: "1",
  title:
    "The Future of Web Development: AI-Powered Tools Transforming How We Build",
  excerpt:
    "Explore how artificial intelligence is revolutionizing web development workflows, from intelligent code completion to automated testing and deployment strategies.",
  category: "Web Development",
  date: "January 12, 2026",
  author: "C Digital Team",
  authorInitials: "CD",
  readTime: "12 min read",
  views: "2.4k views",
  imageGradient: "linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)",
  svgContent: (
    <svg viewBox="0 0 1200 500" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: "#00d9ff", stopOpacity: 0.1 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "#0099cc", stopOpacity: 0.05 }}
          />
        </linearGradient>
        <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: "#00d9ff", stopOpacity: 0.8 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "#0066ff", stopOpacity: 0.9 }}
          />
        </linearGradient>
      </defs>

      <rect width="1200" height="500" fill="url(#bgGrad)" />

      <circle cx="950" cy="150" r="80" fill="#00d9ff" opacity="0.1" />
      <circle cx="1050" cy="350" r="60" fill="#00d9ff" opacity="0.08" />
      <rect
        x="100"
        y="50"
        width="120"
        height="120"
        rx="12"
        fill="#00d9ff"
        opacity="0.05"
        transform="rotate(-15 160 110)"
      />

      <rect
        x="550"
        y="100"
        width="550"
        height="350"
        rx="20"
        fill="#1a1a1a"
        stroke="#00d9ff"
        strokeWidth="3"
      />
      <rect
        x="570"
        y="120"
        width="510"
        height="290"
        rx="8"
        fill="url(#screenGrad)"
      />

      <rect
        x="600"
        y="150"
        width="150"
        height="12"
        rx="6"
        fill="white"
        opacity="0.3"
      />
      <rect
        x="600"
        y="180"
        width="200"
        height="12"
        rx="6"
        fill="white"
        opacity="0.4"
      />
      <rect
        x="600"
        y="210"
        width="180"
        height="12"
        rx="6"
        fill="white"
        opacity="0.3"
      />

      <circle cx="900" cy="280" r="60" fill="white" opacity="0.2" />
      <path
        d="M880 280 L900 300 L940 260"
        stroke="white"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      <circle cx="500" cy="200" r="35" fill="#00d9ff" opacity="0.2" />
      <text x="490" y="215" fontSize="24" fill="#00d9ff">
        🚀
      </text>

      <circle cx="1120" cy="250" r="35" fill="#00d9ff" opacity="0.2" />
      <text x="1110" y="265" fontSize="24" fill="#00d9ff">
        ⚡
      </text>

      <text
        x="200"
        y="250"
        fontSize="120"
        fill="#00d9ff"
        opacity="0.15"
        fontFamily="monospace"
        fontWeight="bold"
      >
        &lt;/&gt;
      </text>

      <circle cx="450" cy="100" r="3" fill="#00d9ff" />
      <circle cx="480" cy="380" r="4" fill="#00d9ff" opacity="0.6" />
      <circle cx="1150" cy="120" r="3" fill="#00d9ff" />
    </svg>
  ),
};

// Blog posts data
const blogPosts: BlogPost[] = [
  {
    id: "2",
    title:
      "Flutter App Development Cost: Complete Pricing Guide [2026 Updated]",
    excerpt:
      "Learn everything about Flutter app development costs and pricing strategies.",
    category: "App Development",
    date: "January 12, 2026",
    author: "Paresh Mayani",
    authorInitials: "PM",
    readTime: "8 min read",
    views: "1.8k views",
    imageGradient: "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)",
    svgContent: (
      <svg viewBox="0 0 400 240" style={{ width: "100%", height: "100%" }}>
        <circle cx="60" cy="80" r="30" fill="#5c6bc0" />
        <rect x="100" y="120" width="200" height="80" rx="8" fill="#3f51b5" />
        <rect x="120" y="90" width="50" height="60" rx="5" fill="#7986cb" />
        <circle cx="140" cy="140" r="15" fill="#9fa8da" />
        <text x="280" y="110" fontSize="12" fill="#3f51b5" fontWeight="600">
          Flutter
        </text>
        <rect
          x="260"
          y="95"
          width="80"
          height="30"
          rx="5"
          fill="white"
          stroke="#3f51b5"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    id: "3",
    title: "Real Estate CRM Software Development: A 2026 Guide",
    excerpt: "Comprehensive guide to building real estate CRM systems.",
    category: "Software Development",
    date: "January 10, 2026",
    author: "Satendra Bhadoria",
    authorInitials: "SB",
    readTime: "10 min read",
    views: "1.5k views",
    imageGradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
    svgContent: (
      <svg viewBox="0 0 400 240" style={{ width: "100%", height: "100%" }}>
        <rect
          x="150"
          y="40"
          width="100"
          height="180"
          rx="10"
          fill="#1976d2"
          stroke="#0d47a1"
          strokeWidth="3"
        />
        <rect x="160" y="60" width="80" height="140" fill="white" />
        <circle cx="200" cy="210" r="8" fill="#64b5f6" />
        <text x="185" y="105" fontSize="10" fill="#1976d2" fontWeight="600">
          Real Estate CRM
        </text>
        <circle cx="120" cy="100" r="20" fill="#2196f3" opacity="0.3" />
        <circle cx="280" cy="140" r="25" fill="#42a5f5" opacity="0.3" />
        <text x="275" y="145" fontSize="14" fill="#1976d2">
          %
        </text>
      </svg>
    ),
  },
  {
    id: "4",
    title:
      "How to Hire an Offshore Development Team in 2026: Your Complete Guide",
    excerpt:
      "Everything you need to know about hiring offshore development teams.",
    category: "How To Guides",
    date: "January 8, 2026",
    author: "Satendra Bhadoria",
    authorInitials: "SB",
    readTime: "15 min read",
    views: "2.1k views",
    imageGradient: "linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)",
    svgContent: (
      <svg viewBox="0 0 400 240" style={{ width: "100%", height: "100%" }}>
        <rect x="100" y="80" width="200" height="120" rx="10" fill="#7cb342" />
        <circle cx="320" cy="120" r="35" fill="#8bc34a" opacity="0.3" />
        <text x="140" y="100" fontSize="10" fill="white" fontWeight="600">
          Hire an Offshore
        </text>
        <text x="140" y="115" fontSize="10" fill="white" fontWeight="600">
          Development Team
        </text>
        <circle cx="250" cy="150" r="25" fill="#aed581" />
        <text x="240" y="157" fontSize="18" fill="#558b2f">
          💻
        </text>
        <rect
          x="50"
          y="150"
          width="40"
          height="40"
          fill="#9ccc65"
          opacity="0.3"
        />
      </svg>
    ),
  },
  {
    id: "5",
    title: "Optimize React App Performance: Complete Developer Guide 2026",
    excerpt: "Learn advanced techniques to optimize your React applications.",
    category: "App Development",
    date: "January 7, 2026",
    author: "Paresh Mayani",
    authorInitials: "PM",
    readTime: "12 min read",
    views: "1.9k views",
    imageGradient: "linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%)",
    svgContent: (
      <svg viewBox="0 0 400 240" style={{ width: "100%", height: "100%" }}>
        <rect
          x="120"
          y="60"
          width="120"
          height="160"
          rx="10"
          fill="#0288d1"
          stroke="#01579b"
          strokeWidth="3"
        />
        <rect x="130" y="80" width="100" height="130" fill="white" />
        <text x="145" y="105" fontSize="9" fill="#0288d1" fontWeight="600">
          Optimize React
        </text>
        <text x="145" y="120" fontSize="9" fill="#0288d1" fontWeight="600">
          App Performance
        </text>
        <circle cx="180" cy="160" r="20" fill="#03a9f4" opacity="0.3" />
        <circle cx="310" cy="140" r="25" fill="#29b6f6" opacity="0.3" />
      </svg>
    ),
  },
  {
    id: "6",
    title: "CRM Software Development: Complete Guide for Business Growth",
    excerpt: "Build powerful CRM solutions that drive business growth.",
    category: "Software Development",
    date: "January 6, 2026",
    author: "Satendra Bhadoria",
    authorInitials: "SB",
    readTime: "11 min read",
    views: "1.7k views",
    imageGradient: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
    svgContent: (
      <svg viewBox="0 0 400 240" style={{ width: "100%", height: "100%" }}>
        <circle cx="140" cy="140" r="50" fill="#ff9800" />
        <text x="115" y="150" fontSize="24" fill="white" fontWeight="bold">
          CRM
        </text>
        <rect x="220" y="100" width="100" height="80" rx="5" fill="#ffb74d" />
        <text x="235" y="125" fontSize="10" fill="white" fontWeight="600">
          CRM Software
        </text>
        <text x="235" y="140" fontSize="10" fill="white" fontWeight="600">
          Development
        </text>
        <circle cx="280" cy="80" r="15" fill="#ffa726" />
      </svg>
    ),
  },
  {
    id: "7",
    title: "AI Agents in Healthcare: Transforming Patient Care in 2026",
    excerpt: "Discover how AI is revolutionizing healthcare delivery.",
    category: "Healthcare",
    date: "January 5, 2026",
    author: "Paresh Mayani",
    authorInitials: "PM",
    readTime: "9 min read",
    views: "2.2k views",
    imageGradient: "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)",
    svgContent: (
      <svg viewBox="0 0 400 240" style={{ width: "100%", height: "100%" }}>
        <rect
          x="140"
          y="50"
          width="120"
          height="180"
          rx="10"
          fill="#5e35b1"
          stroke="#4527a0"
          strokeWidth="3"
        />
        <rect x="150" y="70" width="100" height="150" fill="white" />
        <circle cx="200" cy="120" r="30" fill="#7e57c2" />
        <text x="190" y="130" fontSize="24" fill="white">
          🤖
        </text>
        <circle cx="310" cy="100" r="20" fill="#9575cd" opacity="0.3" />
        <circle cx="90" cy="150" r="25" fill="#b39ddb" opacity="0.3" />
        <text x="175" y="95" fontSize="9" fill="#5e35b1" fontWeight="600">
          AI Agents in
        </text>
        <text x="175" y="107" fontSize="9" fill="#5e35b1" fontWeight="600">
          Healthcare
        </text>
      </svg>
    ),
  },
];

const categories = [
  "All",
  "AI ML Development",
  "App Development",
  "App Ideas",
  "Best Apps",
  "Fintech",
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert("¡Gracias por suscribirte!");
      setEmail("");
    }
  };

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
            Expert Insights That Drives Innovation And Progress
          </h1>
          <p className="text-lg text-gray-400 max-w-[700px] mx-auto font-normal">
            Discover expert perspectives to spark ideas and strengthen your
            expertise.
          </p>
        </header>

        {/* Categories Filter */}
        <div className="flex gap-3 justify-center flex-wrap mb-16 animate-fadeInUp">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 ${
                activeCategory === category
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
        </div>

        {/* Featured Card */}
        <Link href={`/blog/${featuredPost.id}`}>
          <article className="grid lg:grid-cols-[1.2fr_1fr] gap-0 bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl overflow-hidden mb-16 cursor-pointer transition-all duration-400 hover:border-[#00d9ff] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,217,255,0.15)] animate-fadeIn">
            <div className="relative bg-[#000000] min-h-[400px] overflow-hidden">
              {featuredPost.svgContent}
              <span className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-4 py-2 bg-[#00d9ff] text-[#000000] rounded-lg text-xs font-bold uppercase tracking-wide z-10">
                <svg
                  width="14"
                  height="14"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                Featured Article
              </span>
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

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
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
        </div>

        {/* Newsletter Section */}
        <section className="bg-gradient-to-br from-[rgba(0,217,255,0.1)] to-[rgba(0,217,255,0.05)] border border-[rgba(0,217,255,0.2)] rounded-3xl p-16 text-center mb-20 animate-fadeIn">
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight">
            Suscríbete a Nuestro Newsletter
          </h2>
          <p className="text-base text-gray-400 mb-8 max-w-[500px] mx-auto">
            Recibe los mejores insights y estrategias digitales directamente en
            tu inbox. Sin spam, solo contenido de valor.
          </p>
          <form
            onSubmit={handleNewsletterSubmit}
            className="flex gap-3 max-w-[500px] mx-auto flex-col sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="flex-1 px-5 py-4 bg-[#000000] border border-[#1a1a1a] rounded-xl text-white text-[15px] transition-all duration-300 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-[#00d9ff] text-[#000000] border-0 rounded-xl text-[15px] font-bold cursor-pointer transition-all duration-300 whitespace-nowrap hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,217,255,0.3)]"
            >
              Suscribirse
            </button>
          </form>
        </section>

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
