'use client'

import { useState, useEffect } from 'react'
import AdminPanel from '@/components/AdminPanel'
import { supabase } from '@/lib/supabase'

const PASSWORD_KEY = 'admin_password'

async function checkPassword(password: string) {
  const { data, error } = await supabase.rpc('admin_check_password', { p_password: password })
  if (error) throw error
  return data === true
}

export default function AdminPage() {
  const [adminPassword, setAdminPassword] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const saved = sessionStorage.getItem(PASSWORD_KEY)
    if (!saved) {
      setChecking(false)
      return
    }
    checkPassword(saved)
      .then(ok => {
        if (ok) setAdminPassword(saved)
        else sessionStorage.removeItem(PASSWORD_KEY)
      })
      .catch(() => sessionStorage.removeItem(PASSWORD_KEY))
      .finally(() => setChecking(false))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (await checkPassword(password)) {
        sessionStorage.setItem(PASSWORD_KEY, password)
        setAdminPassword(password)
        setError('')
      } else {
        setError('비밀번호가 틀렸습니다')
        setPassword('')
      }
    } catch (err) {
      const message = (err as { message?: string })?.message
      setError(message ? `로그인 확인에 실패했습니다: ${message}` : '로그인 확인에 실패했습니다')
    }
  }

  if (checking) return null

  if (!adminPassword) {
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

  return <AdminPanel adminPassword={adminPassword} />
}
