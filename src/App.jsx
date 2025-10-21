import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import SettingsModal from './components/SettingsModal'
import { load, save } from './utils/localStorage'

export default function App(){
  const [settings, setSettings] = useState(()=> load('ws_settings', {
    pomodoro:{ focus:25, short:5, long:15, cyclesBeforeLong:4 },
    dark:false,
    projectColors: { p1:'#60a5fa', p2:'#f472b6', p3:'#34d399' },
    sound:true
  }))
  useEffect(()=> { save('ws_settings', settings); if(settings.dark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark') }, [settings])

  const [progress, setProgress] = useState(()=> load('ws_progress', {}))
  useEffect(()=> save('ws_progress', progress), [progress])

  const [openSettings, setOpenSettings] = useState(false)

  return (
    <div className="min-h-screen p-6 bg-[var(--bg)]">
      <div className="container">
        <Header onOpenSettings={()=>setOpenSettings(true)} settings={settings} setSettings={setSettings} />
        <main className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <section className="lg:col-span-3 space-y-6">
            <Dashboard settings={settings} progress={progress} setProgress={setProgress} />
          </section>
          <aside>
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[var(--card)] shadow-sm">
                <h3 className="font-semibold">Quick Pomodoro</h3>
                <p className="text-sm text-[var(--muted)] mt-2">Use the panel to start a quick focus session.</p>
              </div>
            </div>
          </aside>
        </main>
      </div>
      <SettingsModal open={openSettings} onClose={()=>setOpenSettings(false)} settings={settings} setSettings={setSettings} />
    </div>
  )
}
