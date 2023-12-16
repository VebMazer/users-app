
// Map of sessions held in memory.
const sessions = new Map()

// Assuming entry size is 1kb max. The max total memory size of the session storage is about 2GB.
// In reality entry should be between 100-200 bytes.
const maxSize = 2 * 10**6
let size = 0

let removeExpiredRan = new Date()

const get = session_key => {
    const session = sessions.get(session_key)
    
    if (!session) return null
    
    if (session.expires < Date.now()) {
        removeSession(session_key)
        size--
        return null
    }

    return session
}

const removeRandomEntry = () => {
    const randomKey = Math.floor(Math.random() * size);
    for (let key of sessions) {
        if (randomKey === 0) {
            sessions.delete(key)
            break;
        }
        randomKey--
    }
    size--
}

const add = (session_key, session) => {
    if (size >= maxSize) {
        if (removeExpiredRan < Date.now() + 1000 * 60 * 60 * 24) {
            removeExpired()
            removeExpiredRan = Date.now()
        }
        
        if (size >= maxSize) removeRandomEntry()
    }
    
    sessions.set(session_key, session)
    size++
}

const remove = session_key => {
    sessions.delete(session_key)
    size--
}

const removeExpired = () => {
    for (let [key, session] of sessions) {
        if (session.expires < Date.now()) {
            remove(key)
        }
    }
}

const sessionStorage = {
    get,
    add,
    remove,
    removeExpired
}

module.exports = sessionStorage