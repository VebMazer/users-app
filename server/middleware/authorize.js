const safeCompare = require('safe-compare')
const Session = require('../models/session')
const messages = require('../utils/messages')

// Authorization header contains the session id and key, which are separated
// by a space. These are parsed and returned as an object.
const parseAuthorization = req => {
  const authString = req.get('authorization')

  if (!authString) return null

  const authValues = authString.split(' ')

  const session_id  = authValues[0]
  const session_key = authValues[1]

  if (!session_id || !session_key) return null

  return { session_id, session_key }
}

// Middleware that checks if the request has a valid session id and key,
// in the authorization header.
const requireAuthorization = async (req, res, next) => {
  try {
      const auth = parseAuthorization(req)

      if (!auth) return res.status(401).json({error: messages.unauthorized})

      const session = await Session.findById(auth.session_id)

      if (!session) return res.status(401).json({error: messages.unauthorized})

      // This is done and always needs to be done with a compare function
      // that is safe from timing attacks.
      if (!safeCompare(session.key, auth.session_key)){
        return res.status(401).json({error: messages.unauthorized})
      }

      if (session.expires < Date.now()) {
        await Session.findByIdAndRemove(session._id)
        
        return res.status(401).json({ error: 'Session has expired.' })
      }

      res.locals.session = session
      
      next()

  } catch (error) { next(error) }
}

// Middleware that ensures that the user making the request
// is an admin. Must be applied after the requireAuthorization
// middleware. (because res.locals.session must be defined)
const userIsAdmin = (req, res, next) => {
  if (!res.locals.session.admin) {
      return res.status(401).json({ error: 'unauthorized user' })
  }
  next()
}

module.exports = {
  requireAuthorization,
  userIsAdmin
}
