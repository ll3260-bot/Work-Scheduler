# 🚀 Focus Planner

Focus Planner is a modern React + Vite + Tailwind CSS productivity dashboard that helps you manage your workday with **Pomodoro timers, rotating projects, dark mode, and task tracking**.

---

## ⚙️ Installation & Local Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/focus-planner.git
cd focus-planner
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the app locally**

```bash
npm run dev
```

4. **Build for production**

```bash
npm run build
```

---

## 🌐 Netlify Deployment

Focus Planner is pre-configured for Netlify:

- **Build command:** `npm run build`  
- **Publish directory:** `dist`  

Simply link your GitHub repository in Netlify and deploy. Your site will update automatically on push.

---

## 🧩 Features

### 1. Work Schedule

- Weekdays **8:00 AM – 6:00 PM**
- **Daily Tasks:** 10 minutes at the start of the day
- **Breaks:**
  - 30-minute break at 1:00 PM
  - 1-hour lunch at 3:45 PM
- **Project blocks:**
  - Project 1 → 30%
  - Project 2 → 30%
  - Project 3 → 40%
- **Automatic rotation** of project order each day
- Start/end times are displayed for all blocks

### 2. Pomodoro Timer

- Configurable **focus** and **break durations**
- **Controls:** Start, Pause, Reset
- **Sound alerts** for start/end of Pomodoro
- **Mark Pomodoros** as Completed / Not Completed
- Each project block uses Pomodoro cycles
- Progress **saved to localStorage**

### 3. Projects & Tasks

- Each project is displayed as a **card** with:
  - Project name
  - Color theme (customizable)
  - Task checklist
  - Pomodoro progress ring
- **Check off tasks** as you complete them
- Persistent storage ensures progress is remembered

### 4. Dark Mode

- Toggle between light and dark mode
- Smooth transitions
- Saves preference to localStorage

### 5. Settings Modal

- Adjust Pomodoro focus and break lengths
- Enable/disable sound alerts
- Reset all progress if needed

### 6. UI & Animations

- **Tailwind CSS** for clean, modern styling
- **Framer Motion** for smooth animations
- Rounded corners, soft shadows, responsive design

---

## 💾 Data Persistence

All user settings and progress (Pomodoros, tasks, color themes, dark mode) are **stored in localStorage**.  
Close or refresh the browser, and your progress remains intact.

---

## 📝 Usage Tips

1. **Start the day:** Begin with the Daily Tasks card.
2. **Work on projects:** Follow the rotated order and Pomodoro cycles.
3. **Use breaks:** Take scheduled breaks to maximize focus.
4. **Check tasks off:** Complete subtasks and mark Pomodoros as done.
5. **Adjust settings:** Use the ⚙️ settings modal to customize timers and sound.
6. **Dark mode:** Toggle as needed for comfort during long sessions.

---

Made with ❤️ using React, Tailwind, Framer Motion, and Vite.
