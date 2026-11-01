const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const db = require('./db');

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 800,
        minHeight: 500,
        transparent: true,
        frame: false,
        titleBarStyle: 'hiddenInset',
        roundedCorners: true,
        transparent: true,
        // expose window controls in Windows / Linux
        ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
        vibrancy: 'side-bar',
        visualEffectState: 'active',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    win.loadFile('src/index.html');
    win.webContents.openDevTools();
}


app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) { createWindow(); }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') { app.quit(); }
});

ipcMain.handle('students:getAll', () => db.getStudents());
ipcMain.handle('students:get', (e, id) => db.getStudent(id));
ipcMain.handle('students:add', (e, student) => db.addStudent(student));
ipcMain.handle('students:update', (e, id, student) => db.updateStudent(id, student));
ipcMain.handle('students:delete', (e, id) => db.deleteStudent(id));

ipcMain.handle('lessons:getForStudent', (e, studentId) => db.getLessonsForStudent(studentId));
ipcMain.handle('lessons:getNext', (e, studentId) => db.getNextLesson(studentId));
ipcMain.handle('lessons:add', (e, lesson) => db.addLesson(lesson));
ipcMain.handle('lessons:update', (e, id, lesson) => db.updateLesson(id, lesson));
ipcMain.handle('lessons:delete', (e, id) => db.deleteLesson(id));