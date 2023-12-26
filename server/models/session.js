const mongoose = require('mongoose')
const crypto = require('crypto')
const { cipherKey, initVector } = require('../utils/config')

const sessionSchema = new mongoose.Schema({
    keyHash: {
        type: String,
        required: true,
        unique: true
    },
    expires: {
        type: Date,
        required: true,
        default: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // Expires in 7 days.
    },
    user: {
        // This data gets sent along with authorizaiton requests.
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        email: String,
        firstname: String,
        lastname: String,
    },
    admin: Boolean,
    access: [{
        appName: {
          // Apps name so that access can be checked with just the session_key.
          type: String,
          required: true
        },
        level: {
          type: Number,
          required: true
        }
    }]
})

let sessionKeyLength = 64

const generateKey = () =>
    crypto.randomBytes(sessionKeyLength).toString('hex')

const algorithm = 'aes256'

const encrypt = text => {
    const cipher = crypto.createCipheriv(algorithm, cipherKey, initVector)
    return cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
}
const decrypt = text => {
    const decipher = crypto.createDecipheriv(algorithm, cipherKey, initVector)
    return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8')
}

// Needs to use oldschool function syntax when "this", is used.
sessionSchema.methods.createKey = async function() {
    const key = generateKey()
    this.keyHash = encrypt(key)
    return key
}

// Needs to use oldschool function syntax when "this", is used.
sessionSchema.methods.decryptKey = async function() {
    return decrypt(this.keyHash)
}

sessionSchema.statics.generateKey = generateKey
sessionSchema.statics.encryptKey = key => encrypt(key)
sessionSchema.statics.decryptKey = key => decrypt(key)

sessionSchema.statics.format = session => {
    const { expires, access, user } = session
    return {
        expires,
        access,
        user
    }
}


const Session = mongoose.model('Session', sessionSchema)

module.exports = Session