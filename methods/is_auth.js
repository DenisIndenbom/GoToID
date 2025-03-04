/**
 * Checks if user is logged in and if so calls next function. If not returns 401 ( unauthorized )
 *
 * @param {Express.Request} req - Request object from express server
 * @param {Express.Response} res - Response object from express server ( with status code )
 * @param {NextFunction} next - Function to call after authentication is complete ( optional )
 * @param {string} redirect_url - URL to redirect to ( optional ) default ''
 * @param {boolean} back_redirect - Generate back redirection url if true ( optional ) default false
 *
 * @return { Promise } Response object or next function depending on success of auth. This is used to handle authentication
 */
function auth(redirect_url = '', back_redirect = false) {
	return async function (req, res, next) {
		// If the user is logged in redirect to the next page.
		if (req.session && req.session.user_id) next();
		else
			return redirect_url
				? res.redirect(redirect_url + (back_redirect ? `?back=${encodeURIComponent(req.originalUrl)}` : ''))
				: res.sendStatus(401);
	};
}

module.exports = auth;
