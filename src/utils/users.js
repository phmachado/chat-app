const users = []

const addUser = ({ id, username, room }) => {
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data
    if (!username || !room) {
        return {
            error: "'Name' and 'Room' are required."
        }
    }

    // check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // validate username
    if (existingUser) {
        return {
            error: 'This name is already taken.'
        }
    }

    // store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find((user) => user.id === id)
    if (user) return user
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const usersInTheRoom = users.filter((user) => user.room === room)
    if (usersInTheRoom) return usersInTheRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
