const express = require('express')

const prisma = require('../../lib/prisma')
const comparePassword = require('../../methods').passwordHashing.comparePassword

const router = express.Router() // Instantiate a new router

router.get('/', (req, res) => {  // send back a simple form for the auth
    return res.render('authorization/login.html', {
        base: 'base.html',
        title: 'Login',
    })
})

router.post('/', async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    if (!username || !password) return res.redirect(`/login?success=false`)

    const user = await prisma.user.findFirst({
        where: {
            username: username
        }
    })

    const correct_password = user ? await comparePassword(password, user.password) : false

    if (!user || !correct_password)
        return res.redirect(`/login?success=false&username=${username}${!correct_password ? '&wrong_password=true' : ''}`)

    // login user
    req.session.user_id = user.id
    req.session.username = user.username
    req.session.fullname = { firstName: user.firstName, lastName: user.lastName }
    req.session.user_type = user.type

    return res.redirect('/')
})


module.exports = router