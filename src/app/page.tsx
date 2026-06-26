import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #ecfeff 100%)' }}>

      {/* ── Animated background blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 animate-blob"
          style={{ background: 'radial-gradient(circle, #4f46e5, transparent)', animationDelay: '0s' }} />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full opacity-15 animate-blob"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', animationDelay: '3s' }} />
        <div className="absolute -bottom-20 left-1/3 w-[350px] h-[350px] rounded-full opacity-10 animate-blob"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)', animationDelay: '6s' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(79,70,229,1) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 w-full py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 animate-fade-in">
            <Image
              src="/logo-kesbangpol.png"
              alt="Logo Kesbangpol"
              width={40}
              height={40}
              className="object-contain drop-shadow"
            />
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              Presen<span style={{ color: '#4f46e5' }}>Z</span>
            </span>
          </div>

          <div className="flex items-center gap-3 animate-fade-in">
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{ color: '#4f46e5' }}
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)' }}
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
            style={{
              background: 'rgba(79,70,229,0.08)',
              border: '1px solid rgba(79,70,229,0.2)',
              color: '#4f46e5',
            }}>
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Badan Kesatuan Bangsa dan Politik — Kota Banjarmasin
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Absensi Digital
            <br />
            <span className="text-shimmer">Tanpa Ribet</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: '#475569' }}>
            Sistem presensi modern untuk mahasiswa magang. Check-in sekali klik,
            pantau riwayat kehadiran real-time, dan ekspor laporan — semua dalam
            satu platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)' }}
            >
              Mulai Sekarang
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(79,70,229,0.25)',
                color: '#4f46e5',
                backdropFilter: 'blur(8px)',
              }}>
              Sudah Punya Akun
            </Link>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 stagger-children">
            {[
              { icon: "⚡", label: "Check-in Sekali Klik" },
              { icon: "📊", label: "Riwayat Real-time"   },
              { icon: "📄", label: "Export Excel"         },
              { icon: "🗺️", label: "Verifikasi GPS"       },
              { icon: "🏛️", label: "Struktur Organisasi"  },
              { icon: "📢", label: "Pengumuman Kantor"    },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(99,102,241,0.12)',
                  color: '#334155',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-6 px-6 text-center">
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          © {new Date().getFullYear()} PresenZ — Kesbangpol Kota Banjarmasin
        </p>
      </footer>
    </div>
  );
}
