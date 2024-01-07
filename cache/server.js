const express = require('express')
const { authorize, requestLogger, errorHandler } = require('./middleware')

// Map of sessions held in memory.
// { id: Session }
const sessions = new Map()
// Assuming entry size is 1kb max. The max total memory size of the session storage is about 2GB.
// In reality entry should be between 100-200 bytes.
const maxSize = 2 * 10**6

// Current total size of the session storage.
let size = 0

// used to time the removal of expired sessions.
let removeExpiredRan = new Date()

const remove_session = id => {
    sessions.delete(id)
    size--
}

const removeExpired = () => {
    for (let [id, session] of sessions) {
        if (session.expires < Date.now()) {
            remove_session(id)
        }
    }
}

const removeRandomEntry = () => {
    const randomKey = Math.floor(Math.random() * size);
    for (let id of sessions) {
        if (randomKey === 0) {
            remove_session(id)
            return
        }
        randomKey--
    }
}

const server = express()

server.use(express.urlencoded({ extended: false }))
server.use(express.json())
server.use(requestLogger) // ToDo: Only use this in dev mode.

server.get('/health', (req, res) => {
  res.json({ message: 'users-cache is running' })
})

server.use(authorize)

server.get('/:id', (req, res) => {
    try {
        const { id } = req.params

        const session = sessions.get(id)

        if (!session) return res.status(404).json({error: 'not found'})
    
        if (session.expires < Date.now()) {
            remove(id)
            return res.status(410).json({error: 'session has expired.'})
        }

        res.json(session)

    } catch(exception) {next(exception)}
})

server.post('/', (req, res) => {
    try {
        const { session } = req.body
        
        if (!session) return res.status(400).json({error: 'session is missing'})

        if (size >= maxSize) {
            if (removeExpiredRan < Date.now() + 1000 * 60 * 60 * 24) {
                removeExpired()
                removeExpiredRan = Date.now()
            }
            
            if (size >= maxSize) removeRandomEntry()
        }
        
        sessions.set(session._id, session)
        size++

        res.status(201).json({message: 'added'})

    } catch(exception) {next(exception)}
})

server.use(errorHandler)

module.exports = server