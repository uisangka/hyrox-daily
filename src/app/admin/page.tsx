'use client'

import { useState, useEffect } from 'react'
import AdminPanel from '@/components/AdminPanel'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true)
    }
    setChecking(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin'

    if (password === adminPassword) {
      sessionStorage.setItem('admin_auth', 'true')
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('비밀번호가 틀렸습니다')
      setPassword('')
    }
  }

  if (checking) return null

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="font-bebas text-4xl mb-8 text-center">ADMIN</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                autoFocus
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-accent text-dark font-bebas text-lg py-3 rounded hover:bg-yellow-400 transition"
            >
              입장
            </button>
          </form>
        </div>
      </main>
    )
  }

  return <AdminPanel />
}
