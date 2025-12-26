// Import all audio files
import audio1 from '/src/audios/videoplayback (1).weba?url'
import audio2 from '/src/audios/videoplayback (2).weba?url'
import audio3 from '/src/audios/videoplayback (3).weba?url'
import audio4 from '/src/audios/videoplayback (4).weba?url'
import audio5 from '/src/audios/videoplayback (5).weba?url'
import audio6 from '/src/audios/videoplayback (6).weba?url'
import audio7 from '/src/audios/videoplayback (7).weba?url'
import audio8 from '/src/audios/videoplayback (8).weba?url'
import audio9 from '/src/audios/videoplayback (9).weba?url'
import audio10 from '/src/audios/videoplayback (10).weba?url'
import audio11 from '/src/audios/videoplayback (11).weba?url'


const audioFiles = [
  audio1,
  audio2,
  audio3,
  audio4,
  audio5,
  audio6,
  audio7,
  audio8,
  audio9,
  audio10,
  audio11
]


let currentAudio = null
let isPlaying = false
let audioInitialized = false

// Lista embaralhada para garantir que todas as faixas toquem antes de repetir
let shuffledQueue = []
let queueIndex = 0

function shuffleArray(array) {
  // Algoritmo de Fisher-Yates
  const arr = array.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function refillQueue() {
  shuffledQueue = shuffleArray(audioFiles)
  queueIndex = 0
}

// Permitir acesso ao elemento de áudio para visualização
export function getCurrentAudioElement() {
  return currentAudio
}

/**
 * Get a random audio file (ensuring it's different from the last one)
 */

function getNextAudioFile() {
  if (!shuffledQueue.length || queueIndex >= shuffledQueue.length) {
    refillQueue()
  }
  const audio = shuffledQueue[queueIndex]
  queueIndex++
  return audio
}

/**
 * Play the next audio file and set up auto-play for the next one
 * Mantém o mesmo elemento de áudio para garantir continuidade do visualizador
 */

function playNextAudio() {
  if (!isPlaying) return
  try {
    const audioPath = getNextAudioFile()
    if (!currentAudio) {
      currentAudio = new Audio()
      audioInitialized = true
      currentAudio.onended = () => {
        playNextAudio()
      }
      currentAudio.onerror = () => {
        console.error('Erro ao carregar áudio')
        playNextAudio()
      }
    }
    currentAudio.src = audioPath
    currentAudio.currentTime = 0
    currentAudio.load()
    currentAudio.play().catch(error => {
      console.error('Erro ao reproduzir áudio:', error)
      playNextAudio()
    })
    console.log('🎵 Reproduzindo áudio')
  } catch (error) {
    console.error('Erro ao iniciar reprodução de áudio:', error)
  }
}

/**
 * Start continuous audio playback
 */

export function playRandomAudio() {
  if (isPlaying) return // Already playing
  isPlaying = true
  refillQueue()
  playNextAudio()
  // Forçar atualização do visualizador
  setTimeout(() => {
    window.dispatchEvent(new Event('cyberlife-audio-tick'))
  }, 100)
}

/**
 * Stop audio playback
 */
export function stopAudio() {
  isPlaying = false
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    // Não destrói o elemento, apenas pausa
  }
}

/**
 * Check if audio is currently playing
 */
export function isAudioPlaying() {
  return isPlaying && currentAudio && !currentAudio.paused
}
