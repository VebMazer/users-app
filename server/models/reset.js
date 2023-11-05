const mongoose = require('mongoose')

const resetSchema = new mongoose.Schema({
  email: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '10m'
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
