// src/components/Schedule.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { load, save } from '../utils/localStorage'

/*
  Schedule component
  - Builds the day timeline (8:00 - 18:00)
  - Adds fixed slots: Daily Tasks (10m at start), 30m break at 13:00, 1h lunch at 15:45
  - Divides remaining time into Project 1/2/3 with 30/30/40% and rotates start each day
  - Lays out events so overlapping events are shown side-by-side (no visual overlap)
  - Shows percent of total working minutes for each project block
  - Allows global renaming of Project 1/2/3 persisted in localStorage ('ws_project_names')
*/

const addMinutes = (date, mins) => new Date(date.getTime() + mins * 60000)
const minutesBetween = (a, b) => Math.round((b - a) / 60000)

function defaultProjectNames() {
  return load('ws_project_names', { p1: 'Project 1', p2: 'Project 2', p3: 'Project 3' })
}

export function buildScheduleForDate(date, settings, projectNames = null) {
  const workStart = new Date(date); workStart.setHours(8, 0, 0, 0)
  const workEnd = new Date(date); workEnd.setHours(18, 0, 0, 0)
  const dailyTasks = { id: 'daily', title: 'Daily Tasks', minutes: 10 }
  const break30 = { id: 'break', title: 'Afternoon Break', minutes: 30, fixedAt: { hour: 13, minute: 0 } }
  const lunch = { id: 'lunch', title: 'Lunch', minutes: 60, fixedAt: { hour: 15, minute: 45 } }

  const totalMinutes = minutesBetween(workStart, workEnd) // should be 600
  const remaining = totalMinutes - dailyTasks.minutes - break30.minutes - lunch.minutes

  // allocate percentages
  const p1 = Math.round(remaining * 0.3)
  const p2 = Math.round(remaining * 0.3)
  const p3 = remaining - p1 - p2

  const projects = [
    { id: 'p1', title: projectNames?.p1 ?? 'Project 1', minutes: p1 },
    { id: 'p2', title: projectNames?.p2 ?? 'Project 2', minutes: p2 },
    { id: 'p3', title: projectNames?.p3 ?? 'Project 3', minutes: p3 },
  ]

  // rotation: Monday -> p1 first, Tuesday -> p2 first, Wednesday -> p3 first, Thu->p1,...
  const weekday = date.getDay() // 0=Sun,1=Mon...
  const rotStart = ((weekday + 6) % 3) // Monday -> 0
  const order = [0,1,2].map(i => projects[(rotStart + i) % 3])

  let timeline = []
  let cursor = new Date(workStart)

  // 1) daily tasks at start
  timeline.push({ ...dailyTasks, start: new Date(cursor), end: addMinutes(cursor, dailyTasks.minutes), fixed: true })
  cursor = addMinutes(cursor, dailyTasks.minutes)

  // helper for fixed slots
  const fixedSlots = [
    { ...break30, getStart: () => { const d = new Date(date); d.setHours(break30.fixedAt.hour, break30.fixedAt.minute, 0, 0); return d }, id: 'break' },
    { ...lunch, getStart: () => { const d = new Date(date); d.setHours(lunch.fixedAt.hour, lunch.fixedAt.minute, 0, 0); return d }, id: 'lunch' }
  ]

  // push project minutes but respect fixed slots (place them at their configured times)
  const pushBlock = (proj) => {
    let mins = proj.minutes
    while (mins > 0) {
      // next fixed slot that starts after cursor
      const nextFixed = fixedSlots.find(f => f.getStart() > cursor)
      if (nextFixed) {
        const untilFixed = Math.round((nextFixed.getStart() - cursor) / 60000)
        if (untilFixed <= 0) {
          // if we're at/after the fixed slot start, put fixed slot now
          const s = nextFixed.getStart()
          timeline.push({ id: nextFixed.id, title: nextFixed.title, minutes: nextFixed.minutes, start: s, end: addMinutes(s, nextFixed.minutes), fixed: true })
          cursor = addMinutes(s, nextFixed.minutes)
          continue
        }
        const take = Math.min(mins, untilFixed)
        timeline.push({ id: proj.id, title: proj.title, minutes: take, start: new Date(cursor), end: addMinutes(cursor, take) })
        cursor = addMinutes(cursor, take)
        mins -= take
      } else {
        // no more fixed slots ahead, just push the rest
        timeline.push({ id: proj.id, title: proj.title, minutes: mins, start: new Date(cursor), end: addMinutes(cursor, mins) })
        cursor = addMinutes(cursor, mins)
        mins = 0
      }
    }
  }

  order.forEach(pushBlock)

  // ensure any fixed slots not yet in timeline are placed
  fixedSlots.forEach(f => {
    if (!timeline.some(t => t.id === f.id)) {
      const s = f.getStart()
      timeline.push({ id: f.id, title: f.title, minutes: f.minutes, start: s, end: addMinutes(s, f.minutes), fixed: true })
    }
  })

  // sort by start time
  timeline.sort((a, b) => new Date(a.start) - new Date(b.start))

  // Bound check: ensure every item is within workStart/workEnd
  timeline = timeline.map(item => {
    const s = new Date(item.start)
    const e = new Date(item.end)
    // clamp
    if (s < workStart) item.start = new Date(workStart)
    if (e > workEnd) item.end = new Date(workEnd)
    return item
  })

  return { timeline, workStart, workEnd, totalMinutes }
}

