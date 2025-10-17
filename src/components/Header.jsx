import React from 'react'
import { motion } from 'framer-motion'

export default function Header({ onOpenSettings, settings, setSettings }) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Work Scheduler</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Smart daily schedule • 8:00 AM — 6:00 PM (Mon–Fri)</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSettings(s => ({ ...s, dark: !s.dark }))}
          className="px-3 py-2 rounded-2xl bg-white dark:bg-gray-800 shadow-sm"
          title="Toggle dark"
        >
          {settings.dark ? '🌙' : '☀️'}
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenSettings}
          className="px-4 py-2 rounded-2xl bg-indigo-600 text-white shadow hover:opacity-95"
        >
          ⚙️ Settings
        </motion.button>
      </div>
    </header>
  )
}
