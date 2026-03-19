export interface Workout {
  id: string
  date: string
  title?: string
  format?: string
  exercises: string[]
  createdAt: string
  updatedAt: string
}

export interface WorkoutGroup {
  exercises: string[]
}
