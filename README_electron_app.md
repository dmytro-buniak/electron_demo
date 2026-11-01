<div align="center">

# 📚 Lesson Roster

**A desktop app for keeping track of students, lessons and homework.**
Built with Electron, SQLite and plain JavaScript.

![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Status](https://img.shields.io/badge/status-work%20in%20progress-orange?style=for-the-badge)

<br>

<img src="docs/screenshot-main.png" alt="Lesson Roster main window" width="85%">

</div>

<!-- Screenshot tip: take it with the demo data loaded, in a window of about 1200 x 750 px,
     and save it as docs/screenshot-main.png. A second image (search or calendar) can go in the Gallery section. -->

---

## ✨ Features

| | Feature | Details |
|---|---|---|
| 👥 | **Student cards** | Every student has a card with their name and notes, kept in a scrollable list. |
| 🔎 | **Instant search** | Search by first name or surname. Results open in a panel that shrinks and expands on hover. |
| 🗓️ | **Quick lesson actions** | A roll-out menu on each card shows the next lesson, adds a lesson, or shows the homework. |
| ➕ | **Add a lesson** | Pick a date with a date picker. The app refuses to store the same date twice for one student. |
| 📆 | **Calendar** | A month grid with the current day highlighted and a popup per day. *(in progress)* |
| 💾 | **Local database** | All data lives in a local SQLite file, with no account and no network needed. |

## 🧱 How it works

The interface never touches the database directly. It talks to the main process through a small bridge (`window.api`), and the main process runs the SQL.

```mermaid
flowchart LR
    UI["Renderer<br/>HTML, CSS, JavaScript"] -- "window.api" --> BR["Preload bridge"]
    BR -- IPC --> MAIN["Main process<br/>Electron"]
    MAIN -- SQL --> DB[("SQLite")]
```

The bridge exposes a few calls such as `getStudents`, `addStudent`, `addLesson`, `getNextLesson` and `getLessonsForStudent`.

## 🛠️ Tech stack

- **Electron** for the desktop shell
- **SQLite** (`better-sqlite3`) for storage
- **Vanilla JavaScript**, with async/await for all database calls
- **HTML5 and CSS3**, with the styles split by purpose (variables, blocks, buttons)

## 🚀 Getting started

You need [Node.js](https://nodejs.org/) (a current LTS version) and Git.

```bash
git clone https://github.com/dmytro-buniak/<repo-name>.git
cd <repo-name>
npm install
npm start
```

> **Heads-up:** `better-sqlite3` is a native module. If you see a `NODE_MODULE_VERSION` error on start, rebuild it for Electron with `npx electron-rebuild`.

The first launch creates a fresh database and fills it with **demo students**. They are fictional characters, and no real personal data is in this repository.

## 📁 Project structure

```
.
├── main.js          # Electron main process, database access
├── preload.js       # the window.api bridge
├── renderer.js      # UI logic: cards, search, popups, calendar
├── index.html
├── css/             # variables, blocks, buttons
└── docs/            # screenshots
```

<!-- Adjust the file names to match your repo. -->

## 🗺️ Roadmap

- [x] Student list with notes
- [x] Search by name
- [x] Next lesson, homework and add-lesson popups
- [ ] Show scheduled lessons inside the calendar *(in progress)*
- [ ] Edit and delete students and lessons

## 📝 About this project

I built Lesson Roster to learn how a desktop app fits together: a real database, a safe bridge between the interface and the data, and a UI written without a framework. This public edition uses demo data only. I'm still working on it, and the calendar is the next feature.

## 📄 License

MIT. See [LICENSE](LICENSE). <!-- Add a LICENSE file, or remove this section. -->

---

<div align="center">

Made by [Dmytro Buniak](https://github.com/dmytro-buniak)

</div>
