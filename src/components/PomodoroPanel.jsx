import React, { useEffect, useRef, useState } from 'react'
import { load, save } from '../utils/localStorage'
export default function PomodoroPanel({ settings, progress, setProgress }){
  const [running, setRunning] = useState(false)
  const [mode, setMode] = useState('focus')
  const [seconds, setSeconds] = useState(settings.pomodoro.focus*60)
  const intervalRef = useRef(null)
  useEffect(()=>{ const s = load('ws_timer_ui', null); if(s){ setMode(s.mode||'focus'); setSeconds(s.seconds ?? settings.pomodoro.focus*60) } },[])
  useEffect(()=> save('ws_timer_ui',{ mode, seconds }), [mode, seconds])
  useEffect(()=>{
    if(running){
      intervalRef.current = setInterval(()=>{
        setSeconds(s=>{
          if(s<=1){
            try{ const ctx = new (window.AudioContext || window.webkitAudioContext)(); const o = ctx.createOscillator(); o.frequency.value = 880; o.connect(ctx.destination); o.start(); setTimeout(()=>{ o.stop(); ctx.close() }, 120) }catch(e){}
            if(mode==='focus'){ setMode('short'); return settings.pomodoro.short*60 }
            else { setMode('focus'); return settings.pomodoro.focus*60 }
          }
          return s-1
        })
      },1000)
      return ()=> clearInterval(intervalRef.current)
    } else clearInterval(intervalRef.current)
  },[running, mode, settings])
  const start = ()=> setRunning(true)
  const pause = ()=> setRunning(false)
  const reset = ()=> { setRunning(false); setMode('focus'); setSeconds(settings.pomodoro.focus*60) }
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  return (
    <div className="p-4 rounded-2xl bg-[var(--card)] shadow-sm">
      <h4 className="font-medium">Pomodoro</h4>
      <div className="mt-3 text-3xl font-mono text-center">{fmt(seconds)}</div>
      <div className="mt-3 flex gap-2"><button onClick={start} className="flex-1 px-3 py-2 rounded-2xl bg-green-500 text-white">Start</button><button onClick={pause} className="px-3 py-2 rounded-2xl bg-yellow-400">Pause</button><button onClick={reset} className="px-3 py-2 rounded-2xl bg-gray-200 dark:bg-gray-700">Reset</button></div>
      <div className="mt-3 text-sm text-[var(--muted)]">Mode: <strong className="ml-1">{mode}</strong></div>
    </div>
  )
}
