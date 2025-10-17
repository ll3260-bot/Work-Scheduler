import React, { useEffect, useRef, useState } from 'react'
import { buildScheduleForDate } from './Schedule'
import { load, save } from '../utils/localStorage'
import { motion } from 'framer-motion'

// A Pomodoro controller tied to a selected project block from today's schedule
export default function PomodoroPanel({ settings, progress, setProgress }) {
  const [running, setRunning] = useState(false)
  const [mode, setMode] = useState('focus') // focus, short, long
  const [secondsLeft, setSecondsLeft] = useState(settings.pomodoro.focus * 60)
  const intervalRef = useRef(null)

  const today = new Date()
  const day = today.getDay()
  const date = new Date(today)
  if (day === 0) date.setDate(today.getDate() + 1)
  if (day === 6) date.setDate(today.getDate() + 2)
  const timeline = buildScheduleForDate(date, settings).filter(t => !t.fixed)

  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedBlock = timeline[selectedIndex] || null
  const selectedKey = selectedBlock ? `block_${selectedBlock.start.toISOString()}` : 'manual'

  // persist local UI settings
  useEffect(() => {
    const s = load('ws_timer_ui', null)
    if (s) {
      setMode(s.mode || 'focus')
      setSecondsLeft(s.secondsLeft ?? settings.pomodoro.focus*60)
      setSelectedIndex(s.selectedIndex || 0)
    }
  }, [])

  useEffect(() => {
    save('ws_timer_ui', { mode, secondsLeft, selectedIndex })
  }, [mode, secondsLeft, selectedIndex])

  // sync with settings changes
  useEffect(() => {
    if (!running) {
      setSecondsLeft(settings.pomodoro.focus * 60)
      setMode('focus')
    }
  }, [settings])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            // play melody if sound enabled
            if (settings.sound) playMelody()
            // mark a completed pomodoro on the selected block when focus ends
            setProgress(prev => {
              const key = selectedKey
              const cur = prev[key] || {}
              // if focus finished, increment donePomodoros
              if (mode === 'focus') {
                const donePom = (cur.donePomodoros || 0) + 1
                return { ...prev, [key]: { ...cur, donePomodoros: donePom } }
              }
              return prev
            })
            // cycle modes
            if (mode === 'focus') {
              setMode('short')
              return settings.pomodoro.short * 60
            } else {
              setMode('focus')
              return settings.pomodoro.focus * 60
            }
          }
          return s - 1
        })
      }, 1000)
      return () => clearInterval(intervalRef.current)
    } else {
      clearInterval(intervalRef.current)
    }
  }, [running, mode, settings, selectedKey, setProgress])

  const start = () => setRunning(true)
  const pause = () => setRunning(false)
  const reset = () => {
    setRunning(false)
    setMode('focus')
    setSecondsLeft(settings.pomodoro.focus * 60)
  }

  const fmt = (s) => {
    const m = Math.floor(s/60).toString().padStart(2,'0')
    const sec = (s%60).toString().padStart(2,'0')
    return `${m}:${sec}`
  }

  // Simple WebAudio melody
  const playMelody = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const notes = [880, 988, 1318] // small ascending beep triad
      let t = ctx.currentTime
      notes.forEach((n, i) => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'sine'
        o.frequency.value = n
        o.connect(g)
        g.connect(ctx.destination)
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(0.1, t + 0.01)
        o.start(t)
        t += 0.12
        g.gain.exponentialRampToValueAtTime(0.0001, t)
        o.stop(t + 0.02)
      })
      setTimeout(()=> { try{ ctx.close() }catch(e){} }, 700)
    } catch(e){}
  }

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="p-4 rounded-2xl shadow-sm bg-white dark:bg-gray-800">
      <h3 className="text-lg font-medium">Pomodoro</h3>

      <div className="mt-3">
        <label className="text-sm text-gray-500 dark:text-gray-400">Active Project Block</label>
        <select value={selectedIndex} onChange={e=>setSelectedIndex(Number(e.target.value))} className="w-full mt-1 rounded px-3 py-2">
          {timeline.map((t, i) => (
            <option key={i} value={i}>{t.title} — {new Date(t.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</option>
          ))}
          {timeline.length===0 && <option value={0}>No project blocks today</option>}
        </select>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <div className="text-4xl font-mono">{fmt(secondsLeft)}</div>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={start} className="flex-1 px-3 py-2 rounded-2xl bg-green-500 text-white">Start</button>
        <button onClick={pause} className="px-3 py-2 rounded-2xl bg-yellow-400">Pause</button>
        <button onClick={reset} className="px-3 py-2 rounded-2xl bg-gray-200 dark:bg-gray-700">Reset</button>
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Mode: <strong className="ml-1">{mode}</strong>
      </div>

      <div className="mt-2 text-sm">
        Selected: <strong className="ml-1">{selectedBlock ? `${selectedBlock.title} (${selectedBlock.minutes} min)` : '—'}</strong>
      </div>

      <div className="mt-4 text-sm">
        Completed cycles for selected block: {(progress[selectedKey]?.donePomodoros) || 0}
      </div>
    </motion.div>
  )
}
