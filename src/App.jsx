import { useState, useEffect, useRef } from 'react'

let _wordId = 0
let _particleId = 0

const STARS = Array.from({ length: 180 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.3,
  opacity: Math.random() * 0.6 + 0.1,
}))

const COLORS = ['#00ff88', '#00ccff', '#ff66cc', '#ffcc00', '#ff6644', '#aa88ff']

function makeWord(text, score = 0) {
  const edge = Math.floor(Math.random() * 3)
  const speedMult = 1 + score * 0.025
  const base = (75 + Math.random() * 85) * speedMult
  let x, y, vx, vy

  if (edge === 0) {
    x = 80 + Math.random() * (window.innerWidth - 160)
    y = -50
    vx = (Math.random() - 0.5) * 55
    vy = base
  } else if (edge === 1) {
    x = -130
    y = 60 + Math.random() * (window.innerHeight - 120)
    vx = base
    vy = (Math.random() - 0.5) * 55
  } else {
    x = window.innerWidth + 130
    y = 60 + Math.random() * (window.innerHeight - 120)
    vx = -base
    vy = (Math.random() - 0.5) * 55
  }

  return {
    id: _wordId++,
    text,
    x, y, vx, vy,
    angle: (Math.random() - 0.5) * 28,
    rotSpeed: (Math.random() - 0.5) * 38,
    opacity: 1,
    scale: 1,
    dying: false,
    fontSize: 15 + Math.random() * 20,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }
}

function makeParticles(x, y, word) {
  return Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
    const speed = 120 + Math.random() * 220
    return {
      id: _particleId++,
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 120,
      opacity: 1,
      char: word[Math.floor(Math.random() * word.length)],
    }
  })
}

export default function App() {
  const [screen, setScreen] = useState('menu')
  const [inputWord, setInputWord] = useState('')
  const [tick, setTick] = useState(0)

  const gameRef = useRef({
    words: [],
    particles: [],
    score: 0,
    word: '',
    spawnTimer: 0,
    lastTime: null,
    animId: null,
  })

  const startGame = () => {
    const w = inputWord.trim()
    if (!w) return
    const g = gameRef.current
    g.words = []
    g.particles = []
    g.score = 0
    g.word = w
    g.spawnTimer = 1.8
    g.lastTime = null
    setScreen('game')
  }

  useEffect(() => {
    if (screen !== 'game') return
    const g = gameRef.current

    const loop = (ts) => {
      if (!g.lastTime) g.lastTime = ts
      const dt = Math.min((ts - g.lastTime) / 1000, 0.05)
      g.lastTime = ts

      g.spawnTimer += dt
      const interval = Math.max(0.65, 2.4 - g.score * 0.04)
      if (g.spawnTimer >= interval) {
        g.spawnTimer -= interval
        g.words.push(makeWord(g.word, g.score))
      }

      g.words = g.words
        .map(w =>
          w.dying
            ? { ...w, scale: w.scale - dt * 5, opacity: w.opacity - dt * 5 }
            : { ...w, x: w.x + w.vx * dt, y: w.y + w.vy * dt, angle: w.angle + w.rotSpeed * dt }
        )
        .filter(w => !(w.dying && w.opacity <= 0))
        .filter(w => {
          const escaped = w.x <= -450 || w.x >= window.innerWidth + 450 || w.y >= window.innerHeight + 120
          if (escaped && !w.dying) {
            g.score = Math.max(0, g.score - 3)
          }
          return !escaped
        })

      g.particles = g.particles
        .map(p => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          vy: p.vy + 420 * dt,
          opacity: p.opacity - dt * 2.2,
        }))
        .filter(p => p.opacity > 0)

      setTick(t => t + 1)
      g.animId = requestAnimationFrame(loop)
    }

    g.animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(g.animId)
  }, [screen])

  const shoot = (e, id) => {
    e.stopPropagation()
    const g = gameRef.current
    const w = g.words.find(w => w.id === id)
    if (!w || w.dying) return
    g.words = g.words.map(w => w.id === id ? { ...w, dying: true } : w)
    g.particles.push(...makeParticles(e.clientX, e.clientY, g.word))
    g.score++
  }

  const g = gameRef.current

  if (screen === 'menu') {
    return (
      <div style={S.menu}>
        {STARS.map((s, i) => (
          <div key={i} style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, borderRadius: '50%', background: 'white', opacity: s.opacity }} />
        ))}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.6rem' }}>
          <h1 style={S.title}>WORD SHOOTER</h1>
          <p style={S.subtitle}>napiš slovo · padá z krajů obrazovky · sestřeluj ho myší</p>
          <input
            value={inputWord}
            onChange={e => setInputWord(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && startGame()}
            placeholder="napiš slovo..."
            autoFocus
            maxLength={20}
            style={S.input}
          />
          <button onClick={startGame} style={S.btn}>SPUSTIT</button>
        </div>
      </div>
    )
  }

  return (
    <div style={S.game}>
      {STARS.map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, borderRadius: '50%', background: 'white', opacity: s.opacity, pointerEvents: 'none' }} />
      ))}

      <div style={S.score}>SCORE: {g.score}</div>
      <div style={S.wordDisplay}>「{g.word}」</div>
      <button onClick={() => setScreen('menu')} style={S.endBtn}>✕ KONEC</button>

      {g.words.map(w => (
        <div
          key={w.id}
          onClick={e => shoot(e, w.id)}
          style={{
            position: 'absolute',
            left: w.x,
            top: w.y,
            transform: `translate(-50%,-50%) rotate(${w.angle}deg) scale(${w.scale})`,
            opacity: w.opacity,
            color: w.color,
            fontFamily: '"Courier New", monospace',
            fontSize: w.fontSize,
            fontWeight: 'bold',
            textShadow: `0 0 10px ${w.color}, 0 0 22px ${w.color}55`,
            cursor: 'crosshair',
            userSelect: 'none',
            pointerEvents: w.dying ? 'none' : 'auto',
            whiteSpace: 'nowrap',
            letterSpacing: '0.12em',
          }}
        >
          {w.text}
        </div>
      ))}

      {g.particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            transform: 'translate(-50%,-50%)',
            opacity: p.opacity,
            color: '#ffffaa',
            fontFamily: '"Courier New", monospace',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            textShadow: '0 0 8px #ffff44',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {p.char}
        </div>
      ))}
    </div>
  )
}

