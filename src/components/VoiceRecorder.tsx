'use client'

import { useState, useRef } from 'react'
import { Mic, Square, Play, Pause, Upload, Loader2 } from 'lucide-react'

interface VoiceRecorderProps {
  onVoiceCreated: (voiceData: any) => void
  teacherId: string
}

export default function VoiceRecorder({ onVoiceCreated, teacherId }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [voiceName, setVoiceName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setError('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const uploadVoice = async () => {
    if (!audioBlob || !voiceName.trim()) {
      setError('Please provide a name for your voice')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'voice-recording.wav')
      formData.append('name', voiceName)
      formData.append('description', `Custom voice for ${voiceName}`)

      const response = await fetch('/api/elevenlabs-voice-clone', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create voice')
      }

      const data = await response.json()
      
      // Call the callback with the voice data
      onVoiceCreated(data.voice_data)

      // Reset form
      setAudioBlob(null)
      setAudioUrl(null)
      setVoiceName('')
      setDuration(0)
    } catch (err: any) {
      console.error('Error uploading voice:', err)
      setError(err.message || 'Failed to create custom voice')
    } finally {
      setUploading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <audio
        ref={audioRef}
        src={audioUrl || ''}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Recording Controls */}
      <div className="flex flex-col items-center space-y-4">
        {!audioBlob ? (
          <>
            <div className="relative">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white shadow-lg`}
              >
                {isRecording ? (
                  <Square className="w-10 h-10" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </button>
              {isRecording && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-red-600 font-bold">
                  {formatDuration(duration)}
                </div>
              )}
            </div>
            <p className="text-gray-600 text-center">
              {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
            </p>
            <p className="text-sm text-gray-500 text-center max-w-md">
              💡 Tip: Record at least 30 seconds of clear speech in a quiet environment for best results
            </p>
          </>
        ) : (
          <>
            {/* Playback Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={isPlaying ? pauseAudio : playAudio}
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </button>
              <div>
                <p className="font-bold text-gray-800">Recording ready!</p>
                <p className="text-sm text-gray-600">Duration: {formatDuration(duration)}</p>
              </div>
            </div>

            {/* Voice Name Input */}
            <div className="w-full max-w-md">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Voice Name *
              </label>
              <input
                type="text"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                placeholder="e.g., Teacher Sarah"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="w-full max-w-md bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={uploadVoice}
                disabled={uploading || !voiceName.trim()}
                className="px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-4 border-white/30 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Voice...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Create Custom Voice
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setAudioBlob(null)
                  setAudioUrl(null)
                  setVoiceName('')
                  setDuration(0)
                  setError(null)
                }}
                disabled={uploading}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Re-record
              </button>
            </div>
          </>
        )}
      </div>

      {/* Instructions */}
      {!audioBlob && !isRecording && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <h4 className="font-bold text-blue-800 mb-2">📝 Recording Tips:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Find a quiet place with minimal background noise</li>
            <li>• Speak clearly and naturally</li>
            <li>• Record at least 30 seconds (1-2 minutes is ideal)</li>
            <li>• Read a short passage or describe your teaching style</li>
            <li>• Avoid long pauses or silence</li>
          </ul>
        </div>
      )}
    </div>
  )
}
