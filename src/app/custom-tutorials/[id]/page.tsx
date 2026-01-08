'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { ArrowLeft, Volume2, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

type CustomTutorial = {
  id: string
  title: string
  description: string
  category: string
  difficulty_level: number
  content_screens: any
  questions: any
  points_reward: number
  user_id: string
}

type PlayerData = {
  id: string
  username: string
  player_preferences: Record<string, any>
  total_points?: number
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
  disabled = false
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "success"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  className?: string
  disabled?: boolean
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white",
    secondary: "bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white",
    success: "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white",
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

export default function CustomTutorialPage() {
  const params = useParams()
  const tutorialId = params.id as string
  const [user, setUser] = useState<User | null>(null)
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [tutorial, setTutorial] = useState<CustomTutorial | null>(null)
  const [teacherVoiceId, setTeacherVoiceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentScreen, setCurrentScreen] = useState(0)
  const [showingQuestions, setShowingQuestions] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [completed, setCompleted] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
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

      // Load custom tutorial
      const { data: tutorialData, error } = await supabase
        .from('custom_tutorials')
        .select('*')
        .eq('id', tutorialId)
        .single()

      if (error || !tutorialData) {
        console.error('Error loading tutorial:', error)
        router.push('/dashboard')
        return
      }

      // Check if user is subscribed
      const { data: subData } = await supabase
        .from('tutorial_subscriptions')
        .select('id')
        .eq('custom_tutorial_id', tutorialId)
        .eq('player_id', user.id)
        .single()

      if (!subData) {
        alert('You need to subscribe to this tutorial first!')
        router.push('/marketplace')
        return
      }

      // Get teacher's voice ID
      const { data: teacherData } = await supabase
        .from('players')
        .select('player_preferences')
        .eq('id', tutorialData.user_id)
        .single()

      if (teacherData?.player_preferences?.teacher_voice_id) {
        setTeacherVoiceId(teacherData.player_preferences.teacher_voice_id)
      }

      setTutorial(tutorialData)
      setLoading(false)
    }

    initialize()
  }, [router, tutorialId])

  const playAudio = async (text: string) => {
    if (isPlayingAudio) return
    
    console.log('Playing audio with text:', text)
    console.log('Using teacher voice ID:', teacherVoiceId)
    
    setIsPlayingAudio(true)
    try {
      const response = await fetch('/api/elevenlabs-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice_id: teacherVoiceId || undefined // Use teacher's voice if available
        })
      })

      console.log('API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error:', errorText)
        alert('Failed to play audio. Check console for details.')
        setIsPlayingAudio(false)
        return
      }

      const data = await response.json()
      console.log('API response:', data)

      if (!data.audio_data) {
        console.error('No audio data in response')
        setIsPlayingAudio(false)
        return
      }

      // Convert base64 to blob
      const binaryString = atob(data.audio_data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const audioBlob = new Blob([bytes], { type: data.content_type || 'audio/mpeg' })
      console.log('Audio blob size:', audioBlob.size)
      
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      audio.onended = () => {
        console.log('Audio playback ended')
        setIsPlayingAudio(false)
      }
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e)
        setIsPlayingAudio(false)
      }
      
      await audio.play()
      console.log('Audio playing...')
    } catch (error) {
      console.error('Error playing audio:', error)
      alert('Error playing audio: ' + (error as Error).message)
      setIsPlayingAudio(false)
    }
  }

  const handleNextScreen = () => {
    if (!tutorial) return

    const screens = tutorial.content_screens?.screens || []
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1)
    } else {
      setShowingQuestions(true)
    }
  }

  const handlePreviousScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (!tutorial) return
    
    const questions = tutorial.questions?.questions || []
    const question = questions[currentQuestion]
    
    setSelectedAnswer(answerIndex)
    const correct = answerIndex === question.correct_answer
    setIsCorrect(correct)
  }

  const handleNextQuestion = async () => {
    if (!tutorial || !user) return

    const questions = tutorial.questions?.questions || []
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
    } else {
      // Tutorial completed
      await supabase
        .from('player_progress')
        .upsert({
          player_id: user.id,
          tutorial_id: tutorialId,
          status: 'completed',
          points_earned: tutorial.points_reward,
          completed_at: new Date().toISOString()
        })

      // Update player points
      if (player) {
        await supabase
          .from('players')
          .update({
            total_points: (player.total_points || 0) + tutorial.points_reward
          })
          .eq('id', user.id)
      }

      setCompleted(true)
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

  const screens = tutorial.content_screens?.screens || []
  const questions = tutorial.questions?.questions || []

  if (completed) {
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

        <main className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[80vh]">
          <KidCard className="p-12 text-center">
            <div className="text-8xl mb-6 animate-bounce">🎉</div>
            <h1 className="text-4xl font-black text-gray-800 mb-4">
              Tutorial Complete!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              You earned {tutorial.points_reward} points!
            </p>
            <KidButton
              variant="success"
              size="lg"
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </KidButton>
          </KidCard>
        </main>
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
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4 font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-5xl font-black text-gray-800 mb-2">
            {tutorial.title}
          </h1>
          <p className="text-gray-600 text-xl">{tutorial.description}</p>
        </div>

        {/* Content */}
        <KidCard className="p-8">
          {!showingQuestions ? (
            // Content Screens
            <>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-gray-500">
                    Screen {currentScreen + 1} of {screens.length}
                  </span>
                  {/* Listen Button - Top Right */}
                  <button
                    onClick={() => {
                      const screen = screens[currentScreen]
                      const textToSpeak = `${screen?.title}. ${screen?.content}`
                      playAudio(textToSpeak)
                    }}
                    disabled={isPlayingAudio}
                    className={`inline-flex items-center px-4 py-2 rounded-full font-bold text-sm shadow-md transition-all ${
                      isPlayingAudio
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-purple-600 border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg'
                    } disabled:opacity-50`}
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {isPlayingAudio ? 'Playing...' : 'Listen'}
                  </button>
                </div>

                <h2 className="text-4xl font-black text-gray-800 mb-6">
                  {screens[currentScreen]?.title}
                </h2>
                <p className="text-2xl text-gray-700 leading-relaxed">
                  {screens[currentScreen]?.content}
                </p>
              </div>

              {currentScreen === screens.length - 1 ? (
                // Last screen - show centered "Let's Start" button with XP
                <div className="flex flex-col items-center space-y-4">
                  <KidButton
                    variant="success"
                    size="lg"
                    onClick={handleNextScreen}
                    className="px-12"
                  >
                    Let's Start! 🚀
                  </KidButton>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Complete this tutorial to earn</p>
                    <p className="text-2xl font-black text-yellow-600">+{tutorial.points_reward} XP</p>
                  </div>
                </div>
              ) : (
                // Navigation buttons
                <div className="flex justify-between">
                  {currentScreen > 0 ? (
                    <KidButton
                      variant="secondary"
                      size="lg"
                      onClick={handlePreviousScreen}
                    >
                      Previous
                    </KidButton>
                  ) : (
                    <div></div>
                  )}
                  <KidButton
                    variant="primary"
                    size="lg"
                    onClick={handleNextScreen}
                  >
                    Next
                  </KidButton>
                </div>
              )}
            </>
          ) : (
            // Questions
            <>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-gray-500">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-8">
                  {questions[currentQuestion]?.question}
                </h2>

                <div className="space-y-4">
                  {questions[currentQuestion]?.options?.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-6 text-left text-xl rounded-2xl border-4 font-bold transition-all ${
                        selectedAnswer === index
                          ? isCorrect
                            ? 'bg-green-100 border-green-500 text-green-800'
                            : 'bg-red-100 border-red-500 text-red-800'
                          : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-lg text-gray-800'
                      } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-102'}`}
                    >
                      <div className="flex items-center">
                        {selectedAnswer === index && (
                          <span className="mr-3">
                            {isCorrect ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                          </span>
                        )}
                        {option}
                      </div>
                    </button>
                  ))}
                </div>

                {isCorrect !== null && (
                  <div className={`mt-6 p-6 rounded-2xl ${isCorrect ? 'bg-green-100 border-4 border-green-300' : 'bg-red-100 border-4 border-red-300'}`}>
                    <p className={`font-black text-xl ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? '✅ Correct! Great job!' : '❌ Not quite right. Try again next time!'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <KidButton
                  variant={isCorrect ? 'success' : 'primary'}
                  size="lg"
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === null}
                >
                  {currentQuestion === questions.length - 1 ? 'Finish Tutorial' : 'Next Question'}
                </KidButton>
              </div>
            </>
          )}
        </KidCard>
      </main>
    </div>
  )
}
