'use client'

import { useState } from 'react'
import Link from 'next/link'
import { register } from '@/app/actions/auth'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await register(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      window.location.href = '/dashboard'
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Buat Akun Baru</h1>
      <p className="text-sm text-neutral-500 mb-6">Daftarkan diri Anda untuk mulai absensi digital</p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="nama@email.com"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm transition-all duration-200"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Minimal 6 karakter"
              className="w-full pl-4 pr-11 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 active:scale-95 transition-all duration-200 focus:outline-none flex items-center justify-center"
            >
              <div className="relative w-5 h-5">
                {/* Eye Icon */}
                <svg
                  className={`absolute inset-0 w-5 h-5 transition-all duration-300 transform ${
                    showPassword ? 'opacity-0 scale-75 rotate-45 pointer-events-none' : 'opacity-100 scale-100 rotate-0'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                
                {/* EyeOff Icon */}
                <svg
                  className={`absolute inset-0 w-5 h-5 transition-all duration-300 transform ${
                    showPassword ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-45 pointer-events-none'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Konfirmasi Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              placeholder="Ulangi password"
              className="w-full pl-4 pr-11 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 active:scale-95 transition-all duration-200 focus:outline-none flex items-center justify-center"
            >
              <div className="relative w-5 h-5">
                {/* Eye Icon */}
                <svg
                  className={`absolute inset-0 w-5 h-5 transition-all duration-300 transform ${
                    showConfirmPassword ? 'opacity-0 scale-75 rotate-45 pointer-events-none' : 'opacity-100 scale-100 rotate-0'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                
                {/* EyeOff Icon */}
                <svg
                  className={`absolute inset-0 w-5 h-5 transition-all duration-300 transform ${
                    showConfirmPassword ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-45 pointer-events-none'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-primary text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Mendaftar...
            </>
          ) : (
            'Daftar Akun'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
          Masuk di sini
        </Link>
      </p>
    </>
  )
}
