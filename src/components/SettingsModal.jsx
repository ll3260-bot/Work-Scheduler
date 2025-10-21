import React from 'react'
import { save } from '../utils/localStorage'
export default function SettingsModal({ open, onClose, settings, setSettings }){
  const [local, setLocal] = React.useState(settings)
  React.useEffect(()=> setLocal(settings), [open])
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-2xl p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-lg">
        <h3 className="text-xl font-semibold">Settings</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm">Focus minutes</label><input type="number" value={local.pomodoro.focus} onChange={e=> setLocal({...local, pomodoro:{...local.pomodoro, focus: Math.max(1, Number(e.target.value))}})} className="mt-1 w-full rounded px-3 py-2 border" /></div>
          <div><label className="block text-sm">Short break minutes</label><input type="number" value={local.pomodoro.short} onChange={e=> setLocal({...local, pomodoro:{...local.pomodoro, short: Math.max(1, Number(e.target.value))}})} className="mt-1 w-full rounded px-3 py-2 border" /></div>
          <div><label className="block text-sm">Long break minutes</label><input type="number" value={local.pomodoro.long} onChange={e=> setLocal({...local, pomodoro:{...local.pomodoro, long: Math.max(1, Number(e.target.value))}})} className="mt-1 w-full rounded px-3 py-2 border" /></div>
          <div><label className="block text-sm">Sound alerts</label><div className="mt-1"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={local.sound} onChange={e=> setLocal({...local, sound: e.target.checked})} /> <span className="text-sm">Enable sound</span></label></div></div>
          <div><label className="block text-sm">Project 1 color</label><input type="color" value={local.projectColors.p1} onChange={e=> setLocal({...local, projectColors:{...local.projectColors, p1: e.target.value}})} className="mt-1 w-full h-10 rounded" /></div>
          <div><label className="block text-sm">Project 2 color</label><input type="color" value={local.projectColors.p2} onChange={e=> setLocal({...local, projectColors:{...local.projectColors, p2: e.target.value}})} className="mt-1 w-full h-10 rounded" /></div>
          <div><label className="block text-sm">Project 3 color</label><input type="color" value={local.projectColors.p3} onChange={e=> setLocal({...local, projectColors:{...local.projectColors, p3: e.target.value}})} className="mt-1 w-full h-10 rounded" /></div>
          <div><label className="block text-sm">Dark mode</label><div className="mt-1"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={local.dark} onChange={e=> setLocal({...local, dark: e.target.checked})} /> <span className="text-sm">Enable dark</span></label></div></div>
        </div>
        <div className="mt-6 flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 rounded-2xl bg-gray-200 dark:bg-gray-700">Cancel</button><button onClick={()=>{ setSettings(local); save('ws_settings', local); onClose() }} className="px-4 py-2 rounded-2xl bg-indigo-600 text-white">Save</button></div>
      </div>
    </div>
  )
}
