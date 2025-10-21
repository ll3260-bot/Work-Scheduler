import React from 'react'
import ProjectCard from './ProjectCard'
const addMinutes = (date, mins) => new Date(date.getTime() + mins*60000)
export function buildScheduleForDate(date, settings){
  const workStart = new Date(date); workStart.setHours(8,0,0,0)
  const workEnd = new Date(date); workEnd.setHours(18,0,0,0)
  const dailyTasks = { id:'daily', title:'Daily Tasks', minutes:10 }
  const break30 = { id:'break', title:'Afternoon Break', minutes:30, fixedAt:{hour:13, minute:0} }
  const lunch = { id:'lunch', title:'Lunch', minutes:60, fixedAt:{hour:15, minute:45} }
  const totalMinutes = (workEnd - workStart)/60000
  const remaining = totalMinutes - dailyTasks.minutes - break30.minutes - lunch.minutes
  const p1 = Math.round(remaining*0.3); const p2 = Math.round(remaining*0.3); const p3 = remaining - p1 - p2
  const projects = [{id:'p1', title:'Project 1', minutes:p1},{id:'p2',title:'Project 2',minutes:p2},{id:'p3',title:'Project 3',minutes:p3}]
  const weekday = date.getDay()
  const rotStart = ((weekday+6)%3)
  const order = [0,1,2].map(i => projects[(rotStart + i)%3])
  let timeline = []; let cursor = new Date(workStart)
  timeline.push({...dailyTasks, start: new Date(cursor), end: addMinutes(cursor, dailyTasks.minutes)}); cursor = addMinutes(cursor, dailyTasks.minutes)
  const fixedSlots = [
    {...break30, getStart: ()=>{const d=new Date(date); d.setHours(break30.fixedAt.hour, break30.fixedAt.minute,0,0); return d}},
    {...lunch, getStart: ()=>{const d=new Date(date); d.setHours(lunch.fixedAt.hour, lunch.fixedAt.minute,0,0); return d}}
  ]
  const pushBlock = (proj)=>{
    let mins = proj.minutes
    while(mins>0){
      const nextFixed = fixedSlots.find(f=> f.getStart() > cursor)
      if(nextFixed){
        const untilFixed = Math.round((nextFixed.getStart()-cursor)/60000)
        if(untilFixed <= 0){
          timeline.push({id:nextFixed.id,title:nextFixed.title,minutes:nextFixed.minutes,start:nextFixed.getStart(),end:addMinutes(nextFixed.getStart(), nextFixed.minutes), fixed:true})
          cursor = addMinutes(nextFixed.getStart(), nextFixed.minutes)
          continue
        }
        const take = Math.min(mins, untilFixed)
        timeline.push({id:proj.id,title:proj.title,minutes:take,start:new Date(cursor),end:addMinutes(cursor,take)})
        cursor = addMinutes(cursor, take); mins -= take
      } else {
        timeline.push({id:proj.id,title:proj.title,minutes:mins,start:new Date(cursor),end:addMinutes(cursor, mins)})
        cursor = addMinutes(cursor, mins); mins = 0
      }
    }
  }
  order.forEach(pushBlock)
  fixedSlots.forEach(f=>{ if(!timeline.some(t=>t.id===f.id)){ const s=f.getStart(); timeline.push({id:f.id,title:f.title,minutes:f.minutes,start:s,end:addMinutes(s,f.minutes), fixed:true}) }})
  timeline.sort((a,b)=>a.start - b.start)
  return timeline
}
export default function Schedule({ settings }){
  const date = new Date()
  const day = date.getDay()
  if(day===0) date.setDate(date.getDate()+1)
  if(day===6) date.setDate(date.getDate()+2)
  const timeline = buildScheduleForDate(date, settings)
  return (
    <section>
      <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold">Today's Schedule</h2><div className="text-sm text-gray-500 dark:text-gray-400">{date.toDateString()}</div></div>
      <div className="space-y-3">{timeline.map((b,i)=>(<ProjectCard key={i} block={b} settings={settings} />))}</div>
    </section>
  )
}
