const mongoose = require('mongoose')

const resetSchema = new mongoose.Schema({
  email: String,
  expireAt: {
    type: Date,
    default: () => Date.now() + 1000 * 60 * 10 // Expire in 10 minutes.
  }
})

resetSchema.statics.format = (reset) => {
  const { _id, email } = reset

  return {
    _id,
    email
  }
}

const Reset = mongoose.model('Reset', resetSchema)

module.exports = Reset
