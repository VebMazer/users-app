const mongoose = require('mongoose')

const unconfirmedUserSchema = new mongoose.Schema({
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
  passwordHash: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '20m'
  }
})

unconfirmedUserSchema.statics.format = unconfirmedUser => {
  const { _id, email } = unconfirmedUser

  return {
    _id,
    email
  }
}

const UnconfirmedUser = mongoose.model('UnconfirmedUser', unconfirmedUserSchema)

module.exports = UnconfirmedUser
