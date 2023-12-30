const Session = require('../models/session')

// Will handle the session logic, since the sessions can eventually come from
// either the database or cache. For now just the database.


// Updates sessions related to a user to match the user's current state.
const updateUsersSessions = async user => {
    try {
        const sessions = await Session.find({ 'user._id': user._id })

        await sessions.forEach(session => {
            session.user = {
                _id: user._id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname
            }
            session.admin = user.admin
            session.access = user.access

            session.save()
        })
    
    } catch (exception) {
        console.log('Exception in sessionService function updateUsersSessions.')
        console.log(exception)
    }
}

module.exports = {
    updateUsersSessions
}
