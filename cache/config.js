require('dotenv').config()

const port = process.env.PORT
const apiKey = process.env.API_KEY

const cipherKey = process.env.CIPHER_KEY
const initVector = process.env.INIT_VECTOR

module.exports = {
    port,
    apiKey,
    cipherKey,
    initVector
}

