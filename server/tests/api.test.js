const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const api = supertest(app)

const User = require('../models/user')

const { manyUsers } = require('./test_data')


beforeEach(async () => {
    await User.deleteMany({})

    // This is not currently working. Fix it! (bcrypt function does not seem to work)
    // Yet it does not throw an error or it is not showed for some reason
    await manyUsers.forEach(async user => {
        await api.post('/api/users')
                 .send(user)
    })
})

describe('/authorize router tests', () => {

    test('post /api/authenticate returns 200 with valid email and password', async () => {
        console.log('manyUsers[0]:', manyUsers[0])
        const response =
            await api.post('/api/authenticate')
                     .send(manyUsers[0])
                     .expect(200)
        console.log(response.data)
    })
    
    test('logout works', async () => {
        const response = await api.post('/api/authenticate')
                                   .send(manyUsers[1])
                                   .expect(200)
        console.log('response.data:', response.data)
        const { session_key } = response.data
        await api.post('/api/authorize/logout')
                 .set('Authorization', session_key)
                 .expect(200)
        
        await api.get('/api/authorize')
                 .set('Authorization', session_key)
                 .expect(401)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})
