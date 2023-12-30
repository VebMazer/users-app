const { port } = require('./utils/config')
const app = require('./app')

// Start server on the configured port.
app.listen(port, () => {
  console.log('users-server running on port:', port)
})