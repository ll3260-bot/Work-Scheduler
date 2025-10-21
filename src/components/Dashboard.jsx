import React from 'react'
import Schedule from './Schedule'
import PomodoroPanel from './PomodoroPanel'
import Activities from './Activities'

function Summary({progress}){
  const totalPom = Object.values(progress).reduce((s,v)=> s + (v.donePomodoros||0), 0)
  const tasksCompleted = 0
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 rounded-2xl bg-[var(--card)] shadow-sm"><div className="text-sm text-gray-500">Pomodoros</div><div className="text-2xl font-bold mt-2">{totalPom}</div></div>
      <div className="p-4 rounded-2xl bg-[var(--card)] shadow-sm"><div className="text-sm text-gray-500">Tasks Done</div><div className="text-2xl font-bold mt-2">{tasksCompleted}</div></div>
      <div className="p-4 rounded-2xl bg-[var(--card)] shadow-sm"><div className="text-sm text-gray-500">Projects</div><div className="text-2xl font-bold mt-2">3</div></div>
    </div>
  )
}

export default function Dashboard({ settings, progress, setProgress }){
  return (
    <div className="space-y-6">
      <Summary progress={progress} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2"><Schedule settings={settings} /></div>
        <div className="space-y-4"><PomodoroPanel settings={settings} progress={progress} setProgress={setProgress} /><Activities progress={progress} setProgress={setProgress} /></div>
      </div>
    </div>
  )
}
