// 1. This router functions as an authorization endpoint. Where other apps
// can check whether or not users have authorization to use the app.
// and if their access level is high enough.
// 2. Also has paths that authorize a user to get a valid session_key for
// another app.

// Node imports
const axios = require('axios')

// Create router.
const authorizeRouter = require('express').Router();

// Local imports.
const User = require('../models/user')
const Session = require('../models/session')
const App = require('../models/app')
const { requireAuthorization } = require('../middleware/authorize')


// From here on require valid authorization(session_key) on all routes.
authorizeRouter.all('*', requireAuthorization)


// Route that authorizes the user to use a specific app,
// that does authorization by itself. Called when the user is
// redirected to the login page from another app and
// already has a valid session_key on the users app.
// Returns a key that a client can use to get a session_key from
// the app defined in the name parameter.
authorizeRouter.get('/app/:name', async (req, res, next) => {
  try {
    const { user } = res.locals
    const name = req.params.name.toLowerCase()
    const session_key = req.get('authorization')

    const app = await App.findOne({ name })
    
    if (!app) {
      return res.status(401).json({ error: 'unauthorized app name' })
    }

    // Confirm to the app that the user has been authenticated.
    const response = await axios.post(
      `${app.url}/api/authorize`,

      // Send the authentication password, so that
      // the app knows its the user app that is sending the request.
      {
        email: user.email,
        session_key,
        app_key: app.appKey
      }
    )

    // Get a one time use user_key that allows the redirected user to get,
    // their session_key from the app.
    const { user_key } = response.data

    // session_key is used by the user app and the user_key is used by the
    // app that the user will be redirected to.
    res.status(200).send({ user_key, ...User.format(user) })

    // After receiving this response on the frontend, redirect the
    // user to the app's url, with the Authorization header

  } catch (exception) {next(exception)}
})


// Returns user information, for a client with a valid session.
authorizeRouter.get('/', async (req, res, next) => {
  try {
    const { user } = res.locals
    
    res.json(User.format(user))

  } catch (exception) { next(exception) }
})


// Cheks whether the user has high enough authorization level
// for the requested app.
authorizeRouter.get('/app/:name/:level', async (req, res, next) => {
  try {
    const { user } = res.locals
    let { name, level } = req.params
    level = parseInt(level)

    let access = user.access.find(a => a.appName === name)

    if (!access) {
      // In case the app name is not defined in the session.
      // This can probably be removed eventually.
      const app = await App.findOne({ name })

      if (!app) {
        return res.status(401).json({ error: 'The app does not exist.'})
      }

      // Find and access entry for the app from the list if it exists.
      access = user.access.find(a => app._id.equals(a.app))
    }

    if (!access) {
      return res.status(401).json({
        error: 'The user has no access level on this app.'
      })
    }

    if (access.level < level) {
      return res.status(401).json({
        error: 'The user does not have a high enough access level on this app.'
      })
    }

    res.json(User.format(user))

  } catch (exception) { next(exception) }
})


// User can logout which will remove the session from the database,
// making related id and key invalid for authorizing future requests.
authorizeRouter.get('/logout', async (req, res, next) => {
  try {
    await Session.findByIdAndRemove(res.locals.session._id)

    res.status(204).end()

  } catch (exception) { next(exception) }
})


module.exports = authorizeRouter