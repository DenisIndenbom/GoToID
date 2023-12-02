const prisma = require('../lib/prisma')

async function auth(req, res, next, url = '') {
    if (req.session && req.session.user_id) {
        const user = await prisma.user.findFirst({
            where: {
                id: req.session.user_id
            }
        })

        if (user) return next()
        else return url ? res.redirect(url) : res.sendStatus(401)
    }
    else
        return url ? res.redirect(url) : res.sendStatus(401)
};


module.exports = auth