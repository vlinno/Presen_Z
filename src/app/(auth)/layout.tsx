'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname()
  const isLoginPageAdmin = pathname === '/admin/login'
  const logoTarget = isLoginPageAdmin ? '/login' : '/admin/login'

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6"
      style={{
        background: '#fafafa',
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%),
          radial-gradient(ellipse at 100% 100%, rgba(6,182,212,0.04) 0%, transparent 50%)
        `,
      }}>

      {/* ── Subtle dot-grid pattern ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.35,
        }} />

      {/* ── Back button ── */}
      <div className="fixed top-5 left-5 z-20 animate-fade-in">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 group"
          style={{ color: '#6b7280', border: '1px solid #e5e7eb', background: 'white' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="group-hover:-translate-x-0.5 transition-transform duration-200">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Kembali
        </Link>
      </div>

      {/* ── Center container ── */}
      <div className="w-full max-w-sm animate-fade-in-scale">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <Link href={logoTarget} className="flex items-center gap-3 group">
            <Image
              src="/logo-kesbangpol.png"
              alt="Logo Kesbangpol"
              width={42}
              height={42}
              className="object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              Presen<span style={{ color: '#4f46e5' }}>Z</span>
            </span>
          </Link>
          <p className="text-[11px] text-gray-400 font-medium mt-1.5">
            Absensi Digital Magang — Kesbangpol Kota Banjarmasin
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7 sm:p-8"
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.04)',
          }}
        >
          {children}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs mt-6 text-gray-400">
          Sistem Absensi Digital Mahasiswa Magang
        </p>
      </div>
    </div>
  )
}
