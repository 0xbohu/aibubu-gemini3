'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Search, Filter, Users, Star, Clock, BookOpen } from 'lucide-react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

type MarketplaceTutorial = {
  id: string
  title: string
  description: string
  category: string
  difficulty_level: number
  created_at: string
  teacher_name: string
  teacher_id: string
  subscription_count: number
  is_subscribed: boolean
}

type PlayerData = {
  id: string
  username: string
  player_preferences: Record<string, any>
}

const KidCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-3xl shadow-lg border-4 border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 ${className}`}>
    {children}
  </div>
)

const KidButton = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  disabled = false
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "success" | "warning"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  className?: string
  disabled?: boolean
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white",
    secondary: "bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white",
    success: "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white",
    warning: "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white",
  }

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  return (
    <button
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-4 border-white/30 inline-flex items-center justify-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default function MarketplacePage() {
  const [user, setUser] = useState<User | null>(null)
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [tutorials, setTutorials] = useState<MarketplaceTutorial[]>([])
  const [filteredTutorials, setFilteredTutorials] = useState<MarketplaceTutorial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [subscribedTutorialTitle, setSubscribedTutorialTitle] = useState('')
  const router = useRouter()

  const categories = ['all', 'speaking', 'maths', 'thinking', 'science', 'reading', 'writing', 'agent']

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

      await loadTutorials(user.id)
    }

    initialize()
  }, [router])

  const loadTutorials = async (userId: string) => {
    try {
      // Get published custom tutorials
      const { data: tutorialsData, error } = await supabase
        .from('custom_tutorials')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tutorials:', error)
        setLoading(false)
        return
      }

      // Get teacher names and subscription info
      const tutorialsWithDetails = await Promise.all(
        (tutorialsData || []).map(async (tutorial) => {
          // Get teacher name
          const { data: teacherData } = await supabase
            .from('players')
            .select('username')
            .eq('id', tutorial.user_id)
            .single()

          // Get subscription count
          const { count: subCount } = await supabase
            .from('tutorial_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('custom_tutorial_id', tutorial.id)

          // Check if current user is subscribed
          const { data: subData } = await supabase
            .from('tutorial_subscriptions')
            .select('id')
            .eq('custom_tutorial_id', tutorial.id)
            .eq('player_id', userId)
            .single()

          return {
            id: tutorial.id,
            title: tutorial.title,
            description: tutorial.description,
            category: tutorial.category,
            difficulty_level: tutorial.difficulty_level,
            created_at: tutorial.created_at,
            teacher_name: teacherData?.username || 'Unknown Teacher',
            teacher_id: tutorial.user_id,
            subscription_count: subCount || 0,
            is_subscribed: !!subData
          }
        })
      )

      setTutorials(tutorialsWithDetails)
      setFilteredTutorials(tutorialsWithDetails)
      setLoading(false)
    } catch (error) {
      console.error('Error loading tutorials:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = tutorials

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.teacher_name.toLowerCase().includes(query)
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    setFilteredTutorials(filtered)
  }, [searchQuery, selectedCategory, tutorials])

  const handleSubscribe = async (tutorialId: string, tutorialTitle: string) => {
    if (!user) return

    setSubscribing(tutorialId)
    try {
      const { error } = await supabase
        .from('tutorial_subscriptions')
        .insert({
          player_id: user.id,
          custom_tutorial_id: tutorialId
        })

      if (error) {
        console.error('Error subscribing:', error)
        alert('Failed to subscribe. You may already be subscribed.')
      } else {
        // Reload tutorials to update subscription status
        await loadTutorials(user.id)
        setSubscribedTutorialTitle(tutorialTitle)
        setShowSuccessModal(true)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred while subscribing')
    } finally {
      setSubscribing(null)
    }
  }

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
            <p className="text-gray-600 font-bold">Loading marketplace...</p>
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

      <main className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-800 mb-2">
            🏪 Tutorial Marketplace
          </h1>
          <p className="text-gray-600 text-lg">
            Discover amazing tutorials created by teachers
          </p>
        </div>

        {/* Search and Filters */}
        <KidCard className="p-6 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tutorials, teachers, or topics..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-lg"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category === 'all' ? '🌟 All' : `${getCategoryEmoji(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}`}
                </button>
              ))}
            </div>
          </div>
        </KidCard>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 font-medium">
            {filteredTutorials.length} {filteredTutorials.length === 1 ? 'tutorial' : 'tutorials'} found
          </p>
        </div>

        {/* Tutorials Grid */}
        {filteredTutorials.length === 0 ? (
          <KidCard className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-3xl font-black text-gray-800 mb-4">
              No tutorials found
            </h2>
            <p className="text-gray-600 text-lg">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No published tutorials yet. Check back soon!'}
            </p>
          </KidCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map((tutorial) => (
              <KidCard key={tutorial.id} className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">
                    {getCategoryEmoji(tutorial.category)}
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border-2 ${getDifficultyColor(tutorial.difficulty_level)}`}>
                    {getDifficultyText(tutorial.difficulty_level)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                  {tutorial.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {tutorial.description}
                </p>

                {/* Teacher Info */}
                <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {tutorial.teacher_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{tutorial.teacher_name}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 pt-4 border-t-2 border-gray-100">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">{tutorial.subscription_count}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">
                      {new Date(tutorial.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {tutorial.is_subscribed ? (
                  <Link href="/dashboard">
                    <KidButton variant="success" size="md" className="w-full">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Start Learning
                    </KidButton>
                  </Link>
                ) : (
                  <KidButton
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={() => handleSubscribe(tutorial.id, tutorial.title)}
                    disabled={subscribing === tutorial.id}
                  >
                    {subscribing === tutorial.id ? 'Subscribing...' : 'Subscribe'}
                  </KidButton>
                )}
              </KidCard>
            ))}
          </div>
        )}
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <KidCard className="max-w-md w-full p-8 animate-bounce-in">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-gray-800 mb-2">
                  🎉 Subscribed!
                </h3>
                <p className="text-gray-600 text-lg mb-4">
                  You're now enrolled in
                </p>
                <p className="text-xl font-bold text-blue-600 mb-6">
                  "{subscribedTutorialTitle}"
                </p>
              </div>

              <div className="space-y-3">
                <KidButton
                  variant="success"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setShowSuccessModal(false)
                    router.push('/dashboard')
                  }}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </KidButton>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 font-bold rounded-full transition-colors"
                >
                  Keep Browsing
                </button>
              </div>
            </div>
          </KidCard>
        </div>
      )}
    </div>
  )
}
