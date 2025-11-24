type SoundType = 'open' | 'close' | 'notification'

let audioCtx: AudioContext | null = null

const ensureContext = () => {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioCtx = new Ctor()
  }
  return audioCtx
}

export const playSound = async (type: SoundType) => {
  const ctx = ensureContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  const frequencies: Record<SoundType, number> = {
    open: 660,
    close: 440,
    notification: 880,
  }
  oscillator.type = 'sine'
  oscillator.frequency.value = frequencies[type]
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  gain.gain.setValueAtTime(0.2, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
  oscillator.start()
  oscillator.stop(ctx.currentTime + 0.25)
}

