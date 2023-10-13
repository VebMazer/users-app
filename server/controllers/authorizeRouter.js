// 1. This router functions as an authorization endpoint. Where other apps
// can check whether or not users have authorization to use the app.
// and if their access level is high enough.
// 2. Also has paths that authorize a user to get a valid token for another
// app.

// Node imports
const axios = require('axios')

// Create router.
const authorizeRouter = require('express').Router();

// Local imports.
const User = require('../models/user')
const App = require('../models/app')
const {
  requireAuthorization, addTokenToBlacklist, getTokenFrom
} = require('../middleware/authorize')


// From here on require valid authorization(token) on all routes.
authorizeRouter.all('*', requireAuthorization)


// Route that authorizes the user to use a specific app,
// that does authorization by itself. Called when the user
// redirected to the login page from another app
// already has a valid token on the users app.
// Returns a key that a client can use to get a token from
// the app defined in the name parameter.
authorizeRouter.get('/app/:name', async (req, res, next) => {
  try {
    const { user } = res.locals
    const name = req.params.name.toLowerCase()
    const token = getTokenFrom(req)

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
        token,
        app_key: app.appKey
      }
    )

    // Get a one time use user_key that allows the redirected user to get,
    // their token from the app.
    const { user_key } = response.data

    // token is used by the user app and the user_key is used by the
    // app that the user will be redirected to.
    res.status(200).send({ user_key, ...User.format(user) })

    // After receiving this response on the frontend, redirect the
    // user to the app's url, with the Authorization header

  } catch (exception) {next(exception)}
})


// Returns user information, for a client with a valid token.
// The simplest way to check that the user has a valid token.
authorizeRouter.get('/', async (req, res, next) => {
  try {
    const { user } = res.locals
    
    res.json(User.format(user))

  } catch (exception) { next(exception) }
})


// Cheks whether the user has a high enough authorization level requested by
// the app.
authorizeRouter.get('/app/:name/:level', async (req, res, next) => {
  try {
    const { user } = res.locals
    let { name, level } = req.params
    level = parseInt(level)

    let access = user.access.find(a => a.appName === name)

    if (!access) {
      // In case the app name is not defined in the token.
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


// User can blacklist their token by logging out so that it
// will no longer function for user authorization.
authorizeRouter.get('/logout', async (req, res, next) => {
  try {

    // Add the token to the blacklist.
    addTokenToBlacklist(req, res, next)

    res.status(200).end()

  } catch (exception) { next(exception) }
})


module.exports = authorizeRouter