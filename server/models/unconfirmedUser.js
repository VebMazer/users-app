const mongoose = require('mongoose')

const unconfirmedUserSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  expireAt: {
    type: Date,
    default: () => Date.now() + 1000 * 60 * 10 // Expire in 10 minutes.
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
