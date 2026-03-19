'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Workout } from '@/types'

interface FormData {
  date: string
  title: string
  format: string
  exercises: string
}

const PAGE_SIZE = 10

const TRAINING_GUIDE = [
  { title: 'ENGINE BUILDER', desc: '유산소 엔진 구축. 중저강도 장시간 유지.', example: '45분 Zone 2 런 / 로잉 20분 + 스키어그 20분' },
  { title: 'ZONE 2 RUN', desc: '대화 가능한 강도로 지방 연소 능력 향상.', example: '40~60분 편안한 페이스 런' },
  { title: 'THRESHOLD RUN', desc: '젖산 역치 강도에서 페이스 유지력 향상. Zone 4.', example: '20분 역치 페이스 런 x 2세트 / 휴식 3분' },
  { title: 'INTERVAL HELL', desc: '고강도 반복으로 스피드 향상. Zone 5.', example: '400m 전력 런 x 8 / 휴식 90초' },
  { title: 'VO2 MAX SESSION', desc: '최대 산소 섭취량 한계 도달 훈련.', example: '1km 전력 런 x 5 / 휴식 2분' },
  { title: 'TRANSITION KILLER', desc: '달리기→스테이션 즉시 전환 적응.', example: '200m 런 + 월볼 20개 x 6라운드' },
  { title: 'RACE PACE RUN', desc: '실전 레이스 페이스 적응 훈련.', example: '1km 레이스 페이스 x 6 / 휴식 2분' },
  { title: 'STATION DRILL', desc: '스테이션 동작 효율과 근지구력 향상.', example: '슬레드 푸시+풀 / 버피 브로드점프 / 월볼 각 3세트' },
  { title: 'HYROX SIM', desc: '실전과 동일한 구성으로 레이스 시뮬레이션.', example: '1km 런 + 스테이션 x 4~8라운드' },
  { title: 'LACTATE FLUSH', desc: '고강도 훈련 후 젖산 제거 회복 훈련.', example: '20~30분 아주 가벼운 조깅 또는 로잉' },
  { title: 'STRENGTH ENDURANCE', desc: '피로한 상태에서 스테이션 동작 반복. 근지구력.', example: '슬레드 + 케틀벨 스윙 + 월볼 x 5라운드' },
  { title: 'AEROBIC POWER', desc: '중강도 장시간 파워 유지.', example: '로잉 500m + 런 500m x 6 / 휴식 1분' },
  { title: 'BRICK SESSION', desc: '런+근력을 쉬지 않고 연속 수행.', example: '런 1km + 버피 20개 + 슬레드 푸시 x 4라운드' },
]

