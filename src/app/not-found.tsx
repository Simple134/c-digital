import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-20">
      {/* Background Pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(0, 217, 255, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0, 217, 255, 0.03) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 max-w-2xl w-full text-center animate-fadeIn">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-[150px] lg:text-[200px] font-extrabold leading-none bg-gradient-to-b from-[#00d9ff] to-[#00d9ff]/20 bg-clip-text text-transparent select-none">
            404
          </h1>
        </div>

        {/* Decorative Line */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#00d9ff]" />
          <div className="w-2 h-2 rounded-full bg-[#00d9ff] animate-pulse" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#00d9ff]" />
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            Página no encontrada
          </h2>
          <p className="text-lg text-gray-400 max-w-md mx-auto leading-relaxed">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="group px-8 py-4 bg-[#00d9ff] text-black font-bold rounded-xl hover:shadow-lg hover:shadow-[#00d9ff]/40 transition-all hover:-translate-y-1 inline-flex items-center gap-2"
          >
            <span>← Volver al inicio</span>
          </Link>

          <Link
            href="/contacto"
            className="group px-8 py-4 bg-transparent text-white font-bold rounded-xl border border-[#1a1a1a] hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 transition-all inline-flex items-center gap-2"
          >
            <span>Contactar soporte</span>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-16 pt-8 border-t border-[#1a1a1a]">
          <p className="text-sm text-gray-500 mb-4">Enlaces útiles:</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link
              href="/servicios"
              className="text-gray-400 hover:text-[#00d9ff] transition-colors"
            >
              Servicios
            </Link>
            <span className="text-gray-700">•</span>
            <Link
              href="/nosotros"
              className="text-gray-400 hover:text-[#00d9ff] transition-colors"
            >
              Nosotros
            </Link>
            <span className="text-gray-700">•</span>
            <Link
              href="/blog"
              className="text-gray-400 hover:text-[#00d9ff] transition-colors"
            >
              Blog
            </Link>
            <span className="text-gray-700">•</span>
            <Link
              href="/equipo"
              className="text-gray-400 hover:text-[#00d9ff] transition-colors"
            >
              Equipo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
