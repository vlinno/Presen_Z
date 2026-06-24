'use client'

import Link from 'next/link'
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
    <div className="min-h-screen bg-gradient-subtle bg-pattern flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-100/40 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in-scale">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={logoTarget} className="inline-flex items-center gap-3 mb-3 hover:opacity-85 transition-opacity duration-200">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold text-primary-800 tracking-tight">
              Presen<span className="text-primary-500">Z</span>
            </span>
          </Link>
          <p className="text-sm text-neutral-500">
            Absensi Digital Magang — Kesbangpol Kota Banjarmasin
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
