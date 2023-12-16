// This router handles all requests that contain user authentication.
// (Requests that require email/username and password.)

// Npm imports.
const bcrypt = require('bcrypt')
const axios = require('axios')
const authenticateRouter = require('express').Router()

// Local imports.
const User = require('../models/user')
const Session = require('../models/session')
const App = require('../models/app')

// Authenticate user without forwarding them to any app.
authenticateRouter.post('/', async (req, res, next) => {
  let { email, password } = req.body

  if (!email)    return res.status(400).json({ error: 'email is missing' })
  if (!password) return res.status(400).json({ error: 'password is missing' })

  email = email.toLowerCase()

  const user = await User.findOne({ email })

  if (!user) {
    // If there does not exist a user with the given email.
    return res.status(401).json({ error: 'invalid email or password' })
  }

  // Compare the body password to the saved password hash of the user.
  const passwordCorrect = await bcrypt.compare(password, user.passwordHash)

  if (!passwordCorrect) {
    // If the password is incorrect.
    return res.status(401).json({ error: 'invalid email or password' })
  }

  // Start a session.
  const session = new Session({
      user: {
          _id: user._id,
          email: user.email
      },
      admin: user.admin,
      access: user.access
  })

  const savedSession = await session.save()
  const session_key = savedSession.key

  // Return the user and the session_key.
  res.status(200).send({ session_key, ...User.format(user) })
})

// Authenticate user and authorize them to use a specific app.
// Returns a key that a client can use to get a session_key from
// the app defined with the name parameter.
authenticateRouter.post('/:name', async (req, res, next) => {
  try {
    let { email, password } = req.body
    const name = req.params.name.toLowerCase()

    const app = await App.findOne({ name })

    if (!app) {
      return res.status(401).json({ error: 'unauthorized app name' })
    }

    if (!email)    return res.status(400).json({ error: 'email is missing' })
    if (!password) return res.status(400).json({ error: 'password is missing' })

    email = email.toLowerCase()

    const user = await User.findOne({ email })

    // If there does not exist an account with this email:
    if (!user) return res.status(401).json({ error: 'invalid email or password' })

    const passwordCorrect = await bcrypt.compare(password, user.passwordHash)

    // If the password is incorrect:
    if (!passwordCorrect) {
      return res.status(401).json({ error: 'invalid email or password' })
    }

    // Start a session.
  const session = new Session({
    user: {
        _id: user._id,
        email: user.email
    },
    admin: user.admin,
    access: user.access
  })

  const savedSession = await session.save()
  const session_key = savedSession.key

    // Confirm to the app that the user has been authenticated.
    const response = await axios.post(
      `${app.url}/api/authorize`,

      // Send the authentication password, so that
      // the app knows its the user app that is sending the request.
      { email, session_key , app_key: app.appKey }
    )

    // Get a one time use user_key that allows the redirected user to get,
    // their session_key from the app.
    const { user_key } = response.data

    // session_key is used by the users app and the user_key is used by the
    // app the user will be redirected to.
    res.status(200).send({ session_key, user_key, ...User.format(user) })

    // After receiving this response on the frontend, redirect the
    // user to the app's url, with the Authorization header

  } catch (exception) {next(exception)}
})


module.exports = authenticateRouter
