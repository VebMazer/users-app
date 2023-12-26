require('dotenv').config()

const port = process.env.PORT

// Email used for sending password reset links.
const email = process.env.SERVICE_EMAIL
const emailPW = process.env.SERVICE_EMAIL_APP_KEY

// URL of this app.
let url = process.env.URL_DEV

const environment = process.env.NODE_ENV

// Development mode is default.
let mongoUrl = process.env.MONGODB_URI_DEV


if (environment === 'test'){
  mongoUrl = process.env.MONGODB_URI_TEST

} else if (environment === 'production') {
  mongoUrl = process.env.MONGODB_URI_PROD
  url = process.env.URL_PROD
}

const cipherKey = process.env.CIPHER_KEY
const initVector = process.env.INIT_VECTOR


module.exports = {
  mongoUrl,
  port,
  email,
  emailPW,
  url,
  environment,
  cipherKey,
  initVector
}
