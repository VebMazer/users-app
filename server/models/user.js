const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const { secret } = require('../config')

const { ObjectId } = mongoose.Schema.Types

const userSchema = new mongoose.Schema({
  email: {
    type: String,
        required: true,
        unique: true,
        minlength: 3,
        validate: {
            validator: v => {
              return /.{2,}@.{2,}\..{2,}/.test(v)
            },
            invite: props => `${props.value} is not a valid email!`
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
    service: {
      type: ObjectId,
      ref: 'Service',
    },
    level: {
      type: Number,
      required: true
    }
  }]
})

// Needs to use oldschool function syntax to access "this".
userSchema.methods.generateJWT = function generateJWT() {
  return jwt.sign({
    _id: this._id,
    email: this.email,
    firstname: this.firstname,
    lastname: this.lastname,
    admin: this.admin,
    access: this.access
  }, secret,
  { expiresIn: '2d' })
}

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
