const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')

const userRouter = require('express').Router()

const User = require('../models/user')
const UnconfirmedUser = require('../models/unconfirmedUser')
const App = require('../models/app')

const { requireAuthorization, userIsAdmin } = require('../middleware/authorize')
const config = require('../config.js')


// Validate password, to contain at least one number, one lowercase letter,
// one uppercase letter and to be at least 10 characters long.
const validatePassword = password => {
  let valid = password.length >= 10

  if (valid) valid = /\d/.test(password)

  if (valid) valid = /[a-z]/.test(password)
                  || /å/.test(password)
                  || /ä/.test(password)
                  || /ö/.test(password)

  if (valid) valid = /[A-Z]/.test(password)
                  || /Å/.test(password)
                  || /Ä/.test(password)
                  || /Ö/.test(password)

  return valid
}

const addAccessLevel = async (user, level) => {
  try {
    const apps = await App.find({})

    user.access = apps.map(app => ({
      app: app._id,
      level,
      name: app.name
    }))

  } catch (exception) { next(exception) }
}

// User registration path. Create an Unconfirmed user and send a confirmation email.
userRouter.post('/', async (req, res, next) => {
  try {
    let { email, password } = req.body
    
    if (!email)    return res.status(400).json({ error: 'email is missing' })
    if (!password) return res.status(400).json({ error: 'password is missing' })

    email = email.toLowerCase()

    let existingUser = await User.findOne({ email })
    
    if (existingUser) return res.status(409).json({
      error: 'Email is already in use.'
    })

    existingUser = await UnconfirmedUser.findOne({ email })

    if (existingUser) return res.status(409).json({
      error: 'Email is already in use, but remains unconfirmed.'
    })
    

    if(config.environment === 'production' && !validatePassword(password)) {
      return res.status(400).json({
        error: 'password must be at least 10 characters long and contain at least one number, one lowercase letter and one uppercase letter.'
      })
    }

    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email,
        pass: config.emailPW
      }
    })
    
    const unconfirmedUser = new UnconfirmedUser({
      email,
      passwordHash
    })

    const savedUnconfirmedUser = await unconfirmedUser.save()

    const confirmationLink =
      `${config.url}/api/users/confirm/${savedUnconfirmedUser._id}`

    const mailObject = {
      from:     config.email,
      to:       email, // can also be a list of emails.
      subject: `Account email confirmation`,
      html: `<h3> Account email confirmation </h3>
       <p>Please confirm your email to create your account by pressing the link below</p>
       <a href="${confirmationLink}">${confirmationLink}</a>
       <p>The link is valid for 10 minutes.</p>`
    }

    transporter.sendMail(mailObject, function (err, info) {
      if (err) {
        console.log(err)
        
        res.status(500).json({ error: 'Sending confirmation email failed.' })
      
      } else {
        console.log(info)
        
        res.status(201).json({ message: `A confirmation email was sent to: ${email}` })
      }
    })

  } catch (exception) { next(exception) }
})

// Call this route on the link in the confirmation email.
userRouter.get('/confirm/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    // Todo: Create the user and delete the UnconfirmedUser.
    const unconfirmedUser = await UnconfirmedUser.findByIdAndRemove(id)

    
    if (!unconfirmedUser) {
      // Note: We might want to block addresses that try to confirm many
      //       times with an id that is not in the database.

      return res.status(401).json({error: `Cannot find unconfirmed user with id: ${id}`})
    }

    const { email, passwordHash } = unconfirmedUser

    const user = new User({
      email,
      passwordHash
    })

    const savedUser = await user.save()

    // Redirect the user to the login page.
    res.redirect(`${config.url}/confirmed`)

  } catch (exception) { next(exception) }
})

// From here on require authentication on all routes.
userRouter.all('*', requireAuthorization)

// A Client with a valid token can get their user data.
userRouter.get('/', async (req, res, next) => {
  try {
    let { _id } = res.locals.user

    // Fetch user to make sure that the user received is up to date.
    const user = await User.findById(_id)

    if (!user) return res.status(401).json({
      error: `Cannot find user with id: ${_id}`
    })

    res.json(User.format(user))

  } catch (exception) { next(exception) }
})


// From here on require that the user is an admin on all routes.
userRouter.all('*', userIsAdmin)


// Get all users.
userRouter.get('/all', async (req, res, next) => {
  try {
    const users = await User.find({})

    res.json(users.map(User.format))

  } catch (exception) { next(exception) }
})


// Delete a user.
userRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await User.findById(id)

    if (!user) return res.status(401).json({
      error: `Cannot find user with id: ${id}`
    })

    await User.findByIdAndRemove(id)

    res.status(204).end()

  } catch (exception) { next(exception) }
})


// An admin user can update any users admin and access rights.
userRouter.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    let { admin, access, firstname, lastname } = req.body
    
    if (!admin && !access && !firstname && !lastname) {
      return res.status(400).json({ error: 'No valid fields to update.'})
    }
    console.log('1:',access)
    // If an access level is marked 0, remove it from the list.
    if (access) access = access.filter(a => a.level != 0)
    console.log('2:', access)

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { admin, access, firstname, lastname },
      { new: true }
    )

    if (!updatedUser) {
      return res.status(400).json({ error: 'User does not exist.' })
    }

    res.json(User.format(updatedUser))

  } catch (exception) { next(exception) }
})


module.exports = userRouter
