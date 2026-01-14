"use client";
import { Container } from "@bitnation-dev/components";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function BlogArticle() {
  const [activeSection, setActiveSection] = useState("client-story");

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const targetPosition = element.offsetTop - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  };

  // Update active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "client-story",
        "challenges",
        "growth-method",
        "results",
        "lessons",
      ];
      const scrollPosition = window.scrollY + 150;

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;

          if (
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
          ) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigationItems = [
    { id: "client-story", label: "Client's Story" },
    { id: "challenges", label: "Challenges we faced" },
    { id: "growth-method", label: "The Growth Method" },
    { id: "results", label: "Results" },
    { id: "lessons", label: "Lessons and Insights" },
  ];

  return (
    <div className="relative min-h-screen ">
      <Container>
        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-20 pb-10 max-w-[900px] mx-auto"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-['Poppins'] mb-6 leading-tight">
            The Growth Method
          </h1>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex gap-2">
              <span className="px-4 py-2 bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-black rounded-full text-sm font-semibold">
                Accessories
              </span>
              <span className="px-4 py-2 bg-[#0a0a0a] border border-[#1a1a1a] text-white rounded-full text-sm font-semibold">
                Google Ads
              </span>
              <span className="px-4 py-2 bg-[#0a0a0a] border border-[#1a1a1a] text-white rounded-full text-sm font-semibold">
                Europe
              </span>
            </div>
            <span className="text-gray-400 text-sm">3 min read</span>
          </div>
        </motion.header>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-[1200px] mx-auto mb-16 rounded-2xl overflow-hidden border border-[#1a1a1a]"
        >
          <Image
            src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&h=600&fit=crop"
            alt="The Growth Method"
            width={1200}
            height={600}
            className="w-full h-auto"
          />
        </motion.div>

        {/* Main Layout: Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-20 max-w-[1400px] mx-auto pb-32">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block sticky top-24 h-fit">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6">
              CONTENT:
            </div>
            <nav>
              <ul className="flex flex-col gap-4">
                {navigationItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className={`text-left text-sm pl-5 border-l-2 transition-all ${
                        activeSection === item.id
                          ? "text-[#00C5FF] border-[#00C5FF] font-semibold"
                          : "text-gray-400 border-[#1a1a1a] hover:text-white hover:border-gray-600"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t border-[#1a1a1a]">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                SHARE:
              </div>
              <div className="flex gap-3">
                {["facebook", "linkedin", "twitter", "link"].map((platform) => (
                  <button
                    key={platform}
                    className="w-11 h-11 rounded-full bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center text-gray-400 hover:text-[#00C5FF] hover:border-[#00C5FF] transition-all hover:-translate-y-0.5"
                    aria-label={`Share on ${platform}`}
                  >
                    <svg
                      width="18"
                      height="18"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Article Content */}
          <article className="max-w-[750px] text-lg leading-relaxed font-['Avenir']">
            {/* Client's Story */}
            <section id="client-story" className="mb-16 scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-6">
                Client&apos;s Story
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Coverslee specialises in intimate accessories that combine
                comfort with discretion.{" "}
                <strong className="text-white">
                  Despite offering quality products, their online sales lagged
                  due to underperforming Google Shopping listings.
                </strong>
              </p>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                Initial Request
              </h3>
              <p className="text-gray-300">
                We aim to optimise Google Ads&apos; performance, increase
                transactions, and drive profitable growth.
              </p>
            </section>

            {/* Challenges */}
            <section id="challenges" className="mb-16 scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-6">
                Challenges we faced
              </h2>
              <p className="text-gray-300 mb-4">
                <strong className="text-white">Main Issue:</strong> Coverslee&apos;s
                products were lost in the vast online marketplace. They faced
                several hurdles:
              </p>
              <ul className="space-y-3 my-6">
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Essential product information, such as keywords and
                    categories, was missing or incomplete.
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    They weren&apos;t fully utilising the features of Google Merchant
                    Centre, affecting their visibility.
                  </span>
                </li>
              </ul>
              <p className="text-gray-300 mb-6">
                Product titles and descriptions lacked the appeal needed to draw
                clicks and conversions.
              </p>

              <div className="bg-gradient-to-r from-[#00C5FF]/10 to-[#00FF7C]/10 border-l-4 border-[#00C5FF] p-6 rounded-lg">
                <p className="text-gray-300 m-0">
                  Our challenge was clear: transform Coverslee&apos;s underperforming
                  listings into high-converting assets that would stand out in a
                  competitive market.
                </p>
              </div>
            </section>

            {/* The Growth Method */}
            <section id="growth-method" className="mb-16 scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-6">
                The Growth Method
              </h2>
              <p className="text-gray-300 mb-8">
                To elevate Coverslee&apos;s presence on Google Shopping, we employed
                a multi-faceted approach:
              </p>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                Enhanced Product Ratings and Seller Ratings:
              </h3>
              <div className="space-y-4 mb-8">
                <div>
                  <strong className="text-white">Before:</strong>
                  <span className="text-gray-300">
                    No ratings were displayed, leaving potential customers
                    uncertain.
                  </span>
                </div>
                <div>
                  <strong className="text-white">After:</strong>
                  <span className="text-gray-300">
                    {" "}
                    We activated ratings to show off positive customer feedback,
                    which built trust and credibility.
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                Promotional Campaigns Setup:
              </h3>
              <div className="space-y-4 mb-8">
                <div>
                  <strong className="text-white">Before:</strong>
                  <span className="text-gray-300">
                    {" "}
                    Promotions were not being used effectively to attract
                    attention.
                  </span>
                </div>
                <div>
                  <strong className="text-white">After:</strong>
                  <span className="text-gray-300">
                    {" "}
                    We introduced eye-catching promotions that appeared directly
                    in the shopping ads, enhancing click-through rates.
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                Revamped Titles and Descriptions:
              </h3>
              <div className="space-y-4 mb-8">
                <div>
                  <strong className="text-white">Before:</strong>
                  <span className="text-gray-300">
                    {" "}
                    Titles and descriptions were bland and not optimised for
                    search queries.
                  </span>
                </div>
                <div>
                  <strong className="text-white">After:</strong>
                  <span className="text-gray-300">
                    {" "}
                    We injected relevant keywords into titles and crafted
                    compelling descriptions highlighting the products&apos; unique
                    benefits.
                  </span>
                </div>
              </div>
            </section>

            {/* Results */}
            <section id="results" className="mb-16 scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-6">
                Results
              </h2>
              <p className="text-gray-300 mb-6">
                Our strategic approach yielded impressive results for Coverslee:
              </p>
              <ul className="space-y-3 my-6">
                {[
                  "150% increase in click-through rate (CTR) - More users were enticed to click on their ads.",
                  "200% increase in conversion rate - Significantly more visitors became paying customers.",
                  "85% reduction in cost per acquisition (CPA) - The cost to acquire each new customer dropped dramatically.",
                  "Triple digit revenue growth - Overall sales saw substantial growth within the first quarter.",
                ].map((result, index) => (
                  <li key={index} className="flex gap-3 text-gray-300">
                    <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                      •
                    </span>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: result.replace(
                          /\*\*(.*?)\*\*/g,
                          '<strong class="text-white">$1</strong>',
                        ),
                      }}
                    />
                  </li>
                ))}
              </ul>

              <div className="bg-gradient-to-r from-[#00C5FF]/10 to-[#00FF7C]/10 border-l-4 border-[#00C5FF] p-6 rounded-lg mt-8">
                <p className="text-gray-300 m-0">
                  These results not only met but exceeded Coverslee&apos;s initial
                  goals, establishing them as a strong competitor in the online
                  intimate accessories market.
                </p>
              </div>
            </section>

            {/* Newsletter Banner */}
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
                  Stay Ahead of the Digital Curve
                </h3>
                <p className="text-gray-400 mb-8">
                  Join our newsletter and get exclusive insights, strategies,
                  and updates delivered directly to your inbox.
                </p>

                <form className="space-y-3">
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Your name"
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
                    placeholder="your@email.com"
                    className="w-full px-5 py-4 bg-black/50 border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00C5FF]"
                  />
                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-black font-bold rounded-xl hover:-translate-y-1 transition-transform"
                  >
                    Subscribe Now
                  </button>
                  <p className="text-xs text-gray-500">
                    By subscribing, you agree to our Privacy Policy and consent
                    to receive updates.
                  </p>
                </form>
              </div>
            </div>

            {/* Lessons and Insights */}
            <section id="lessons" className="mb-16 scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-6">
                Lessons and Insights
              </h2>
              <p className="text-gray-300 mb-6">
                This case study with Coverslee taught us several valuable
                lessons:
              </p>
              <ul className="space-y-3 my-6">
                {[
                  "<strong>Details Matter:</strong> Small optimisations in product information can lead to significant performance improvements.",
                  "<strong>Trust is Key:</strong> Displaying ratings and reviews builds customer confidence and encourages purchases.",
                  "<strong>Visibility Drives Sales:</strong> Proper categorisation and keyword optimisation are essential for appearing in relevant searches.",
                  "<strong>Strategic Promotions Work:</strong> Well-timed and well-placed promotions can drastically improve engagement.",
                ].map((lesson, index) => (
                  <li key={index} className="flex gap-3 text-gray-300">
                    <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                      •
                    </span>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: lesson.replace(
                          /<strong>/g,
                          '<strong class="text-white">',
                        ),
                      }}
                    />
                  </li>
                ))}
              </ul>
              <p className="text-gray-300">
                By focusing on these areas, we transformed Coverslee&apos;s Google
                Shopping presence from underperforming to thriving, proving that
                thoughtful, data-driven strategies can deliver outstanding
                results.
              </p>
            </section>

            {/* Author Card */}
            <div className="flex items-center gap-4 p-8 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl mt-16">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] flex items-center justify-center text-black font-bold text-2xl flex-shrink-0">
                VV
              </div>
              <div>
                <h4 className="text-lg font-bold">Veronika Vysotska</h4>
                <p className="text-sm text-gray-400">Team leader of PPC</p>
              </div>
            </div>
          </article>
        </div>
      </Container>
    </div>
  );
}
