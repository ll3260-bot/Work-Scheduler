import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import Schedule from './components/Schedule'
import PomodoroPanel from './components/PomodoroPanel'
import SettingsModal from './components/SettingsModal'
import { load, save } from './utils/localStorage'

export default function App() {
  // Global settings - persist
  const [settings, setSettings] = useState(() =>
    load('ws_settings', {
      pomodoro: { focus: 25, short: 5, long: 15, cyclesBeforeLong: 4 },
      dark: false,
      projectColors: { p1: '#60a5fa', p2: '#f472b6', p3: '#34d399' },
      sound: true
    })
  )

  useEffect(() => {
    save('ws_settings', settings)
    // apply dark class
    if (settings.dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [settings])

  // Pomodoro progress states persisted
  const [progress, setProgress] = useState(() =>
    load('ws_progress', {})
  )
  useEffect(() => save('ws_progress', progress), [progress])

  const [isSettingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <Header
          onOpenSettings={() => setSettingsOpen(true)}
          settings={settings}
          setSettings={setSettings}
          progress={progress}
        />
        <main className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Schedule
              settings={settings}
              progress={progress}
              setProgress={setProgress}
            />
          </div>
          <aside className="space-y-6">
            <PomodoroPanel
              settings={settings}
              progress={progress}
              setProgress={setProgress}
            />
          </aside>
        </main>
      </div>

      <SettingsModal
        open={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  )
}
