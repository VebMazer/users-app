const mongoose = require('mongoose')

const { jwtSecret } = require('../utils/config')

const { ObjectId } = mongoose.Schema.Types

const userSchema = new mongoose.Schema({
  email: {
    type: String,
        required: true,
        unique: true,
        minlength: 3,
        validate: {
            validator: v => {
              return /.{1,}@.{1,}\..{1,}/.test(v)
            },
            message: props => `${props.value} is not a valid email!`
        }
  },
  firstname: String,
  lastname: String,
  passwordHash: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    default: false
  },
  access: [{
    appName: {
      // With this access can be checked with just the session_key.
      type: String,
      required: true
    },
    level: {
      type: Number,
      required: true
    }
  }]
})

userSchema.statics.format = user => {
  const { _id, email, firstname, lastname, admin, access } = user

  return {
    _id,
    email,
    firstname,
    lastname,
    admin,
    access
  }
}

const User = mongoose.model('User', userSchema)

module.exports = User
