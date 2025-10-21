import React from 'react'
export default function ProjectCard({ block, settings }){
  const bg = block.id.startsWith('p1') ? settings.projectColors.p1 : block.id.startsWith('p2') ? settings.projectColors.p2 : block.id.startsWith('p3') ? settings.projectColors.p3 : '#f3f4f6'
  return (
    <div className="p-4 rounded-2xl bg-[var(--card)] shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div style={{background:bg}} className="w-3 h-10 rounded-md" />
          <div>
            <div className="text-sm font-medium">{block.title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{block.start ? `${new Date(block.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} — ${new Date(block.end).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : ''}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 dark:text-gray-300">{block.minutes} min</div>
          {block.fixed ? <div className="text-xs text-gray-400 mt-2">Fixed</div> : <button className="mt-2 px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700">Start</button>}
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">Tasks & notes can be added in the Activities panel.</div>
    </div>
  )
}
