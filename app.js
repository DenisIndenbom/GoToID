// Import libs
const express = require('express')
const session = require('express-session')
const nunjucks = require('nunjucks')
const bodyParser = require('body-parser')
const cors = require('cors')

// Init express
const app = express()

// Load app resources
const oauth = require('./oauth')
const authorization = require('./authorization')
const main = require('./main')
const methods = require('./methods')

const oauthServer = oauth.oauthServer
const authRoutes = oauth.routes
const authorizationRoutes = authorization.routes
const mainRoutes = main.routes

// Load configuration from .env
const config = require('dotenv').config({ path: __dirname + '/.env' }).parsed

const port = config.PORT || 3030;
const secret = config.SECRET
const debug = config.DEBUG === "true"

// Init template engine
nunjucks.configure('templates', {
    autoescape: true,
    express: app,
    noCache: !debug
})

// Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Setting up sessions
app.use(session({
    secret: secret,
    resave: true,
    saveUninitialized: true
}))

app.use(cors({ origin: true }))

// add static folder
app.use('/static', express.static(__dirname + '/static'));

// add cors to all routes
app.use('/oauth', authRoutes.auth) 
app.use('/api', oauthServer.authenticate(), authRoutes.api) 
app.use('/register', authorizationRoutes.register)
app.use('/login', authorizationRoutes.login)
app.use('/logout', (req, res) => {req.session.destroy(); res.redirect('/login')})
app.use('/main', (req, res, next) => methods.auth(req, res, next, '/login'), mainRoutes.main)
app.use('/', (req, res, next) => methods.auth(req, res, next, '/login'), (req, res) => res.redirect('/main'))

app.listen(port)

console.log("GoToID Server listening on port:", port)