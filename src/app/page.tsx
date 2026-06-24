import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-subtle bg-pattern flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-primary-800 tracking-tight">
              Presen<span className="text-primary-500">Z</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-medium text-primary-700 hover:text-primary-800 rounded-xl hover:bg-primary-50 transition-all duration-200"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-primary rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
            Badan Kesatuan Bangsa dan Politik Kota Banjarmasin
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-950 leading-tight tracking-tight mb-6">
            Absensi Digital
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Tanpa Ribet
            </span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Sistem presensi modern untuk mahasiswa magang. Check-in sekali klik,
            pantau riwayat kehadiran, dan ekspor laporan — semua dalam satu
            platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-primary rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              Mulai Sekarang
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-primary-700 bg-white border border-primary-200 rounded-2xl hover:bg-primary-50 transition-all duration-200"
            >
              Sudah Punya Akun
            </Link>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-14 stagger-children">
            {[
              { icon: "⚡", label: "Check-in Sekali Klik" },
              { icon: "📊", label: "Riwayat Real-time" },
              { icon: "📄", label: "Export Excel" },
              { icon: "🏛️", label: "Struktur Organisasi" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center">
        <p className="text-sm text-neutral-400">
          © {new Date().getFullYear()} PresenZ — Kesbangpol Kota Banjarmasin
        </p>
      </footer>
    </div>
  );
}
