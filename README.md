# Kanban Task Management Board
### Adhivasindo Frontend Test — Ionic React

A fully-featured Kanban task management application built with **Ionic React**, **Zustand**, and **@dnd-kit**.

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| **Ionic React** | UI Framework & Components |
| **React 18** | Frontend Library |
| **Zustand** | State Management |
| **localStorage** | Data Persistence |
| **@dnd-kit** | Drag & Drop |
| **Tailwind CSS** | Utility Styling |
| **SweetAlert2** | Toast Notifications |
| **Vite** | Build Tool |

---

## ✅ Features

### Core
- **Kanban Board** — 5 columns: To Do, Doing, Review, Done, Rework
- **Task Card** — Title, Description, Assignee avatars, Due Date, Label, Priority, Checklist count, Comments
- **CRUD Task** — Create, Read, Update, Delete with confirmation dialog
- **Drag & Drop** — Move tasks between columns (frontend simulation)
- **Checklist / Subtask** — Add, toggle, delete subtasks with auto progress bar
- **Filtering** — Filter by Label, Assignee, Due Date (combinable)
- **Search** — Real-time search by title & description
- **Data Persistence** — Zustand + localStorage (data survives page refresh)

### Bonus
- ✅ **Cover Image** — Upload custom cover image per task
- ✅ **Toast Notifications** — SweetAlert2 toast on create/update/delete
- ✅ **Animations** — Hover effects, drag overlay, smooth transitions
- ✅ **Export/Import** — Export tasks as JSON or CSV, import from JSON
- ✅ **Invite Modal** — Invite team members with email + share link
- ✅ **Responsive** — Desktop & mobile friendly

---

## 📦 Installation & Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Board.tsx          # Kanban board with DnD
│   ├── Header.tsx         # Top navigation + filter + search
│   ├── TaskCard.tsx       # Individual task card
│   └── TaskDetailModal.tsx # Task create/edit modal
├── store/
│   └── taskStore.ts       # Zustand store + localStorage
├── types/
│   └── index.ts           # TypeScript interfaces
└── App.tsx                # Root component
```

---
