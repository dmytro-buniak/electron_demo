const path = require('node:path');
const { app } = require('electron');
const Database = require('better-sqlite3');

const dbPath = path.join(app.getPath('C:\Users\dmitr\Documents\electron_apps\portfolio_demo\database'), 'database.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON'); // for ON DELETE CASCADE to actually work

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    lesson_date TEXT NOT NULL,
    homework TEXT,
    notes TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  );
`);

module.exports = {
    getStudents: () => db.prepare('SELECT * FROM students ORDER BY name').all(),
    getStudent: (id) => db.prepare('SELECT * FROM students WHERE id = ?').get(id),
    addStudent: (student) =>
        db.prepare('INSERT INTO students (name, phone, email, notes) VALUES (@name, @phone, @email, @notes)')
            .run({ phone: null, email: null, notes: null, ...student }).lastInsertRowid,
    updateStudent: (id, student) =>
        db.prepare('UPDATE students SET name=@name, phone=@phone, email=@email, notes=@notes WHERE id=@id')
            .run({ ...student, id }),
    deleteStudent: (id) => db.prepare('DELETE FROM students WHERE id = ?').run(id),

    getLessonsForStudent: (studentId) =>
        db.prepare('SELECT * FROM lessons WHERE student_id = ? ORDER BY lesson_date').all(studentId),
    getNextLesson: (studentId) =>
        db.prepare(`SELECT * FROM lessons WHERE student_id = ? AND completed = 0 ORDER BY lesson_date DESC, id DESC LIMIT 1`).get(studentId),
    addLesson: (lesson) =>
        db.prepare('INSERT INTO lessons (student_id, lesson_date, homework, notes, completed) VALUES (@student_id, @lesson_date, @homework, @notes, @completed)')
            .run({ homework: null, notes: null, completed: 0, ...lesson }).lastInsertRowid,
    updateLesson: (id, lesson) =>
        db.prepare('UPDATE lessons SET lesson_date=@lesson_date, homework=@homework, notes=@notes, completed=@completed WHERE id=@id')
            .run({ ...lesson, id }),
    deleteLesson: (id) => db.prepare('DELETE FROM lessons WHERE id = ?').run(id),
};