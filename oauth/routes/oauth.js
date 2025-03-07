const express = require('express');
const oauth_server = require('../oauth/server.js');

const auth_handler = require('../../methods/is_auth.js');

const router = express.Router(); // Instantiate a new router

router.get('/', auth_handler('/login', true), (req, res) => {
	// send back a simple form for the oauth
	res.render('oauth/oauth_authenticate.html', {
		base: 'base.html',
		title: 'OAuth GoToID',
		client_id: req.query.client_id,
	});
});

router.post(
	'/authorize',
	auth_handler('/login'),
	async (req, res, next) => {
		const params = [
			// Send params back down
			'client_id',
			'redirect_uri',
			'response_type',
			'grant_type',
			'state',
			'scope',
		]
			.map((a) => `${a}=${req.body[a]}`)
			.join('&');

		if (req.body.agree === 'on') return next();

		return res.redirect(`/oauth?success=false&${params}`);
	},
	oauth_server.authorize({
		authenticateHandler: {
			handle: (req) => {
				return { id: req.session.user_id };
			},
		},
	})
);

router.post(
	'/token',
	(req, res, next) => {next()},
	oauth_server.token({
		requireClientAuthentication: {
			authorization_code: true,
			refresh_token: true,
		},
	})
); // Sends back token

module.exports = router;
