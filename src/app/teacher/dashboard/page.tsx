'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { 
  Plus,
  Edit,
  Eye,
  EyeOff,
  Users,
  CheckCircle,
  Clock,
  Trash2,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import VoiceRecorder from '@/components/VoiceRecorder'

type CustomTutorial = {
  id: string
  title: string
  description: string
  category: string
  difficulty_level: number
  is_published: boolean
  created_at: string
  subscription_count?: number
  completion_count?: number
}

type PlayerData = {
  id: string
  username: string
  total_points: number
  current_level: number
  player_preferences: Record<string, any>
}

// UI Components matching the app style
const KidCard = ({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) => (
  <div
    className={`bg-white rounded-3xl shadow-lg border-4 border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
)

const KidButton = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  href,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "success" | "warning" | "danger"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  className?: string
  href?: string
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

  const buttonClasses = `${variants[variant]} ${sizes[size]} font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-4 border-white/30 inline-flex items-center justify-center whitespace-nowrap ${className}`

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {children}
      </Link>
    )
  }

  return (
    <button className={buttonClasses} onClick={onClick}>
      {children}
    </button>
  )
}

export default function TeacherDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [tutorials, setTutorials] = useState<CustomTutorial[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)

      // Get player data
      const { data: playerData } = await supabase
        .from('players')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (playerData) {
        setPlayer(playerData)
      }

      // Get custom tutorials created by this teacher
      const { data: tutorialsData, error } = await supabase
        .from('custom_tutorials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching tutorials:', error)
      } else if (tutorialsData) {
        // Get subscription counts for each tutorial
        const tutorialsWithCounts = await Promise.all(
          tutorialsData.map(async (tutorial) => {
            const { count: subCount } = await supabase
              .from('tutorial_subscriptions')
              .select('*', { count: 'exact', head: true })
              .eq('custom_tutorial_id', tutorial.id)
            
            return {
              ...tutorial,
              subscription_count: subCount || 0
            }
          })
        )
        setTutorials(tutorialsWithCounts)
      }
      
      setLoading(false)
    }

    initialize()
  }, [router])

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      speaking: '🗣️',
      maths: '🔢',
      thinking: '🧠',
      science: '🔬',
      reading: '📖',
      writing: '✏️',
      agent: '🤖'
    }
    return emojiMap[category] || '📚'
  }

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return 'bg-green-100 text-green-800 border-green-300'
    if (level <= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  const getDifficultyText = (level: number) => {
    if (level <= 2) return 'Beginner'
    if (level <= 4) return 'Intermediate'
    return 'Advanced'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 flex items-center justify-center">
        <KidCard className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-bold">Loading your tutorials...</p>
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
          showBackButton={false}
          showVoiceSettings={false}
        />
      )}

      <main className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-800 mb-2">
            👨‍🏫 Teacher Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Create and manage your custom tutorials
          </p>
        </div>

        {/* Voice Settings Section */}
        <KidCard className="p-6 mb-8">
          <VoiceSettings user={user} player={player} />
        </KidCard>

        {/* Create Tutorial Button */}
        <div className="mb-8">
          <KidButton
            variant="success"
            size="lg"
            href="/teacher/create"
            className="w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Tutorial
          </KidButton>
        </div>

        {/* Tutorials List */}
        {tutorials.length === 0 ? (
          <KidCard className="p-12 text-center border-dashed">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-3xl font-black text-gray-800 mb-4">
              No tutorials yet
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Create your first tutorial to share your knowledge with students!
            </p>
            <KidButton
              variant="primary"
              size="lg"
              href="/teacher/create"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Tutorial
            </KidButton>
          </KidCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => (
              <KidCard key={tutorial.id} className="p-6 cursor-pointer hover:scale-105">
                <Link href={`/teacher/edit/${tutorial.id}`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">
                      {getCategoryEmoji(tutorial.category)}
                    </div>
                    <div className="flex items-center space-x-2">
                      {tutorial.is_published ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border-2 border-green-300">
                          <Eye className="w-3 h-3 mr-1" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border-2 border-gray-300">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {tutorial.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {tutorial.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border-2 ${getDifficultyColor(tutorial.difficulty_level)}`}>
                      {getDifficultyText(tutorial.difficulty_level)}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border-2 border-blue-300 capitalize">
                      {tutorial.category}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {tutorial.subscription_count || 0}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">
                        {new Date(tutorial.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              </KidCard>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// Voice Settings Component
function VoiceSettings({
  user,
  player
}: {
  user: User | null
  player: PlayerData | null
}) {
  const [showRecorder, setShowRecorder] = useState(false)
  const currentVoiceId = player?.player_preferences?.teacher_voice_id

  const handleVoiceCreated = async (voiceData: any) => {
    if (!user) return

    try {
      const currentPrefs = player?.player_preferences || {}
      
      const updatedPrefs = {
        ...currentPrefs,
        teacher_voice_id: voiceData.voice_id
      }

      const { error } = await supabase
        .from('players')
        .update({ player_preferences: updatedPrefs })
        .eq('id', user.id)

      if (error) {
        console.error('Error saving voice:', error)
        alert('Failed to save voice settings')
      } else {
        alert('✅ Voice saved! This voice will be used for all your tutorials.')
        window.location.reload()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred while saving voice')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">🎤</div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Your Teaching Voice</h3>
            <p className="text-gray-600 text-sm">
              {currentVoiceId 
                ? 'Your custom voice is active for all tutorials' 
                : 'Record your voice once - it will be used for all your tutorials'}
            </p>
          </div>
        </div>
        {currentVoiceId && !showRecorder && (
          <KidButton
            variant="secondary"
            size="sm"
            onClick={() => setShowRecorder(true)}
          >
            Update Voice
          </KidButton>
        )}
      </div>

      {currentVoiceId && !showRecorder ? (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <p className="text-green-800 font-medium">
            ✅ Custom voice is active
          </p>
          <p className="text-green-700 text-sm mt-1">
            Voice ID: {currentVoiceId}
          </p>
          <p className="text-green-700 text-sm mt-2">
            All your tutorials will use this voice for text-to-speech. Click "Update Voice" to record a new one.
          </p>
        </div>
      ) : (
        <>
          {currentVoiceId && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 font-medium">
                ⚠️ Updating your voice
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                Recording a new voice will replace your current voice for all tutorials.
              </p>
              <button
                onClick={() => setShowRecorder(false)}
                className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
              >
                Cancel and keep current voice
              </button>
            </div>
          )}
          
          <VoiceRecorder
            onVoiceCreated={handleVoiceCreated}
            teacherId={user?.id || ''}
          />

          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <h4 className="font-bold text-blue-800 mb-2">ℹ️ How it works</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Record a voice sample (at least 30 seconds recommended)</li>
              <li>• Your voice will be cloned using AI technology</li>
              <li>• All your tutorials will automatically use your voice</li>
              <li>• Students will hear your personalized voice when learning</li>
              <li>• You can only have one custom voice at a time</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
