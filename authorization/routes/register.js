const path = require('path') // has path and __dirname
const express = require('express')

const prisma = require('../../lib/prisma')

const router = express.Router() // Instantiate a new router

const filePath = path.join(__dirname, '../public/register.html')

router.get('/', (req, res) => {  // send back a simple form for the registration
  res.sendFile(filePath)
})

router.post('/', async (req, res) => {
  const email = req.body.email
  const username = req.body.username
  const password = req.body.password

  if (!email || !password || !username) 
    return res.redirect(`/register?success=false&email=${email}&username=${username}${!password ? `&password=` : ''}`)

  let user;

  // create new user in db
  try {
    user = await prisma.user.create({
      data: {
        email: email,
        username: username,
        password: password
      }
    })
  }
  catch (e) {
    // handle error of not unique
    if (e.code === 'P2002') return res.redirect(`/register?success=false&email=${email}&username=${username}&unique=false`)
    else return res.redirect(`/register?success=false`)
  }

  // login user
  req.session.user_id = user.id;

  return res.redirect('/')
})


module.exports = router