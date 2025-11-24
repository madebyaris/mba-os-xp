import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Trash2,
  UploadCloud,
  Volume2,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { AppWindowProps } from '@/types/apps'

import styles from './MusicPlayer.module.css'

interface Track {
  id: string
  title: string
  artist: string
  duration: number
  src: string
}

const MusicPlayerApp = (_props: AppWindowProps) => {
  const [playlist, setPlaylist] = useLocalStorage<Track[]>('mba-playlist', [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [audioKey, setAudioKey] = useState(() => crypto.randomUUID())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)

  const currentTrack = playlist[currentIndex]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined
    const handleTimeUpdate = () => {
      if (!audio.duration) return
      setProgress(audio.currentTime / audio.duration)
    }
    const handleEnded = () => {
      handleNext()
    }
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  })

  useEffect(() => {
    if (!audioRef.current) return
    const audio = audioRef.current
    audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    audio.src = currentTrack.src
    setProgress(0)
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    }
  }, [currentTrack, isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined

    // Initialize AudioContext and analyser only once
    // Check if audio element is already connected by trying to create a source
    if (!audioContextRef.current) {
      try {
        const audioCtx = new AudioContext()
        const source = audioCtx.createMediaElementSource(audio)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64
        source.connect(analyser)
        analyser.connect(audioCtx.destination)
        
        analyserRef.current = analyser
        audioContextRef.current = audioCtx
        sourceNodeRef.current = source
      } catch (error) {
        // Audio element is already connected to another AudioContext
        // This can happen if the component was remounted
        // Skip visualization setup
        console.warn('Audio visualization unavailable - audio element already connected')
        return undefined
      }
    }

    const draw = () => {
      if (!canvasRef.current || !analyserRef.current) return
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyserRef.current.getByteFrequencyData(dataArray)
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0
      for (let i = 0; i < bufferLength; i += 1) {
        const barHeight = dataArray[i] / 2
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, '#8ab4ff')
        gradient.addColorStop(1, '#3a6cd5')
        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
        x += barWidth + 1
      }
      animationRef.current = requestAnimationFrame(draw)
    }
    
    if (analyserRef.current) {
      draw()
    }

    return () => {
      cancelAnimationFrame(animationRef.current ?? 0)
    }
  }, [])

  // Cleanup AudioContext on unmount and create new audio element key
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      if (audioContextRef.current) {
        // Disconnect source node before closing context
        if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.disconnect()
          } catch {
            // Ignore disconnect errors
          }
          sourceNodeRef.current = null
        }
        audioContextRef.current.close().catch(() => {
          // Ignore errors during cleanup
        })
        audioContextRef.current = null
        analyserRef.current = null
      }
      // Reset audio element to allow reconnection on next mount
      if (audioRef.current) {
        audioRef.current.src = ''
        audioRef.current.load()
      }
      // Generate new key for audio element on next mount
      setAudioKey(crypto.randomUUID())
    }
  }, [])

  const handlePlayPause = () => {
    if (!audioRef.current || !currentTrack) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
  }

  const handleNext = () => {
    setCurrentIndex((prev) => {
      if (!playlist.length) return 0
      return (prev + 1) % playlist.length
    })
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      if (!playlist.length) return 0
      return (prev - 1 + playlist.length) % playlist.length
    })
  }

  const handleVolumeChange = (value: number) => {
    const vol = Math.min(Math.max(value, 0), 1)
    setVolume(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol
    }
  }

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return
    const ratio = Number(event.target.value)
    audioRef.current.currentTime = ratio * audioRef.current.duration
    setProgress(ratio)
  }

  const handleFiles = async (files: FileList | File[]) => {
    const data = await Promise.all(
      Array.from(files).map(async (file) => {
        const src = await readFile(file)
        const duration = await getAudioDuration(src)
        return {
          id: crypto.randomUUID(),
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Local File',
          duration,
          src,
        } as Track
      }),
    )
    setPlaylist((prev) => [...prev, ...data])
    if (!currentTrack && data.length) {
      setCurrentIndex(0)
    }
  }

  const removeTrack = (id: string) => {
    setPlaylist((prev) => prev.filter((track) => track.id !== id))
    if (playlist[currentIndex]?.id === id) {
      setCurrentIndex(0)
      setIsPlaying(false)
    }
  }

  const moveTrack = (index: number, direction: -1 | 1) => {
    setPlaylist((prev) => {
      const copy = [...prev]
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= copy.length) return prev
      const [item] = copy.splice(index, 1)
      copy.splice(newIndex, 0, item)
      return copy
    })
    if (currentIndex === index) {
      setCurrentIndex(index + direction)
    }
  }

  const formattedDuration = useMemo(() => {
    if (!currentTrack?.duration) return '00:00'
    const mins = Math.floor(currentTrack.duration / 60)
    const secs = Math.floor(currentTrack.duration % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }, [currentTrack])

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div>
          <h3>Winamp Revival</h3>
          <p>{currentTrack ? currentTrack.title : 'No track loaded'}</p>
        </div>
        <label className={styles.uploadButton}>
          <UploadCloud size={18} /> Load Tracks
          <input type="file" accept="audio/*" multiple onChange={(event) => event.target.files && handleFiles(event.target.files)} hidden />
        </label>
      </header>
      <div className={styles.player}>
        <div className={styles.display}>
          <div>
            <span>{currentTrack?.title ?? 'Select a track'}</span>
            <small>{currentTrack ? `${formattedDuration}` : '00:00'}</small>
          </div>
          <input type="range" min={0} max={1} step={0.001} value={progress} onChange={handleSeek} />
        </div>
        <div className={styles.controls}>
          <button type="button" onClick={handlePrev}>
            <SkipBack size={18} />
          </button>
          <button type="button" className={styles.playButton} onClick={handlePlayPause} disabled={!currentTrack}>
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button type="button" onClick={handleNext}>
            <SkipForward size={18} />
          </button>
          <div className={styles.volume}>
            <Volume2 size={16} />
            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(event) => handleVolumeChange(Number(event.target.value))} />
          </div>
        </div>
        <canvas ref={canvasRef} width={400} height={120} className={styles.visualizer} />
      </div>
      <div
        className={styles.playlistDrop}
        onDragOver={(event) => {
          event.preventDefault()
        }}
        onDrop={(event) => {
          event.preventDefault()
          if (event.dataTransfer.files) {
            handleFiles(event.dataTransfer.files)
          }
        }}
      >
        <span>Drag & Drop audio files here</span>
      </div>
      <ul className={styles.playlist}>
        {playlist.map((track, index) => (
          <li key={track.id} className={index === currentIndex ? styles.trackActive : styles.trackItem} onClick={() => setCurrentIndex(index)}>
            <div>
              <strong>{track.title}</strong>
              <small>{track.artist}</small>
            </div>
            <div className={styles.trackActions}>
              <span>{formatDuration(track.duration)}</span>
              <button type="button" onClick={(event) => {
                event.stopPropagation()
                moveTrack(index, -1)
              }}>
                <ChevronUp size={14} />
              </button>
              <button type="button" onClick={(event) => {
                event.stopPropagation()
                moveTrack(index, 1)
              }}>
                <ChevronDown size={14} />
              </button>
              <button type="button" onClick={(event) => {
                event.stopPropagation()
                removeTrack(track.id)
              }}>
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <audio ref={audioRef} key={audioKey} hidden />
    </div>
  )
}

const readFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const getAudioDuration = (src: string) =>
  new Promise<number>((resolve) => {
    const audio = document.createElement('audio')
    audio.src = src
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration)
    })
  })

const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default MusicPlayerApp

