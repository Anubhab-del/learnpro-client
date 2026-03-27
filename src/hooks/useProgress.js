import { useState, useCallback } from 'react'
import api from '../services/api'

const STORAGE_KEY = 'learnpro_progress_anubhab'

function loadAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useProgress() {
  const [progressMap, setProgressMap] = useState(loadAll)

  const getEnrollments = useCallback(() => {
    const all = loadAll()
    return Object.entries(all).map(([courseId, data]) => ({ courseId, ...data }))
  }, [])

  const isEnrolled = useCallback((courseId) => !!loadAll()[courseId], [])

  const enroll = useCallback(async (courseId, totalLessons) => {
    const all = loadAll()
    if (!all[courseId]) {
      all[courseId] = {
        enrolledAt:       new Date().toISOString(),
        completedLessons: [],
        progress:         0,
        totalLessons,
        lastActivity:     new Date().toISOString(),
      }
      saveAll(all)
      setProgressMap({ ...all })

      /* Sync to backend silently — won't break if server is down */
      try { await api.post(`/enroll/${courseId}`) } catch (_) {}
    }
  }, [])

  const completeLesson = useCallback(async (courseId, lessonId, totalLessons) => {
    const all = loadAll()
    if (!all[courseId]) {
      all[courseId] = {
        enrolledAt:       new Date().toISOString(),
        completedLessons: [],
        progress:         0,
        totalLessons,
        lastActivity:     new Date().toISOString(),
      }
    }

    const entry = all[courseId]
    if (!entry.completedLessons.includes(lessonId)) {
      entry.completedLessons.push(lessonId)
    }

    const total    = totalLessons || entry.totalLessons || 1
    entry.progress = Math.round((entry.completedLessons.length / total) * 100)
    if (entry.progress === 100) entry.completedAt = new Date().toISOString()
    entry.lastActivity = new Date().toISOString()
    entry.totalLessons = total

    all[courseId] = entry
    saveAll(all)
    setProgressMap({ ...all })

    /* Sync to backend silently */
    try {
      await api.patch(`/progress/${courseId}`, {
        progress: entry.progress,
        lessonId,
      })
    } catch (_) {}

    return entry.progress
  }, [])

  const getCourseProgress  = useCallback((courseId) => loadAll()[courseId] || null, [progressMap])
  const isLessonCompleted  = useCallback((courseId, lessonId) =>
    loadAll()[courseId]?.completedLessons?.includes(lessonId) || false, [progressMap])

  return { progressMap, isEnrolled, enroll, completeLesson, getCourseProgress, isLessonCompleted, getEnrollments }
}