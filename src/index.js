const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3333

const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

io.on('connection', (socket) => {
    console.log('🆕 WebSocket connection')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) return callback(error)

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', '😀 Welcome to the Chat App!'.toUpperCase()))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `👤 ${user.username} joined the room.`.toUpperCase()))
        io.to(user.room).emit('roomData', {
            room: user.room.toUpperCase(),
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (typedMsg, callback) => {
        const filter = new Filter()

        if (filter.isProfane(typedMsg)) {
            return callback('❌ Profanity is not allowed!')
        }
        
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, typedMsg))
        callback()
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps?q=${location.lat},${location.long}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `↩️ ${user.username} left the room.`.toUpperCase()))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    

    })
    
})

server.listen(port, () => {
    console.log(`🌎 Server is up on port ${port}.`)
})
