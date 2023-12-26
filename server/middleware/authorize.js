const Session = require('../models/session')

// Middleware that checks if the request has a valid session_key, in the authorization header.
const requireAuthorization = async (req, res, next) => {
  try {
      const session_key = req.get('authorization')

      if (!session_key) {
          return res.status(401).json({ error: 'authorization header missing.' })
      }

      const session_key_hash = Session.encryptKey(session_key)
      const session = await Session.findOne({ keyHash: session_key_hash })

      if (!session) {
        return res.status(401).json({ error: 'invalid session_key.' })
      }

      if (session.expires < Date.now()) {
        await Session.findOneAndRemove({ key: session_key })
        
        return res.status(401).json({ error: 'session has expired.' })
      }

      res.locals.user = {
        _id:    session.user._id,
        email:  session.user.email,
        admin:  session.admin,
        access: session.access
      }

      next()

  } catch (error) { next(error) }
}

// Middleware that ensures that the user making the request
// is an admin. Must be applied after the requireAuthorization
// middleware. (because res.locals.user must be defined)
const userIsAdmin = (req, res, next) => {
  if (!res.locals.user.admin) {
      return res.status(401).json({ error: 'unauthorized user' })
  }
  next()
}

module.exports = {
  requireAuthorization,
  userIsAdmin
}