function TrainingGuide() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-8 border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex justify-between items-center px-5 py-4 bg-gray-900 hover:bg-gray-800 transition text-left"
      >
        <span className="font-bebas text-xl tracking-wider text-accent">훈련 가이드 (13종)</span>
        <span className="text-gray-400 text-lg">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="divide-y divide-gray-800">
          {TRAINING_GUIDE.map((t) => (
            <div key={t.title} className="px-5 py-4 bg-gray-900">
              <p className="font-bebas text-lg text-white tracking-wider mb-1">{t.title}</p>
              <p className="text-gray-400 text-sm mb-1">{t.desc}</p>
              <p className="text-gray-600 text-xs">예시: {t.example}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminPanel() {
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    title: '',
    format: '',
    exercises: '',
  })
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchWorkouts(1)
  }, [])

  const fetchWorkouts = async (targetPage: number) => {
    try {
      setLoading(true)
      const from = (targetPage - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error: err, count } = await supabase
        .from('workouts')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false })
        .range(from, to)

      if (err) throw err
      setWorkouts(data || [])
      setTotal(count || 0)
      setPage(targetPage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workouts')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage('')

    try {
      if (!formData.date || !formData.exercises.trim()) {
        setError('날짜와 운동 목록은 필수입니다')
        return
      }

      const exercisesArray = formData.exercises
        .split('\n')
        .map(line => line.trimEnd())

      if (editingId) {
        const { error: err } = await supabase
          .from('workouts')
          .update({
            date: formData.date,
            title: formData.title || null,
            format: formData.format || null,
            exercises: exercisesArray,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)

        if (err) throw err
        setSuccessMessage('운동이 수정되었습니다')
      } else {
        const { error: err } = await supabase
          .from('workouts')
          .insert({
            date: formData.date,
            title: formData.title || null,
            format: formData.format || null,
            exercises: exercisesArray,
          })

        if (err) throw err
        setSuccessMessage('운동이 추가되었습니다')
      }

      setFormData({
        date: new Date().toISOString().split('T')[0],
        title: '',
        format: '',
        exercises: '',
      })
      setEditingId(null)
      await fetchWorkouts(1)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err)
      if (msg.includes('duplicate key') || msg.includes('workouts_date_key')) {
        setError('해당 날짜에 이미 운동이 등록되어 있습니다. 날짜를 확인해주세요.')
      } else {
        setError(msg)
      }
    }
  }

  const handleEdit = (workout: Workout) => {
    setFormData({
      date: workout.date,
      title: workout.title || '',
      format: workout.format || '',
      exercises: workout.exercises.join('\n'),
    })
    setEditingId(workout.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return

    try {
      const { error: err } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)

      if (err) throw err
      setSuccessMessage('운동이 삭제되었습니다')
      await fetchWorkouts(page)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workout')
    }
  }

  const handleCancel = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      format: '',
      exercises: '',
    })
    setEditingId(null)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <main className="min-h-screen bg-dark p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-bebas text-4xl">운동 관리</h1>
          <a
            href="/"
            className="text-accent hover:text-yellow-400 text-sm underline"
          >
            공개 페이지 보기
          </a>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg mb-8 border border-gray-800">
          <h2 className="font-bebas text-2xl mb-6">
            {editingId ? '운동 수정' : '운동 추가'}
          </h2>

          {error && (
            <div className="bg-red-900 text-red-200 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-900 text-green-200 p-3 rounded mb-4 text-sm">
              {successMessage}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">날짜 *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">제목 (선택)</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="예: HYROX Simulation"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">포맷 (선택)</label>
              <input
                type="text"
                name="format"
                value={formData.format}
                onChange={handleInputChange}
                placeholder="예: For Time, AMRAP, EMOM"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">운동 목록 *</label>
              <p className="text-xs text-gray-400 mb-2">
                빈 줄로 그룹을 구분합니다 (엔터 2번)
              </p>
              <textarea
                name="exercises"
                value={formData.exercises}
                onChange={handleInputChange}
                placeholder={`5 Rounds for Time\n10 Thrusters (95/65 lb)\n15 Pull-ups\n\nRest 2:00\n\n10 Min AMRAP\n5 Burpees`}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent h-40 font-mono text-sm"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-accent text-dark font-bebas rounded hover:bg-yellow-400 disabled:opacity-50 transition"
              >
                {loading ? '저장 중...' : editingId ? '수정' : '추가'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-700 text-white font-bebas rounded hover:bg-gray-600 transition"
                >
                  취소
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Training Guide */}
        <TrainingGuide />

        {/* Workouts List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bebas text-2xl">저장된 운동</h2>
            {total > 0 && (
              <span className="text-gray-500 text-sm">총 {total}개</span>
            )}
          </div>

          {loading && <p className="text-gray-400">로드 중...</p>}

          {!loading && workouts.length === 0 && (
            <p className="text-gray-400">저장된 운동이 없습니다</p>
          )}

          <div className="space-y-4">
            {workouts.map(workout => (
              <div
                key={workout.id}
                className="bg-gray-900 p-4 rounded border border-gray-800 hover:border-gray-700 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm">{workout.date}</p>
                    {workout.title && (
                      <h3 className="font-bebas text-xl mb-1">{workout.title}</h3>
                    )}
                    {workout.format && (
                      <p className="text-accent text-sm mb-2">{workout.format}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(workout)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(workout.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-300 space-y-1 border-t border-gray-800 pt-3">
                  {workout.exercises.map((exercise, idx) => (
                    <p key={idx} className="empty:hidden">{exercise}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => fetchWorkouts(page - 1)}
                disabled={page === 1 || loading}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => fetchWorkouts(p)}
                  disabled={loading}
                  className={`px-4 py-2 rounded transition ${
                    p === page
                      ? 'bg-accent text-dark font-bebas'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => fetchWorkouts(page + 1)}
                disabled={page === totalPages || loading}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
