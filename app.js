// Import libs
const express = require('express')
const session = require('express-session')

const https = require('https')
const http = require('http')

const fs = require('fs')
const PostgreSqlStore = require('connect-pg-simple')(session)

const nunjucks = require('nunjucks')
const bodyParser = require('body-parser')
const cors = require('cors')

// Init express
const app = express()

// Load configuration from .env
const config = require('dotenv').config({ path: __dirname + '/.env' }).parsed

// Save configuration in global
global.config = config

// Load app resources
const oauth = require('./oauth')
const authorization = require('./authorization')
const main = require('./main')

const oauthServer = oauth.oauthServer
const authRoutes = oauth.routes
const authorizationRoutes = authorization.routes
const mainRoutes = main.routes

const databaseURL = config.DATABASE_URL
const port = config.PORT || 3030
const SSL = config.SSL === 'true'
const secret = config.SECRET
const debug = config.DEBUG === 'true'

// Init template engine
nunjucks.configure('templates', {
    autoescape: true,
    express: app,
    noCache: debug
})

// Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Setting up sessions
app.use(session({
    name: 'gotoid.sid',
    secret: secret,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // session is stored for 7 days
    store: new PostgreSqlStore({ conString: databaseURL })
}))

app.use(cors({ origin: true }))

// add static folder
app.use('/static', express.static(__dirname + '/static'))

// add cors to all routes
app.use('/oauth', authRoutes.auth)
app.use('/api', oauthServer.authenticate(), authRoutes.api)
app.use('/register', authorizationRoutes.register)
app.use('/login', authorizationRoutes.login)
app.use('/change_password', authorizationRoutes.change_password)
app.use('/logout', (req, res) => { req.session.destroy(); res.redirect('/login') })
app.use('/profile', mainRoutes.profile)
app.use('/', mainRoutes.apps)
app.use('/', mainRoutes.main)


// handle 404
app.use(function (req, res, next) {
    res.status(404)
    // respond with html page
    if (req.accepts('html')) {
        return res.render('404.html', { base: 'base.html' })
    }
    // respond with json
    if (req.accepts('json')) {
        return res.json({ state: 'error', code: 'not_found', error: 'Not found' })
    }
    // default to plain-text. send()
    return res.type('txt').send('Not found')
})

// Launch telegram bot
require('./lib/telegram_bot.js')


// Run app
module.exports = (is_main) => {
    global.is_main = is_main

    if (SSL) {
        const httpsServer = https.createServer({
            key: fs.readFileSync(__dirname + '/.ssl/key.pem'),
            cert: fs.readFileSync(__dirname + '/.ssl/cert.pem'),
        }, app)

        httpsServer.listen(port)
    }
    else {
        const httpServer = http.createServer(app)
        httpServer.listen(port)
    }
}