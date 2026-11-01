const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld('api', {
    getStudents: () => ipcRenderer.invoke('students:getAll'),
    getStudent: (id) => ipcRenderer.invoke('students:get', id),
    addStudent: (student) => ipcRenderer.invoke('students:add', student),
    updateStudent: (id, student) => ipcRenderer.invoke('students:update', id, student),
    deleteStudent: (id) => ipcRenderer.invoke('students:delete', id),

    getLessonsForStudent: (studentId) => ipcRenderer.invoke('lessons:getForStudent', studentId),
    getNextLesson: (studentId) => ipcRenderer.invoke('lessons:getNext', studentId),
    addLesson: (lesson) => ipcRenderer.invoke('lessons:add', lesson),
    updateLesson: (id, lesson) => ipcRenderer.invoke('lessons:update', id, lesson),
    deleteLesson: (id) => ipcRenderer.invoke('lessons:delete', id)
});