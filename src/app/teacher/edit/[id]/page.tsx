'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { 
  ArrowLeft,
  Save,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import router from 'next/router'

type CustomTutorial = {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  difficulty_level: number
  is_published: boolean
  content_screens?: any
  questions?: any
}

type PlayerData = {
  id: string
  username: string
  player_preferences: Record<string, any>
}

const KidCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
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

export default function EditTutorialPage() {
  const params = useParams()
  const tutorialId = params.id as string
  const [user, setUser] = useState<User | null>(null)
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [tutorial, setTutorial] = useState<CustomTutorial | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [activeTab, setActiveTab] = useState<'content' | 'questions'>('content')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const router = useRouter()

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

      // Load tutorial
      const { data: tutorialData, error } = await supabase
        .from('custom_tutorials')
        .select('*')
        .eq('id', tutorialId)
        .eq('user_id', user.id)
        .single()

      if (error || !tutorialData) {
        console.error('Error loading tutorial:', error)
        router.push('/teacher/dashboard')
        return
      }

      setTutorial(tutorialData)
      setLoading(false)
    }

    initialize()
  }, [router, tutorialId])

  const generateWithAI = async () => {
    if (!aiPrompt.trim() || !tutorial) return

    setGenerating(true)

    try {
      const response = await fetch('/api/teacher/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          tutorialInfo: {
            title: tutorial.title,
            description: tutorial.description,
            category: tutorial.category,
            difficulty_level: tutorial.difficulty_level
          },
          generateType: activeTab
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data = await response.json()

      if (activeTab === 'content') {
        setTutorial({
          ...tutorial,
          content_screens: data.content_screens
        })
      } else {
        setTutorial({
          ...tutorial,
          questions: data.questions
        })
      }

      setAiPrompt('')
    } catch (error) {
      console.error('Error generating content:', error)
      alert('Failed to generate content. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!tutorial) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from('custom_tutorials')
        .update({
          content_screens: tutorial.content_screens,
          questions: tutorial.questions
        })
        .eq('id', tutorialId)

      if (error) {
        console.error('Error saving tutorial:', error)
        alert('Failed to save tutorial')
      } else {
        setShowSuccessModal(true)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = async () => {
    if (!tutorial) return

    // Validate before publishing
    if (!tutorial.is_published) {
      const hasContent = tutorial.content_screens?.screens?.length > 0
      const hasQuestions = tutorial.questions?.questions?.length > 0

      if (!hasContent || !hasQuestions) {
        alert('Please add at least one content screen and one question before publishing.')
        return
      }
    }

    setSaving(true)

    try {
      const { error } = await supabase
        .from('custom_tutorials')
        .update({ is_published: !tutorial.is_published })
        .eq('id', tutorialId)

      if (error) {
        console.error('Error toggling publish:', error)
        alert('Failed to update publish status')
      } else {
        setTutorial({ ...tutorial, is_published: !tutorial.is_published })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 flex items-center justify-center">
        <KidCard className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-bold">Loading tutorial...</p>
          </div>
        </KidCard>
      </div>
    )
  }

  if (!tutorial) return null

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

      <main className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/teacher/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-800 mb-2">
                ✏️ Edit Tutorial
              </h1>
              <p className="text-gray-600 text-lg">{tutorial.title}</p>
            </div>
            <div className="flex items-center space-x-3">
              <KidButton
                variant={tutorial.is_published ? "warning" : "success"}
                size="md"
                onClick={togglePublish}
                disabled={saving}
              >
                {tutorial.is_published ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Publish
                  </>
                )}
              </KidButton>
              <KidButton
                variant="primary"
                size="md"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </KidButton>
            </div>
          </div>
        </div>

        {/* AI Assistant */}
        <KidCard className="p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                🤖 AI Assistant
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Describe what you want to create, and I'll generate {activeTab === 'content' ? 'content screens' : 'questions'} for you!
              </p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && generateWithAI()}
                  placeholder={`e.g., "Create 3 ${activeTab === 'content' ? 'introduction screens about fractions' : 'pronunciation questions for greetings'}"`}
                  className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                  disabled={generating}
                />
                <KidButton
                  variant="secondary"
                  size="md"
                  onClick={generateWithAI}
                  disabled={generating || !aiPrompt.trim()}
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </KidButton>
              </div>
            </div>
          </div>
        </KidCard>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-3 rounded-t-2xl font-bold transition-all ${
              activeTab === 'content'
                ? 'bg-white text-blue-600 border-4 border-b-0 border-gray-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📄 Content Screens
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-3 rounded-t-2xl font-bold transition-all ${
              activeTab === 'questions'
                ? 'bg-white text-blue-600 border-4 border-b-0 border-gray-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ❓ Questions
          </button>
        </div>

        {/* Content Area */}
        <KidCard className="p-8">
          {activeTab === 'content' ? (
            <ContentScreensEditor
              screens={tutorial.content_screens?.screens || []}
              onChange={(screens) => setTutorial({
                ...tutorial,
                content_screens: { screens }
              })}
            />
          ) : (
            <QuestionsEditor
              questions={tutorial.questions?.questions || []}
              category={tutorial.category}
              onChange={(questions) => setTutorial({
                ...tutorial,
                questions: { questions }
              })}
            />
          )}
        </KidCard>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <KidCard className="max-w-md w-full p-8">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Save className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-black text-gray-800 mb-2">
                  ✅ Saved!
                </h3>
                <p className="text-gray-600 text-lg">
                  Your tutorial has been saved successfully
                </p>
              </div>

              <div className="space-y-3">
                <KidButton
                  variant="success"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setShowSuccessModal(false)
                    router.push('/teacher/dashboard')
                  }}
                >
                  Back to Dashboard
                </KidButton>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 font-bold rounded-full transition-colors"
                >
                  Continue Editing
                </button>
              </div>
            </div>
          </KidCard>
        </div>
      )}
    </div>
  )
}

