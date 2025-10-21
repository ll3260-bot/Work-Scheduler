import React, { useState, useEffect } from 'react'
import { load } from '../utils/localStorage'
export default function Activities({ progress, setProgress }){
  const [activeProject, setActiveProject] = useState('p1')
  const [note, setNote] = useState('')
  const [items, setItems] = useState(()=> load('ws_activities', { p1:[], p2:[], p3:[], daily:[] }))
  useEffect(()=>{ localStorage.setItem('ws_activities', JSON.stringify(items)) }, [items])
  const add = () => { if(!note.trim()) return; const id = Date.now(); setItems(prev => ({ ...prev, [activeProject]: [...(prev[activeProject]||[]), { id, text: note, done:false }] })); setNote('') }
  const toggle = (id)=> setItems(prev=> ({ ...prev, [activeProject]: prev[activeProject].map(i=> i.id===id ? {...i, done: !i.done} : i) }))
  const remove = id => setItems(prev=> ({ ...prev, [activeProject]: prev[activeProject].filter(i=> i.id!==id) }))
  return (
    <div className="p-4 rounded-2xl bg-[var(--card)] shadow-sm">
      <h4 className="font-medium">Activities</h4>
      <div className="mt-3">
        <div className="flex gap-2"><button onClick={()=>setActiveProject('daily')} className={`px-3 py-1 rounded ${activeProject==='daily' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>Daily</button><button onClick={()=>setActiveProject('p1')} className={`px-3 py-1 rounded ${activeProject==='p1' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>Project 1</button><button onClick={()=>setActiveProject('p2')} className={`px-3 py-1 rounded ${activeProject==='p2' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>Project 2</button><button onClick={()=>setActiveProject('p3')} className={`px-3 py-1 rounded ${activeProject==='p3' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>Project 3</button></div>
        <div className="mt-3 space-y-2">{(items[activeProject] || []).map(it => (<div key={it.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded p-2"><label className="flex items-center gap-2"><input type="checkbox" checked={it.done} onChange={()=>toggle(it.id)} /><span className={it.done ? 'line-through text-gray-400' : ''}>{it.text}</span></label><button onClick={()=>remove(it.id)} className="text-xs text-red-500">Remove</button></div>))}</div>
        <div className="mt-3 flex gap-2"><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Add activity" className="flex-1 px-3 py-2 rounded border bg-white dark:bg-gray-800" /><button onClick={add} className="px-3 py-2 rounded bg-indigo-600 text-white">Add</button></div>
      </div>
    </div>
  )
}
