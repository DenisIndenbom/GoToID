const express = require('express')

const prisma = require('../../lib/prisma')
const hashPassword = require('../../methods').passwordHashing.hashPassword

const router = express.Router() // Instantiate a new router

router.get('/', (req, res) => {  // send back a simple form for the auth
  res.render('authorization/register.html', {
    base: 'base.html',
    title: 'Register',
  })
})

router.post('/', async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  const inviteCode = req.body.invite_code

  if (!username || !password || !inviteCode) 
    return res.redirect(`/register?success=false&username=${username}&invite_code=${inviteCode}`)

  const invite = await prisma.inviteCode.findFirst({
    where: {
      code: inviteCode,
      expiresAt: {
        gte: new Date()
      }
    }
  })

  if (!invite)
    return res.redirect(`/register?success=false&username=${username}&invite_code=${inviteCode}&wrong_code=true`)

  // create new user in db
  let user;
  try {
    user = await prisma.user.create({
      data: {
        username: username,
        password: await hashPassword(password)
      }
    })
  }
  catch (e) {
    // handle error of not unique
    if (e.code === 'P2002') return res.redirect(`/register?success=false&username=${username}&unique=false`)
    else return res.redirect(`/register?success=false`)
  }

  // login user
  req.session.user_id = user.id
  req.session.username = user.username

  return res.redirect('/')
})


module.exports = router