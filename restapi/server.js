var config = require('config'),
    restify = require('restify'),
    resources = require(__dirname + '/resources'),
    util = require(__dirname + '/lib/util.js')

// Define server
var server = restify.createServer({
  name: 'streetmix-restapi',
  version: '0.0.1'
})

var requestLog = function(req, res, next) {
  var loginToken = ''
  if (req.params.loginToken) {
    loginToken = "loginToken = " + req.params.loginToken
  }
  console.log('[ %s ] %s %s %s %s %s', new Date(), req.method, req.url, req.headers['content-type'], req.body, loginToken)
  next()
}

var loginTokenParser = function(req, res, next) {
  req.params.loginToken = util.parseLoginToken(req)
  next()
} // END function - loginTokenParser

var unknownMethodHandler = function(req, res) {
  if (req.method.toLowerCase() === 'options') {
    var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Origin', 'Authorization']

    if (res.methods.indexOf('OPTIONS') === -1) res.methods.push('OPTIONS')
    
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Headers', allowHeaders.join(', '))
    res.header('Access-Control-Allow-Methods', res.methods.join(', '))
    res.header('Access-Control-Allow-Origin', req.headers.origin)
    
    return res.send(204)
  }
  else
    return res.send(new restify.MethodNotAllowedError())
}

server.on('MethodNotAllowed', requestLog)
server.on('MethodNotAllowed', unknownMethodHandler)

server.use(restify.bodyParser())
server.use(restify.CORS())
server.use(restify.fullResponse())
server.use(loginTokenParser)
server.use(requestLog)

// Routes
server.post('/v1/users', resources.v1.users.post)
server.get('/v1/users/:user_id', resources.v1.users.get)
server.put('/v1/users/:user_id', resources.v1.users.put)
server.del('/v1/users/:user_id/login-token', resources.v1.users.delete)
server.get('/v1/users/:user_id/streets', resources.v1.users_streets.get)

server.post('/v1/streets', resources.v1.streets.post)
server.del('/v1/streets/:street_id', resources.v1.streets.delete)
server.get('/v1/streets/:street_id', resources.v1.streets.get)
server.put('/v1/streets/:street_id', resources.v1.streets.put)

server.post('/v1/feedback', resources.v1.feedback.post)

// Start server
server.listen(config.restapi.port, function() {
  console.log('%s listening at %s', server.name, server.url)
})
