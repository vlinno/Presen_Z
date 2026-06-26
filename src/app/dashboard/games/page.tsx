import Link from 'next/link'

export default function GamesPage() {
  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">🎮 Mini Games</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Kumpulan permainan seru untuk mengisi waktu luang Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
        {/* Crazy Games Card */}
        <a 
          href="https://www.crazygames.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card group block overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-violet-300"
        >
          <div className="h-40 bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
            {/* Simple Crazy Games Text / Logo representation */}
            <h2 className="text-3xl font-extrabold text-white z-10 italic tracking-wider drop-shadow-md flex items-center gap-2">
              <svg className="w-8 h-8 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              CRAZY<span className="text-violet-300">GAMES</span>
            </h2>
            
            <div className="absolute -bottom-6 -right-6 text-white/5 group-hover:text-white/10 transition-colors duration-300">
              <svg className="w-40 h-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-neutral-800 group-hover:text-violet-700 transition-colors">Crazy Games</h3>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Mainkan ribuan game gratis tanpa perlu diunduh. Tersedia game aksi, teka-teki, balapan, dan banyak lagi!
            </p>
          </div>
        </a>
      </div>
    </div>
  )
}
