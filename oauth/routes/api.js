const express = require('express')
const prisma = require('../../lib/prisma')

const router = express.Router() // Instantiate a new router

router.get('/', (req, res) => res.json({ success: true }))

router.get('/user', async (req, res) => {
  let accessToken = req.headers.authorization.split()[1]

  const user = (await prisma.token.findFirst({
    where: {
      accessToken: accessToken
    },
    select: {
      user: true
    }
  })).user

  res.json({
    user_id: user.id,
    username: user.username,
    first_name: user.firstName,
    last_name: user.lastName,
    createdAt: user.createdAt
  })
})

module.exports = router
