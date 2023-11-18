// This router handles adding and removing app entries to the system.
// Authentication and authorization is only allowed for systems in the
// the database.

const appRouter = require('express').Router()

// Local imports.
const User = require('../models/user')
const App = require('../models/app')

const { requireAuthorization, userIsAdmin } = require('../middleware/authorize')


// Get all public information about the apps.
appRouter.get('/public', async (req, res, next) => {
    try {
        const apps = await App.find({})
        
        res.json(apps.map(App.format))
    
    } catch (exception) { next(exception) }
})

// From here on require valid authorization(token) on all routes.
appRouter.all('*', requireAuthorization)

// From here on require that the user is an admin on all routes.
appRouter.all('*', userIsAdmin)


// Get all information about each app.
appRouter.get('/', async (req, res, next) => {
    try {
        const apps = await App.find({})
        
        res.json(apps)
    
    } catch (exception) { next(exception) }
})


// An admin user can add a new app to the system.
appRouter.post('/', async (req, res, next) => {
    try {
        let { name, url, appKey } = req.body

        if (!name)   return res.status(400).json({ error: 'name is missing' })
        if (!url)    return res.status(400).json({ error: 'url is missing' })
        if (!appKey) return res.status(400).json({ error: 'appKey is missing' })

        name = name.toLowerCase()
        url = url.toLowerCase()

        const app = new App({
            name,
            url,
            appKey
        })

        const savedApp = await app.save()

        res.json(App.format(savedApp))

    } catch (exception) { next(exception) }
})

// An admin user can delete an app.
appRouter.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params

        const deletedApp = await App.findByIdAndRemove(id)

        if (!deletedApp) {
            return res.status(400).json({ error: 'app does not exist' })
        }

        res.json(App.format(deletedApp))

    } catch (exception) { next(exception) }
})


// An admin user can update an app.
appRouter.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        let { name, url, appKey } = req.body

        if (!name && !url && !appKey) {
            return res.status(400).json({ error: 'no fields provided for editing.' })
        }

        if (name) name = name.toLowerCase()
        if (url)  url  = url.toLowerCase()

        const updatedApp = await App.findByIdAndUpdate(id, {
            name,
            url,
            appKey
        }, { new: true })

        if (!updatedApp) {
            return res.status(400).json({ error: 'app does not exist' })
        }

        res.json(updatedApp)
    
    } catch (exception) { next(exception) }
})

module.exports = appRouter