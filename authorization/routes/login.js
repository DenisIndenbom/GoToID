const path = require('path') // has path and __dirname
const express = require('express')

const prisma = require('../../lib/prisma')

const router = express.Router() // Instantiate a new router

const filePath = path.join(__dirname, '../public/login.html')

router.get('/', (req, res) => {  // send back a simple form for the oauth
    res.sendFile(filePath)
})

router.post('/', async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    if (!email || !password) return res.redirect(`/login?success=false`)

    const user = await prisma.user.findFirst({
        where: {
            email
        }
    })

    const correct_password = user.password === password

    if (!user || !correct_password) 
        return res.redirect(`/login?success=false&email=${email}${!correct_password ? '&password=': ''}`)

    req.session.user_id = user.id

    return res.redirect('/')
})


module.exports = router