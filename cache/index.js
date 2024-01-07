const { port } = require('./config')
const server = require('./server')

server.listen(port, () => {
    console.log('cache-server running on port:', port)
})