import React from 'react'
export default function Header({ onOpenSettings, settings, setSettings }){
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Work-Scheduler</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Focus & schedule dashboard • 8:00 AM — 6:00 PM</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={()=> setSettings(s=>({...s, dark: !s.dark}))} className="header-btn bg-white dark:bg-gray-800 shadow-sm">{settings.dark ? '🌙' : '☀️'}</button>
        <button onClick={onOpenSettings} className="px-4 py-2 rounded-2xl bg-indigo-600 text-white">⚙️ Settings</button>
      </div>
    </header>
  )
}
