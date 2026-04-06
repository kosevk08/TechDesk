const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'self' http://localhost:8080 https://techdesk-backend.onrender.com ws://localhost:3000 wss://techdesk-frontend.onrender.com https://fonts.googleapis.com https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com");
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/student', (req, res) => res.sendFile(path.join(__dirname, 'views', 'student.html')));
app.get('/teacher', (req, res) => res.sendFile(path.join(__dirname, 'views', 'teacher.html')));
app.get('/parent', (req, res) => res.sendFile(path.join(__dirname, 'views', 'parent.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin.html')));
app.get('/notebook', (req, res) => res.sendFile(path.join(__dirname, 'views', 'notebook.html')));
app.get('/attendance', (req, res) => res.sendFile(path.join(__dirname, 'views', 'attendance.html')));
app.get('/messages', (req, res) => res.sendFile(path.join(__dirname, 'views', 'messages.html')));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('draw-stroke', (data) => { socket.broadcast.emit('draw-stroke', data); });
    socket.on('clear-canvas', (data) => { socket.broadcast.emit('clear-canvas', data); });
    socket.on('page-change', (data) => { socket.broadcast.emit('page-change', data); });
    socket.on('private-message', (data) => { socket.broadcast.emit('private-message', data); });
    socket.on('group-message', (data) => { socket.broadcast.emit('group-message', data); });
    socket.on('class-message', (data) => { socket.broadcast.emit('class-message', data); });
    socket.on('announcement', (data) => { socket.broadcast.emit('announcement', data); });
    socket.on('attendance-updated', (data) => { socket.broadcast.emit('attendance-updated', data); });
    socket.on('test-assigned', (data) => { socket.broadcast.emit('test-assigned', data); });
    socket.on('test-submitted', (data) => { socket.broadcast.emit('test-submitted', data); });
    socket.on('test-graded', (data) => { socket.broadcast.emit('test-graded', data); });
    socket.on('grade-updated', (data) => { socket.broadcast.emit('grade-updated', data); });

    socket.on('disconnect', () => { console.log('User disconnected:', socket.id); });
});

server.listen(3000, () => {
    console.log('Frontend running on http://localhost:3000');
});