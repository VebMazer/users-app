mongoose = require('mongoose')

const appSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    url: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    appKey: {
        // The users app identifies itself to the app by sending this key.
        // The app must have this key saved into its environment variables.
        // Each app has its own key so that if one apps key is compromised,
        // the other apps are still safe from someone using the compromised key
        // for pretending to be the users app.
        // !! This key must never be sent to any client. Use only between servers. !!
        type: String,
        required: true
    }
})

// Return app information without the appKey.
appSchema.statics.format = ({
    _id, name, url
}) => ({
    _id,
    name,
    url
})

const App = mongoose.model('App', appSchema)

module.exports = App