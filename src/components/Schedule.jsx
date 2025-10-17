import React from 'react'
import ProjectCard from './ProjectCard'

// Helper: add minutes to Date
const addMinutes = (date, mins) => new Date(date.getTime() + mins*60000)

// format time
const fmt = (date) => date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})

// Build the schedule for a given weekday index (0 = Sunday)
export function buildScheduleForDate(date, settings) {
  // Work window: 8:00 - 18:00
  const workStart = new Date(date)
  workStart.setHours(8,0,0,0)
  const workEnd = new Date(date)
  workEnd.setHours(18,0,0,0)

  // Fixed slots
  const dailyTasks = { id: 'daily', title: 'Daily Tasks', minutes: 10 }
  const break30 = { id: 'break', title: 'Break', minutes: 30, fixedAt: {hour:13, minute:0} }
  const lunch = { id: 'lunch', title: 'Lunch', minutes: 60, fixedAt: {hour:15, minute:45} }

  // Remaining minutes
  const totalMinutes = (workEnd - workStart)/60000
  const remaining = totalMinutes - dailyTasks.minutes - break30.minutes - lunch.minutes

  const p1 = Math.round(remaining * 0.30)
  const p2 = Math.round(remaining * 0.30)
  const p3 = remaining - p1 - p2

  // rotate projects: Project1 first on Monday (1)
  const weekday = date.getDay() // 0 Sun, 1 Mon ...
  const dayIndex = ((weekday + 6) % 7) + 1 // convert to 1..7 starting Monday=1
  // rotation base: Monday->P1, Tue->P2, Wed->P3, Thu->P1, Fri->P2
  const orderOffsets = [0,1,2] // p1,p2,p3
  const firstIndex = ((weekday - 1) % 3 + 3) % 3 // Mon(1)->0, Tue(2)->1, Wed(3)->2
  const order = [0,1,2].map(i => (firstIndex + i) % 3)

  const projects = [
    { id: 'p1', title: 'Project 1', minutes: p1 },
    { id: 'p2', title: 'Project 2', minutes: p2 },
    { id: 'p3', title: 'Project 3', minutes: p3 },
  ]
  // reorder
  const ordered = order.map(i => projects[i])

  // Build timeline from start + daily tasks, inserting fixed breaks when time reaches them
  let timeline = []
  let cursor = addMinutes(workStart, dailyTasks.minutes) // daily tasks immediately at start
  timeline.push({
    ...dailyTasks,
    start: new Date(workStart),
    end: addMinutes(workStart, dailyTasks.minutes)
  })

  const fixedSlots = [
    { ...break30, getStart: () => { const d = new Date(date); d.setHours(break30.fixedAt.hour, break30.fixedAt.minute,0,0); return d } },
    { ...lunch, getStart: () => { const d = new Date(date); d.setHours(lunch.fixedAt.hour, lunch.fixedAt.minute,0,0); return d } }
  ]

  // function to insert project block, but split if would overlap fixed slot
  const pushBlock = (proj) => {
    let minsLeft = proj.minutes
    while (minsLeft > 0) {
      // find next fixed slot that is after cursor
      const nextFixed = fixedSlots.find(f => f.getStart() > cursor)
      if (nextFixed) {
        const untilFixed = Math.round((nextFixed.getStart() - cursor)/60000)
        if (untilFixed <= 0) {
          // insert fixed slot now
          timeline.push({
            id: nextFixed.id,
            title: nextFixed.title,
            minutes: nextFixed.minutes,
            start: nextFixed.getStart(),
            end: addMinutes(nextFixed.getStart(), nextFixed.minutes),
            fixed: true
          })
          cursor = addMinutes(nextFixed.getStart(), nextFixed.minutes)
          continue
        }
        const take = Math.min(minsLeft, untilFixed)
        const start = new Date(cursor)
        const end = addMinutes(cursor, take)
        timeline.push({
          id: proj.id,
          title: proj.title,
          minutes: take,
          start, end
        })
        cursor = end
        minsLeft -= take
      } else {
        // no more fixed slots, just append rest
        const start = new Date(cursor)
        const end = addMinutes(cursor, minsLeft)
        timeline.push({
          id: proj.id,
          title: proj.title,
          minutes: minsLeft,
          start, end
        })
        cursor = end
        minsLeft = 0
      }
    }
  }

  ordered.forEach(pushBlock)

  // If we haven't inserted fixed slots (they might be before cursor), ensure they exist
  fixedSlots.forEach(f => {
    const exists = timeline.some(t => t.id === f.id)
    if (!exists) {
      const s = f.getStart()
      timeline.push({
        id: f.id,
        title: f.title,
        minutes: f.minutes,
        start: s,
        end: addMinutes(s, f.minutes),
        fixed: true
      })
    }
  })

  // sort by start
  timeline.sort((a,b) => a.start - b.start)
  return timeline
}

export default function Schedule({ settings, progress, setProgress }) {
  const today = new Date()
  // If weekend, show next Monday
  const day = today.getDay()
  const date = new Date(today)
  if (day === 0) date.setDate(today.getDate() + 1)
  if (day === 6) date.setDate(today.getDate() + 2)

  const timeline = buildScheduleForDate(date, settings)

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Today's Schedule</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">{date.toDateString()}</div>
      </div>

      <div className="space-y-3">
        {timeline.map((block, i) => (
          <ProjectCard
            key={i}
            block={block}
            settings={settings}
            progress={progress}
            setProgress={setProgress}
          />
        ))}
      </div>
    </section>
  )
}