// Content Screens Editor Component
function ContentScreensEditor({
  screens,
  onChange
}: {
  screens: any[]
  onChange: (screens: any[]) => void
}) {
  const addScreen = () => {
    onChange([...screens, {
      type: 'content',
      title: '',
      content: '',
      audio_enabled: false
    }])
  }

  const updateScreen = (index: number, field: string, value: any) => {
    const newScreens = [...screens]
    newScreens[index] = { ...newScreens[index], [field]: value }
    onChange(newScreens)
  }

  const removeScreen = (index: number) => {
    onChange(screens.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Content Screens</h3>
        <button
          onClick={addScreen}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Screen
        </button>
      </div>

      {screens.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">No content screens yet</p>
          <p className="text-sm">Use the AI assistant above or click "Add Screen" to get started</p>
        </div>
      ) : (
        screens.map((screen, index) => (
          <div key={index} className="border-2 border-gray-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-500">Screen {index + 1}</span>
              <button
                onClick={() => removeScreen(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
              <select
                value={screen.type}
                onChange={(e) => updateScreen(index, 'type', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
              >
                <option value="content">Content</option>
                <option value="instruction">Instruction</option>
                <option value="example">Example</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={screen.title}
                onChange={(e) => updateScreen(index, 'title', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                placeholder="Screen title"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
              <textarea
                value={screen.content}
                onChange={(e) => updateScreen(index, 'content', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                placeholder="Screen content"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={screen.audio_enabled || false}
                onChange={(e) => updateScreen(index, 'audio_enabled', e.target.checked)}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium text-gray-700">Enable audio for this screen</label>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// Questions Editor Component
function QuestionsEditor({
  questions,
  category,
  onChange
}: {
  questions: any[]
  category: string
  onChange: (questions: any[]) => void
}) {
  const addQuestion = () => {
    const newQuestion: any = {
      id: `q${questions.length + 1}`,
      type: category === 'speaking' ? 'pronunciation' : 'multiple_choice',
      instruction: ''
    }

    if (category === 'speaking') {
      newQuestion.phrase = ''
      newQuestion.language = 'en'
      newQuestion.phonetic = ''
    } else {
      newQuestion.question = ''
      newQuestion.options = ['', '', '', '']
      newQuestion.correct_answer = 0
    }

    onChange([...questions, newQuestion])
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    onChange(newQuestions)
  }

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Questions</h3>
        <button
          onClick={addQuestion}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">No questions yet</p>
          <p className="text-sm">Use the AI assistant above or click "Add Question" to get started</p>
        </div>
      ) : (
        questions.map((question, index) => (
          <div key={index} className="border-2 border-gray-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-500">Question {index + 1}</span>
              <button
                onClick={() => removeQuestion(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Instruction</label>
              <input
                type="text"
                value={question.instruction}
                onChange={(e) => updateQuestion(index, 'instruction', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                placeholder="What should the student do?"
              />
            </div>

            {question.type === 'pronunciation' ? (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phrase to Pronounce</label>
                  <input
                    type="text"
                    value={question.phrase}
                    onChange={(e) => updateQuestion(index, 'phrase', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                    placeholder="e.g., Hello, how are you?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phonetic (optional)</label>
                  <input
                    type="text"
                    value={question.phonetic || ''}
                    onChange={(e) => updateQuestion(index, 'phonetic', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                    placeholder="e.g., /həˈloʊ, haʊ ɑːr juː/"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Question</label>
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                    placeholder="Enter the question"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Answer Options</label>
                  {question.options?.map((option: string, optIndex: number) => (
                    <input
                      key={optIndex}
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...question.options]
                        newOptions[optIndex] = e.target.value
                        updateQuestion(index, 'options', newOptions)
                      }}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg mb-2"
                      placeholder={`Option ${optIndex + 1}`}
                    />
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Correct Answer</label>
                  <select
                    value={question.correct_answer}
                    onChange={(e) => updateQuestion(index, 'correct_answer', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                  >
                    {question.options?.map((_: any, optIndex: number) => (
                      <option key={optIndex} value={optIndex}>Option {optIndex + 1}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  )
}
