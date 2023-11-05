const mongoose = require('mongoose')

const unconfirmedUserSchema = new mongoose.Schema({
  email: String,
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
