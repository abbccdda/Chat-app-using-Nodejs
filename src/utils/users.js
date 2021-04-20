const users = []
const newuser = []

const randomUsernames = []
const lineReader = require('line-reader');
lineReader.eachLine('./resources/random-usernames.dat', function(line) {
    randomUsernames.push(line)
});

const addUser = ({ id, username, room}) => {
    //clean the data

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    //check for existing users
    const existingUser = users.find((user) => {
        return user.room == room && user.username == username
    })

    //validate username
    if (existingUser) {
        return {
            error: "username ${userName} already used"
        }
    }

   
    var displayName = null
    while (displayName == null) {
        const randIndex = Math.floor(Math.random() * randomUsernames.length)
        const newDisplayName = randomUsernames[randIndex]
        const nameUsedUsers = users.find((user) => {
            return user.displayName == newDisplayName
        })    

        if (!nameUsedUsers) {
            displayName = newDisplayName
        }
    }

    //store user
    const user = { id, username, displayName, room }

    users.push(user)
    
    return { user }
}


const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => {
        return user.id === id
    })
}

const getUserInRoom = (room) => {
    const u = []
    users.filter((user) => {

        user.room === room
    })
    console.log(users)
    return users

}

module.exports = {
    addUser, removeUser, getUser, getUserInRoom
}