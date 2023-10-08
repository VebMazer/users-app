const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { jwtSecret } = require('../config')

// 1. Tokens are added on the blacklist when a user logs out.
// 2. They are removed from the blacklist when they expire.
// 3. Currently the blacklist is only kept in memory not
// in the database, so the data in it is lost when the
// server is restarted.
// 4. The token expiration time should be short enough so
// that the system doesent rely on this list too much.
// key: token, value: Date variable with the expiration time.
let tokenBlacklist = []
let nextPrune = Date.now()

// Remove expired tokens from the tokenStorage.
const pruneTokenBlacklist = () => {
 
  // Dont run the function if it has been run in the last 6 hours.
  if (Date.now() < nextPrune) return
  
  // Remove expired tokens from the tokenBlacklist.
  // verifying an expired token throws an error which is used
  // in filtering them.
  tokenBlacklist = tokenBlacklist.filter(token => {
    try {
      jwt.verify(token, jwtSecret)
      return true
    
    } catch (error) { return false }
  })

  // Prune the blacklist once every 6 hours.
  nextPrune = Date.now() + 1000 * 60 * 60 * 6
}

const addTokenToBlacklist = (req, res, next) => {
  try {
    const token = getTokenFrom(req)
  
    tokenBlacklist.push(token)
  
  } catch (error) { processTokenErrors(error, req, res, next) }
}


// Parse the token out of the authorization header.
const getTokenFrom = req => {
  const authorization = req.get('authorization')

  // String 'bearer ' is removed from the authorization header,
  // if it exists.
  if (authorization &&
      authorization.toLowerCase().startsWith('bearer ')
  
  ) return authorization.substring(7)

  return null
}

const processTokenErrors = (error, req, res, next) => {
  if (error.name === 'TokenExpiredError') {
    console.log('User token has expired!')
    
    return res.status(401).json({ error: 'token expired' })
  
  } else if (error.name === 'JsonWebTokenError') {
    console.log('error.message:', error.message)
    
    return res.status(401).json({ error: error.message })
  
  } else return next(error)
}


// More efficient way to return the user data to the client.
// It does not require a database query. If this is used however
// the user access rights only update once the user logs out
// and logs back in or when the token expires.
const setUserUsingToken = (decodedToken, res) => {
  res.locals.user = {
    _id:    decodedToken._id,
    email:  decodedToken.email,
    firstname: decodedToken.firstname,
    lastname: decodedToken.lastname,
    admin:  decodedToken.admin,
    access: decodedToken.access
  }
}

// Getting the user information from the database, requires
// a database request. This would run for every app request
const setUserUsingDatabase = async (decodedToken, res, next) => {
  try {
  const user = await User.findById(decodedToken._id)
  
    res.locals.user = {
      _id:    user._id,
      email:  user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      admin:  user.admin,
      access: user.access
    }
  } catch (error) { next(error) }
}

// Middleware that checks if the request has a valid token, in the authroziation header.
const requireAuthorization = async (req, res, next) => {
  try {
      // Check if it is time to prune the tokenBlacklist.
      pruneTokenBlacklist()

      // Parse the token from the authorization header
      const token = getTokenFrom(req)

      if (!token) {
          return res.status(401).json({ error: 'token missing or too short' })
      }

      // Check if the token is on the blacklist.
      if (tokenBlacklist.includes(token)) {
        return res.status(401).json({ error: 'invalid token user has logged out.' })
      }

      let decodedToken = {}

      decodedToken = jwt.verify(token, jwtSecret)

      if (!decodedToken._id) {
          return res.status(401).json({ error: 'invalid token' })
      }

      // Add the user data to the response locals, so that
      // it can be used when checking user access rights.
      setUserUsingToken(decodedToken, res)
      
      // replace the above with the line below to use the database
      // instead of the token, so that access right updates are
      // immediately available. This will add to the total response
      // time of every app request in the intranet/portal network.
      //await setUserUsingDatabase(decodedToken, res, next)

      next()

  } catch (error) { processTokenErrors(error, req, res, next) }
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
  addTokenToBlacklist,
  getTokenFrom,
  requireAuthorization,
  userIsAdmin
}
