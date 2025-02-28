const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const { generatemsg, generateLocation } = require('./utils/messages')

const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = process.env.PORT || 3000

const publicdir = path.join(__dirname, '../public')

app.use(express.static(publicdir))

io.on("connection", (socket) => {
    console.log("new connection")

    socket.on("join", ({ username, room }, cb) => {

        const { error, user } = addUser({ id: socket.id, username, room})

        if (error) {
            return cb(error)
        }
        

        socket.join(user.room)
        socket.emit("message", generatemsg(`${user.username}, welcome! You will be using ${user.displayName} in this chat room`))
        socket.broadcast.to(user.room).emit("message", generatemsg(`Admin ${user.displayName} has joined!`))

        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUserInRoom(user.room),
            username: user.username
        })
        cb()
    })

    socket.on("sendMessage", (msg, cb) => {
        const user = getUser(socket.id)
        io.to(user.room).emit("message", generatemsg(user.displayName, msg))
        cb()
    })

    socket.on("sendLocation", (location, cb) => {
        const user = getUser(socket.id)
        console.log(user)
        io.to(user.room).emit("locationurl", generateLocation(user.displayName, `https://www.google.com/maps?q=${location.latitude},${location.longitude}`))
        cb()
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id)
        console.log(user)
        if (user) {
            io.to(user.room).emit("message", generatemsg(`Admin ${user.displayName} A user has left`))

            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUserInRoom(user.room),
                username: user.username
            })
        }

    })


})
server.listen(PORT, () => {
    console.log("server is up at " + PORT)
})