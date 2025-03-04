const express = require('express');

const prisma = require('../../lib/prisma');

const router = express.Router(); // Instantiate a new router

// Main page
router.get('/', async function (req, res, next) {
	return res.render('main/main.html', {
		base: 'base.html',
		title: 'Main',
		username: req.session && req.session.username ? req.session.username : 'gotoman',
		avatarURL: req.session ? req.session.avatar_url : null,
		is_auth: req.session && req.session.username,
	});
});

module.exports = router;