// Layout helper: assign columns for overlapping events
function assignColumns(events) {
  // events sorted by start
  const cols = [] // each col stores end time of last event in that column
  const assignments = [] // column index per event

  for (const ev of events) {
    let placed = false
    for (let c = 0; c < cols.length; c++) {
      if (ev.start >= cols[c]) {
        // place in this column
        assignments.push(c)
        cols[c] = ev.end
        placed = true
        break
      }
    }
    if (!placed) {
      // new column
      assignments.push(cols.length)
      cols.push(ev.end)
    }
  }

  const columnsCount = cols.length
  return { assignments, columnsCount }
}

export default function Schedule({ settings }) {
  // project names persisted globally
  const [projectNames, setProjectNames] = useState(defaultProjectNames())
  useEffect(() => save('ws_project_names', projectNames), [projectNames])

  // simple modal for renaming
  const [editing, setEditing] = useState(null)
  const [editingValue, setEditingValue] = useState('')

  const date = new Date()
  // If weekend, shift to next Monday (app behaviour in original code)
  useEffect(() => {
    const d = new Date()
    const day = d.getDay()
    if (day === 0) d.setDate(d.getDate() + 1)
    if (day === 6) d.setDate(d.getDate() + 2)
  }, [])

  // build timeline (memo)
  const { timeline, workStart, workEnd, totalMinutes } = useMemo(() => buildScheduleForDate(new Date(), settings, projectNames), [settings, projectNames])

  // transform timeline items -> objects with start/end as minute offsets
  const events = timeline.map(it => ({
    ...it,
    start: new Date(it.start),
    end: new Date(it.end),
    minutes: minutesBetween(new Date(it.start), new Date(it.end))
  }))

  // sort chronologically (safety)
  events.sort((a,b) => a.start - b.start)

  // group into "visual groups" where assignments are computed per overlapping window:
  // We'll iterate and for contiguous overlapping windows compute assignments.
  const blocksWithLayout = []
  let i = 0
  while (i < events.length) {
    // form group starting at i
    let group = [events[i]]
    let groupEnd = events[i].end
    let j = i + 1
    while (j < events.length && events[j].start < groupEnd) {
      group.push(events[j])
      if (events[j].end > groupEnd) groupEnd = events[j].end
      j++
    }

    // assign columns for this group
    const { assignments, columnsCount } = assignColumns(group.map(g => ({ start: g.start, end: g.end })))

    // attach layout info
    for (let k = 0; k < group.length; k++) {
      const ev = group[k]
      const colIndex = assignments[k]
      blocksWithLayout.push({
        ...ev,
        colIndex,
        columnsCount
      })
    }

    i = j
  }

  // helper to compute top/height in pixels
  // choose pxPerMinute to make timeline balanced; 600 minutes -> let's pick 1.2 px/min -> 720px total
  const pxPerMinute = 1.2
  const totalPx = totalMinutes * pxPerMinute

  // project totals (to show percentages)
  const projectTotals = events.reduce((acc, e) => {
    if (e.id && e.id.startsWith('p')) {
      acc[e.id] = (acc[e.id] || 0) + e.minutes
    }
    return acc
  }, {})

  const totalProjectMinutes = Object.values(projectTotals).reduce((s,v)=> s+v, 0) || 1

  // render
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-semibold">Today's Schedule</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">{new Date().toDateString()}</div>
        </div>
        <div className="flex items-center gap-3">
          {/* Show project percentages and rename buttons */}
          {['p1','p2','p3'].map(pid => {
            const minutes = projectTotals[pid] || 0
            const pct = ((minutes / totalProjectMinutes) * 100).toFixed(0)
            return (
              <div key={pid} className="p-2 rounded-lg bg-[var(--card)] shadow-sm text-sm">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{projectNames[pid]}</div>
                  <div className="text-xs text-gray-500">· {pct}%</div>
                  <button onClick={() => { setEditing(pid); setEditingValue(projectNames[pid]) }} className="ml-2 text-xs text-indigo-600">Rename</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          {/* Timeline container */}
          <div className="relative p-4 rounded-2xl bg-[var(--card)] shadow-sm" style={{ height: totalPx }}>
            {/* Hour ticks on left */}
            <div className="absolute left-0 top-0 bottom-0 w-full">
              {/* Background ticks */}
              {Array.from({ length: 11 }).map((_, hr) => {
                const top = hr * (60 * pxPerMinute)
                const hour = 8 + hr
                return (
                  <div key={hr} className="absolute left-0 right-0" style={{ top }}>
                    <div className="flex items-start gap-3">
                      <div className="w-16 text-xs text-gray-400">{String(hour).padStart(2,'0')}:00</div>
                      <div className="flex-1 border-t border-dashed border-gray-100 dark:border-gray-800" />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* event blocks */}
            {blocksWithLayout.map((b, idx) => {
              // positioning
              const top = minutesBetween(workStart, b.start) * pxPerMinute
              const height = Math.max(20, minutesBetween(b.start, b.end) * pxPerMinute) // min height
              const colWidth = 100 / b.columnsCount
              const leftPct = b.colIndex * colWidth
              const widthPct = colWidth - 2 // small gap
              const bgColor = b.id && b.id.startsWith('p1') ? settings.projectColors.p1
                : b.id && b.id.startsWith('p2') ? settings.projectColors.p2
                : b.id && b.id.startsWith('p3') ? settings.projectColors.p3
                : '#F3F4F6'

              const isFixed = b.fixed

              return (
                <div
                  key={idx}
                  className={`absolute p-3 rounded-lg shadow-sm overflow-hidden`}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    background: isFixed ? 'linear-gradient(90deg, rgba(0,0,0,0.02), rgba(0,0,0,0.02))' : 'white',
                    borderLeft: `6px solid ${bgColor}`,
                    boxSizing: 'border-box'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-semibold">{b.title}</div>
                    <div className="text-xs text-gray-500">{minutesBetween(b.start, b.end)}m</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {b.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {b.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <aside>
          {/* Right column: compact list & rename controls */}
          <div className="p-4 rounded-2xl bg-[var(--card)] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">Projects</div>
            </div>
            {['p1','p2','p3'].map(pid => {
              const minutes = projectTotals[pid] || 0
              const pct = ((minutes / totalProjectMinutes) * 100).toFixed(1)
              return (
                <div key={pid} className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{projectNames[pid]}</div>
                    <div className="text-xs text-gray-500">{minutes} minutes · {pct}%</div>
                  </div>
                  <div>
                    <button onClick={() => { setEditing(pid); setEditingValue(projectNames[pid]) }} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm">Rename</button>
                  </div>
                </div>
              )
            })}
            <div className="pt-2 text-xs text-gray-500">Fixed Breaks: 13:00 (30m), Lunch: 15:45 (1h). Daily Tasks: first 10 minutes.</div>
          </div>
        </aside>
      </div>

      {/* Rename modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
          <div className="relative z-10 w-full max-w-md p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-lg">
            <h3 className="text-lg font-semibold">Rename {editing.toUpperCase()}</h3>
            <input className="mt-3 w-full px-3 py-2 rounded border" value={editingValue} onChange={e => setEditingValue(e.target.value)} />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
              <button onClick={() => {
                const next = { ...projectNames, [editing]: editingValue || projectNames[editing] }
                setProjectNames(next)
                save('ws_project_names', next)
                setEditing(null)
              }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
