const mongoose = require('mongoose')
const crypto = require('crypto')

let sessionKeyLength = 64

const generateKey = () => {
    return crypto.randomBytes(sessionKeyLength).toString('hex')
}

const sessionSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        default: generateKey(),
        unique: true
    },
    expires: {
        type: Date,
        required: true,
        default: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // Expires in 7 days.
    },
    user: {
        // This data gets sent along with authorization requests.
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
          // Apps name so that access can be checked easily.
          type: String,
          required: true
        },
        level: {
          type: Number,
          required: true
        }
    }]
})


// Needs to use oldschool function syntax if "this", is used.
sessionSchema.methods.updateKey = function updateKey() {
    this.key = generateKey()
}

sessionSchema.statics.generateKey = generateKey

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