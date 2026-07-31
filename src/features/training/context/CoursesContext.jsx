import { createContext, useContext, useState, useEffect } from 'react'
import { courses as seedCourses } from '../data/courses'

const CoursesContext = createContext(null)
const STORAGE_KEY = 'lidessa_catalog_courses'

export function CoursesProvider({ children }) {
  const [courses, setCourses] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : seedCourses
    } catch {
      return seedCourses
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
  }, [courses])

  function addCourse(data) {
    const course = { id: Date.now(), ...data }
    setCourses(prev => [course, ...prev])
    return course
  }

  function updateCourse(id, data) {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  }

  function deleteCourse(id) {
    setCourses(prev => prev.filter(c => c.id !== id))
  }

  return (
    <CoursesContext.Provider value={{ courses, addCourse, updateCourse, deleteCourse }}>
      {children}
    </CoursesContext.Provider>
  )
}

export function useCourses() {
  const ctx = useContext(CoursesContext)
  if (!ctx) throw new Error('useCourses must be used inside CoursesProvider')
  return ctx
}
