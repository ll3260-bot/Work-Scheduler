import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function ProjectCard({ block, settings, progress, setProgress }) {
  const id = block.id
  const key = `block_${block.start?.toISOString?.() || id}`
  const done = progress[key]?.completed || false

  const bg = block.id.startsWith('p1') ? settings.projectColors.p1
    : block.id.startsWith('p2') ? settings.projectColors.p2
    : block.id.startsWith('p3') ? settings.projectColors.p3
    : '#f3f4f6'

  // Task checklist stored under progress[key].tasks
  const tasks = progress[key]?.tasks || []
  const [newTask, setNewTask] = useState('')

  const addTask = () => {
    if (!newTask.trim()) return
    setProgress(prev => {
      const copy = {...prev}
      const cur = copy[key] || {}
      const t = cur.tasks ? [...cur.tasks] : []
      t.push({ id: Date.now(), text: newTask, done:false })
      copy[key] = { ...cur, tasks: t }
      return copy
    })
    setNewTask('')
  }

  const toggleTask = (taskId) => {
    setProgress(prev => {
      const copy = {...prev}
      const cur = copy[key] || {}
      const t = (cur.tasks || []).map(ts => ts.id === taskId ? {...ts, done: !ts.done} : ts)
      copy[key] = { ...cur, tasks: t }
      return copy
    })
  }

  const removeTask = (taskId) => {
    setProgress(prev => {
      const copy = {...prev}
      const cur = copy[key] || {}
      const t = (cur.tasks || []).filter(ts => ts.id !== taskId)
      copy[key] = { ...cur, tasks: t }
      return copy
    })
  }

  const incrementPomodoro = () => {
    setProgress(prev => {
      const copy = {...prev}
      const cur = copy[key] || {}
      const donePom = (cur.donePomodoros || 0) + 1
      copy[key] = { ...cur, donePomodoros: donePom }
      return copy
    })
  }

  return (
    <motion.div layout initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} className="p-4 rounded-2xl shadow-sm bg-white dark:bg-gray-800 transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div style={{background:bg}} className="w-3 h-10 rounded-md" />
            <div>
              <div className="text-sm font-medium">{block.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {block.start ? `${new Date(block.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} — ${new Date(block.end).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : ''}
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 dark:text-gray-300">{block.minutes} min</div>
          {!block.fixed && (
            <button
              onClick={() => {
                setProgress(p => {
                  const copy = {...p}
                  copy[key] = {...(copy[key]||{}), completed: !done}
                  return copy
                })
              }}
              className={`mt-2 px-3 py-1 rounded-full text-sm ${done ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              {done ? 'Completed' : 'Mark Completed'}
            </button>
          )}
        </div>
      </div>

      {/* Pomodoro and tasks area */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tasks</div>
          <div className="space-y-2">
            {(tasks || []).map(t => (
              <div key={t.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded p-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={t.done} onChange={()=>toggleTask(t.id)} />
                  <span className={t.done ? 'line-through text-gray-400' : ''}>{t.text}</span>
                </label>
                <button onClick={()=>removeTask(t.id)} className="text-xs text-red-500">Remove</button>
              </div>
            ))}
            <div className="flex gap-2">
              <input value={newTask} onChange={e=>setNewTask(e.target.value)} placeholder="New task" className="flex-1 px-3 py-2 rounded border bg-white dark:bg-gray-800" />
              <button onClick={addTask} className="px-3 py-2 rounded bg-indigo-600 text-white">Add</button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Pomodoros</div>
          <div className="text-lg font-mono my-2">{progress[key]?.donePomodoros || 0}</div>
          <button onClick={incrementPomodoro} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm">+1</button>
        </div>
      </div>
    </motion.div>
  )
}
