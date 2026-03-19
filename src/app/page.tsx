'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Workout } from '@/types'
import WorkoutTemplate from '@/components/WorkoutTemplate'

const ARCHIVE_PAGE_SIZE = 5

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-')
  return `${year}.${month}.${day}`
}

export default function Home() {
  const [todayWorkouts, setTodayWorkouts] = useState<Workout[]>([])
  const [archiveWorkouts, setArchiveWorkouts] = useState<Workout[]>([])
  const [archiveTotal, setArchiveTotal] = useState(0)
  const [archivePage, setArchivePage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [templateWorkout, setTemplateWorkout] = useState<Workout | null>(null)

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      setError(null)
      const today = new Date().toLocaleDateString('en-CA')

      const { data: todayData, error: todayError } = await supabase
        .from('workouts')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: true })

      if (todayError) throw todayError
      setTodayWorkouts(todayData || [])

      const { data: archiveData, error: archiveError, count } = await supabase
        .from('workouts')
        .select('*', { count: 'exact' })
        .lt('date', today)
        .order('date', { ascending: false })
        .range(0, ARCHIVE_PAGE_SIZE - 1)

      if (archiveError) throw archiveError
      setArchiveWorkouts(archiveData || [])
      setArchiveTotal(count || 0)
      setArchivePage(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다')
    } finally {
      setLoading(false)
    }
  }

  const loadMoreArchive = async () => {
    try {
      setLoadingMore(true)
      const today = new Date().toLocaleDateString('en-CA')
      const nextPage = archivePage + 1
      const from = archivePage * ARCHIVE_PAGE_SIZE
      const to = from + ARCHIVE_PAGE_SIZE - 1

      const { data, error: err } = await supabase
        .from('workouts')
        .select('*')
        .lt('date', today)
        .order('date', { ascending: false })
        .range(from, to)

      if (err) throw err
      setArchiveWorkouts(prev => [...prev, ...(data || [])])
      setArchivePage(nextPage)
    } catch (err) {
      setError(err instanceof Error ? err.message : '불러오기 실패')
    } finally {
      setLoadingMore(false)
    }
  }

  const parseExercises = (exercisesStr: string[]) => {
    const groups: string[][] = [[]]
    for (const line of exercisesStr) {
      if (line.trim() === '') {
        if (groups[groups.length - 1].length > 0) {
          groups.push([])
        }
      } else {
        groups[groups.length - 1].push(line)
      }
    }
    return groups.filter(g => g.length > 0)
  }

  const highlightNumbers = (text: string) => {
    return text.split(/(\d+)/g).map((part, i) => {
      if (/^\d+$/.test(part)) {
        return (
          <span key={i} className="highlight-number">
            {part}
          </span>
        )
      }
      return part
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-dark p-4">
        <div className="text-center py-20 text-gray-400">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-dark text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b border-accent pb-4 flex items-center justify-between">
          <h1 className="font-bebas text-4xl tracking-wider">
            <span className="text-accent">HYROX</span> DAILY
          </h1>
          <img
            src="/lagom-symbol.png"
            alt="Lagom Training"
            style={{ height: '32px', filter: 'invert(1)', opacity: 0.25 }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-900 text-red-200 rounded text-sm">
            {error}
            <button
              onClick={fetchWorkouts}
              className="ml-4 underline hover:text-white"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Today's Workouts */}
        {todayWorkouts.length > 0 && (
          <section className="mb-20">
            <div className="mb-8">
              <h2 className="font-bebas text-3xl text-gray-400 mb-0">TODAY WORKOUT</h2>
              <span className="text-sm text-gray-500 block">
                {formatDate(new Date().toLocaleDateString('en-CA'))}
              </span>
            </div>
            {todayWorkouts.map((workout, idx) => (
              <div key={workout.id} className={idx > 0 ? 'border-t border-gray-700 pt-12 mt-12' : ''}>
                <div className="mb-8">
                  <button
                    onClick={() => setTemplateWorkout(workout)}
                    className="mb-6 px-4 py-2 border border-gray-700 text-gray-400 text-sm rounded hover:border-accent hover:text-accent transition"
                  >
                    SHARE YOUR WORKOUT
                  </button>
                  {workout.title && (
                    <h1 className="font-bebas text-6xl mb-4 leading-tight break-words">
                      {workout.title}
                    </h1>
                  )}
                  {workout.format && (
                    <p className="text-2xl text-accent font-bebas mb-6">
                      {workout.format}
                    </p>
                  )}
                </div>
                <div className="space-y-8">
                  {parseExercises(workout.exercises).map((group, groupIdx) => (
                    <div key={groupIdx} className="border-l-4 border-accent pl-6">
                      {group.map((exercise, exIdx) => (
                        <p key={exIdx} className="text-lg mb-2 leading-relaxed">
                          {highlightNumbers(exercise)}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* No workout today */}
        {todayWorkouts.length === 0 && !error && (
          <section className="mb-20 text-center py-16 border border-gray-800 rounded-lg">
            <p className="font-bebas text-4xl text-gray-500 mb-2">REST DAY</p>
            <p className="text-gray-600 text-sm">쉬는것도 훈련 입니다</p>
          </section>
        )}

        {/* Archive */}
        {archiveWorkouts.length > 0 && (
          <section>
            <h2 className="font-bebas text-3xl mb-8 text-gray-400 border-t border-gray-700 pt-8">
              ARCHIVE
            </h2>
            <div className="space-y-12">
              {archiveWorkouts.map(workout => (
                <article key={workout.id} className="pb-8 border-b border-gray-800">
                  <div className="mb-4">
                    <p className="text-gray-500 text-sm mb-2">
                      {formatDate(workout.date)}
                    </p>
                    {workout.title && (
                      <h3 className="font-bebas text-2xl mb-2">
                        {workout.title}
                      </h3>
                    )}
                    {workout.format && (
                      <p className="text-accent text-sm mb-4">
                        {workout.format}
                      </p>
                    )}
                  </div>
                  <div className="space-y-4 text-sm">
                    {parseExercises(workout.exercises).map((group, idx) => (
                      <div key={idx} className="border-l border-gray-600 pl-3">
                        {group.map((exercise, exIdx) => (
                          <p key={exIdx} className="text-gray-300 mb-1">
                            {highlightNumbers(exercise)}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            {archiveWorkouts.length < archiveTotal && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreArchive}
                  disabled={loadingMore}
                  className="px-8 py-3 border border-gray-600 text-gray-400 font-bebas text-lg rounded hover:border-gray-400 hover:text-white transition disabled:opacity-50"
                >
                  {loadingMore ? '로딩...' : `더 보기 (${archiveTotal - archiveWorkouts.length}개 남음)`}
                </button>
              </div>
            )}
          </section>
        )}
        {/* Template modal */}
        {templateWorkout && (
          <WorkoutTemplate
            workout={templateWorkout}
            onClose={() => setTemplateWorkout(null)}
          />
        )}

        {/* Watermark */}
        <div className="mt-24 mb-4 flex justify-center">
          <img
            src="/lagom-logo.png"
            alt="Lagom Training"
            style={{ height: '18px', filter: 'invert(1)', opacity: 0.2 }}
          />
        </div>
      </div>
    </main>
  )
}
