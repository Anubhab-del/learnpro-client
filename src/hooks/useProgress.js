import { useState, useCallback, useEffect } from 'react'
import api from '../services/api'

const KEY = 'lp_progress_v2'

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') }
  catch { return {} }
}

const save = data => localStorage.setItem(KEY, JSON.stringify(data))

export function useProgress() {
  const [tick, setTick] = useState(0)
  const bump = () => setTick(t => t + 1)

  useEffect(() => {
    const onStorage = (e) => { if (e.key === KEY) bump() }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const isEnrolled = useCallback((courseId) => !!load()[courseId], [tick])

  const getEnrollments = useCallback(() => {
    const all = load()
    return Object.entries(all).map(([courseId, data]) => ({ courseId, ...data }))
  }, [tick])

  const syncEnroll = useCallback(async (courseId, totalLessons) => {
    const all = load()
    if (!all[courseId]) {
      all[courseId] = {
        enrolledAt:       new Date().toISOString(),
        completedLessons: [],
        progress:         0,
        totalLessons,
        lastActivity:     new Date().toISOString(),
      }
      save(all)
      bump()
    }
    try { await api.post(`/enroll/${courseId}`) } catch (_) {}
  }, [])

  const completeLesson = useCallback(async (courseId, lessonId, totalLessons) => {
    const all   = load()
    const entry = all[courseId] || {
      enrolledAt:       new Date().toISOString(),
      completedLessons: [],
      progress:         0,
      totalLessons,
      lastActivity:     new Date().toISOString(),
    }

    if (!entry.completedLessons.includes(lessonId)) {
      entry.completedLessons.push(lessonId)
    }

    const total    = totalLessons || entry.totalLessons || 1
    entry.progress = Math.round((entry.completedLessons.length / total) * 100)
    if (entry.progress === 100) entry.completedAt = new Date().toISOString()
    entry.lastActivity = new Date().toISOString()
    entry.totalLessons = total

    all[courseId] = entry
    save(all)
    bump()

    try {
      await api.patch(`/progress/${courseId}`, { progress: entry.progress, lessonId })
    } catch (_) {}

    return entry.progress
  }, [])

  const getCourseProgress  = useCallback((courseId) => load()[courseId] || null, [tick])
  const isLessonCompleted  = useCallback((courseId, lessonId) =>
    load()[courseId]?.completedLessons?.includes(lessonId) || false, [tick])

  return { isEnrolled, getEnrollments, syncEnroll, completeLesson, getCourseProgress, isLessonCompleted }
}