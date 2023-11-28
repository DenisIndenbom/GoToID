const path = require('path') // has path and __dirname
const express = require('express')
const oauthServer = require('../oauth/server.js')

const prisma = require('../../lib/prisma')

const router = express.Router() // Instantiate a new router

const filePath = path.join(__dirname, '../public/oauth_authenticate.html')

router.get('/', (req, res) => {  // send back a simple form for the oauth
  res.sendFile(filePath)
})

router.post('/authorize', async (req, res, next) => {
  const username = req.body.username
  const password = req.body.password

  const params = [ // Send params back down
    'client_id',
    'redirect_uri',
    'response_type',
    'grant_type',
    'state',
  ]
    .map(a => `${a}=${req.body[a]}`)
    .join('&')
  
  if (!username || !password) {
    return res.redirect(`/oauth?success=false&${params}`)
  }

  const user = await prisma.user.findFirst({
    where: {
      username: username
    }
  })

  const correct_password = user.password === password

  if (user && correct_password) {
    req.body.user = { user: user.id }
    return next()
  }

  return res.redirect(`/oauth?success=false&${params}`)
}, oauthServer.authorize({
  authenticateHandler: {
    handle: req => {
      return req.body.user
    }
  }
}))

router.post('/token', async (req, res, next) => {
  const grant_type = req.body.grant_type

  const clientId = req.body.client_id
  const clientSecret = req.body.client_secret

  const client = await prisma.client.findFirst(
    {
      where: {
        clientId: clientId,
        clientSecret: clientSecret,
      }
    }
  )

  // Check client exists
  if (!client) return

  if (grant_type === 'authorization_code') {
    const code = req.body.code

    const authCode = await prisma.authCode.findFirst(
      {
        where: {
          authorizationCode: code,
          clientId: clientId
        }
      }
    )

    if (authCode) return next()
  }
  else if (grant_type === 'refresh_token') {
    const token = req.body.refresh_token

    const refresh_token = await prisma.token.findFirst({
      where: {
        refreshToken: token,
        clientId: clientId
      }
    })

    if (refresh_token) return next()
  }
}, oauthServer.token({
  requireClientAuthentication: { // whether client needs to provide client_secret
    'authorization_code': true,
    'refresh_token': true
  },
}))  // Sends back token


// router.get("/addclient", async (req, res) => {

//   await prisma.client.create({
//     data: {
//       clientId: "myClientId",
//       clientSecret: "clientSecret",
//       redirectUris: ['http://localhost:3030/client/app'],
//       grants: ['authorization_code', 'refresh_token'],
//     }
//   })
// })

module.exports = router