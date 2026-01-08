'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { 
  ArrowLeft,
  Save,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

type PlayerData = {
  id: string
  username: string
  total_points: number
  current_level: number
  player_preferences: Record<string, any>
}

type TutorialFormData = {
  title: string
  description: string
  category: string
  difficulty_level: number
  age_min: number
  age_max: number
  points_reward: number
  learning_objectives: string[]
}

const CATEGORIES = [
  { value: 'maths', label: '🔢 Mathematics', emoji: '🔢' },
  { value: 'thinking', label: '🧠 Thinking & Logic', emoji: '🧠' },
  { value: 'reading', label: '📖 Reading', emoji: '📖' },
  { value: 'writing', label: '✏️ Writing', emoji: '✏️' },
  { value: 'science', label: '🔬 Science', emoji: '🔬' },
  { value: 'speaking', label: '🗣️ Speaking', emoji: '🗣️' },
  { value: 'agent', label: '🤖 AI Agent', emoji: '🤖' }
]

const KidCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={`bg-white rounded-3xl shadow-lg border-4 border-gray-200 ${className}`}>
    {children}
  </div>
)

const KidButton = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  disabled = false,
  type = "button"
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "success" | "warning" | "danger"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  className?: string
  disabled?: boolean
  type?: "button" | "submit"
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white",
    secondary: "bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white",
    success: "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white",
    warning: "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white",
    danger: "bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white",
  }

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-4 border-white/30 inline-flex items-center justify-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default function CreateTutorialPage() {
  const [user, setUser] = useState<User | null>(null)
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const [formData, setFormData] = useState<TutorialFormData>({
    title: '',
    description: '',
    category: '',
    difficulty_level: 1,
    age_min: 5,
    age_max: 12,
    points_reward: 10,
    learning_objectives: ['']
  })

  useEffect(() => {
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)

      const { data: playerData } = await supabase
        .from('players')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (playerData) {
        setPlayer(playerData)
      }
      
      setLoading(false)
    }

    initialize()
  }, [router])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }

    if (formData.difficulty_level < 1 || formData.difficulty_level > 10) {
      newErrors.difficulty_level = 'Difficulty must be between 1 and 10'
    }

    if (formData.age_min < 1 || formData.age_min > 100) {
      newErrors.age_min = 'Minimum age must be between 1 and 100'
    }

    if (formData.age_max < formData.age_min) {
      newErrors.age_max = 'Maximum age must be greater than minimum age'
    }

    if (formData.points_reward < 0) {
      newErrors.points_reward = 'Points reward must be positive'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !user) {
      return
    }

    setSaving(true)

    try {
      // Filter out empty learning objectives
      const cleanedObjectives = formData.learning_objectives.filter(obj => obj.trim() !== '')

      const { data, error } = await supabase
        .from('custom_tutorials')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tutorial_type: formData.category as any,
          difficulty_level: formData.difficulty_level,
          age_min: formData.age_min,
          age_max: formData.age_max,
          points_reward: formData.points_reward,
          learning_objectives: cleanedObjectives,
          is_published: false,
          order_index: 0,
          max_generated_points: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating tutorial:', error)
        setErrors({ submit: 'Failed to create tutorial. Please try again.' })
        setSaving(false)
        return
      }

      // Redirect to edit page to add content screens and questions
      router.push(`/teacher/edit/${data.id}`)
    } catch (error) {
      console.error('Error:', error)
      setErrors({ submit: 'An unexpected error occurred' })
      setSaving(false)
    }
  }

  const addLearningObjective = () => {
    setFormData({
      ...formData,
      learning_objectives: [...formData.learning_objectives, '']
    })
  }

  const updateLearningObjective = (index: number, value: string) => {
    const newObjectives = [...formData.learning_objectives]
    newObjectives[index] = value
    setFormData({
      ...formData,
      learning_objectives: newObjectives
    })
  }

  const removeLearningObjective = (index: number) => {
    const newObjectives = formData.learning_objectives.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      learning_objectives: newObjectives.length > 0 ? newObjectives : ['']
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 flex items-center justify-center">
        <KidCard className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-bold">Loading...</p>
          </div>
        </KidCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100">
      {user && (
        <AppHeader
          user={user}
          player={player}
          showBackButton={true}
          showVoiceSettings={false}
        />
      )}

      <main className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/teacher/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-gray-800 mb-2">
            ✨ Create New Tutorial
          </h1>
          <p className="text-gray-600 text-lg">
            Fill in the basic information for your tutorial
          </p>
        </div>

        {/* Form */}
        <KidCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tutorial Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 ${
                  errors.title ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="e.g., Introduction to Fractions"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 ${
                  errors.description ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Describe what students will learn in this tutorial..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 ${
                  errors.category ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Difficulty Level (1-10) *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.difficulty_level}
                onChange={(e) => setFormData({ ...formData, difficulty_level: parseInt(e.target.value) })}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 ${
                  errors.difficulty_level ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.difficulty_level && (
                <p className="text-red-600 text-sm mt-1">{errors.difficulty_level}</p>
              )}
            </div>

            {/* Age Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Minimum Age *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.age_min}
                  onChange={(e) => setFormData({ ...formData, age_min: parseInt(e.target.value) })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 ${
                    errors.age_min ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.age_min && (
                  <p className="text-red-600 text-sm mt-1">{errors.age_min}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Maximum Age *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.age_max}
                  onChange={(e) => setFormData({ ...formData, age_max: parseInt(e.target.value) })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 ${
                    errors.age_max ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.age_max && (
                  <p className="text-red-600 text-sm mt-1">{errors.age_max}</p>
                )}
              </div>
            </div>

            {/* Points Reward */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Points Reward *
              </label>
              <input
                type="number"
                min="0"
                value={formData.points_reward}
                onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) })}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 ${
                  errors.points_reward ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.points_reward && (
                <p className="text-red-600 text-sm mt-1">{errors.points_reward}</p>
              )}
            </div>

            {/* Learning Objectives */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Learning Objectives
              </label>
              <div className="space-y-2">
                {formData.learning_objectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => updateLearningObjective(index, e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                      placeholder={`Objective ${index + 1}`}
                    />
                    {formData.learning_objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLearningObjective(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addLearningObjective}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Another Objective
              </button>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-4">
              <KidButton
                type="submit"
                variant="success"
                size="lg"
                disabled={saving}
                className="flex-1"
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Creating...' : 'Create Tutorial'}
              </KidButton>
              <KidButton
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => router.push('/teacher/dashboard')}
                disabled={saving}
              >
                Cancel
              </KidButton>
            </div>
          </form>
        </KidCard>
      </main>
    </div>
  )
}
