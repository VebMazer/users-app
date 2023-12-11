const mongoose = require('mongoose')
const crypto = require('crypto')

const sessionSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    expires: {
        type: Date,
        required: true
    },
    user: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        email: String,
        firstname: String,
        lastname: String,
        admin: Boolean,

    },
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


sessionSchema.statics.format = session => {
    const { expires, access, user } = session
    return {
        expires,
        access,
        user
    }
}

let sessionKeyLength = 100

sessionSchema.statics.generateKey = () => {
    return crypto.randomBytes(sessionKeyLength).toString('hex')
}