const S = {
  menu: {
    height: '100vh',
    background: '#080818',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  title: {
    fontSize: 'clamp(1.8rem, 6vw, 4.5rem)',
    letterSpacing: '0.4em',
    color: '#00ff88',
    textShadow: '0 0 20px #00ff88, 0 0 60px #00ff8833',
    fontFamily: '"Courier New", monospace',
    margin: 0,
  },
  subtitle: {
    color: '#445566',
    fontFamily: '"Courier New", monospace',
    fontSize: '0.85rem',
    letterSpacing: '0.08em',
    textAlign: 'center',
  },
  input: {
    fontSize: '2rem',
    padding: '0.6rem 1.5rem',
    background: 'rgba(0,255,136,0.04)',
    border: '2px solid #00ff88',
    color: '#00ff88',
    outline: 'none',
    textAlign: 'center',
    borderRadius: '6px',
    letterSpacing: '0.2em',
    width: 'min(90vw, 380px)',
    caretColor: '#00ff88',
    fontFamily: '"Courier New", monospace',
  },
  btn: {
    padding: '0.7rem 3rem',
    fontSize: '1.1rem',
    background: '#00ff88',
    color: '#080818',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    letterSpacing: '0.25em',
    fontWeight: 'bold',
  },
  game: {
    width: '100vw',
    height: '100vh',
    background: '#080818',
    overflow: 'hidden',
    cursor: 'crosshair',
    position: 'relative',
    userSelect: 'none',
  },
  score: {
    position: 'absolute',
    top: 16,
    left: 20,
    color: '#00ff88',
    fontFamily: '"Courier New", monospace',
    fontSize: '1.3rem',
    letterSpacing: '0.15em',
    textShadow: '0 0 8px #00ff88',
    zIndex: 10,
  },
  wordDisplay: {
    position: 'absolute',
    top: 18,
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#ffffff22',
    fontFamily: '"Courier New", monospace',
    fontSize: '1rem',
    letterSpacing: '0.2em',
    zIndex: 10,
    whiteSpace: 'nowrap',
  },
  endBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    background: 'transparent',
    border: '1px solid #ff4466',
    color: '#ff4466',
    padding: '0.35rem 1rem',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    fontSize: '0.85rem',
    letterSpacing: '0.1em',
    zIndex: 10,
    borderRadius: '4px',
  },
}
