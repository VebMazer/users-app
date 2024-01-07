const safeCompare = require('safe-compare')

// Map of sessions held in memory.
// { id: Session }
const sessions = new Map()

// Assuming entry size is 1kb max. The max total memory size of the session storage is about 2GB.
// In reality entry should be between 100-200 bytes.
const maxSize = 2 * 10**6
let size = 0

let removeExpiredRan = new Date()

const get = (id, key) => {
    
    const session = sessions.get(id)
    
    if (!session) return null

    if (!safeCompare(session.key, key)) return false
    
    if (session.expires < Date.now()) {
        remove_hash(key_hash)
        return null
    }

    return session
}

const removeRandomEntry = () => {
    const randomKey = Math.floor(Math.random() * size);
    for (let keyHash of sessions) {
        if (randomKey === 0) {
            remove_hash(keyHash)
            return
        }
        randomKey--
    }
}

const add = (session_key, session) => {
    if (size >= maxSize) {
        if (removeExpiredRan < Date.now() + 1000 * 60 * 60 * 24) {
            removeExpired()
            removeExpiredRan = Date.now()
        }
        
        if (size >= maxSize) removeRandomEntry()
    }

    key_hash = encrypt(session_key)
    
    sessions.set(key_hash, session)
    size++
}

const remove_hash = session_key_hash => {
    sessions.delete(session_key_hash)
    size--
}

const remove_key = session_key => {
    key_hash = encrypt(session_key)
    sessions.delete(key_hash)
    size--
}

const removeExpired = () => {
    for (let [keyHash, session] of sessions) {
        if (session.expires < Date.now()) {
            remove_hash(keyHash)
        }
    }
}

const sessionStorage = {
    get,
    add,
    remove_hash,
    remove_key,
    removeExpired
}

module.exports = sessionStorage