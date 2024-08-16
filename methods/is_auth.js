const prisma = require('../lib/prisma')

/**
* Checks if user is logged in and if so calls next function. If not returns 401 ( unauthorized )
* 
* @param req - Request object from express server
* @param res - Response object from express server ( with status code )
* @param next - Function to call after authentication is complete ( optional )
* @param redirect_url - URL to redirect to ( optional ) default''
* 
* @return { Promise } Response object or next function depending on success of auth. This is used to handle authentication
*/
function auth(redirect_url = '') {
    return async function (req, res, next) {
        // If the user is logged in redirect to the next page.
        if (req.session && req.session.user_id) next()
        else return redirect_url ? res.redirect(redirect_url) : res.sendStatus(401)
    }
}

module.exports = auth