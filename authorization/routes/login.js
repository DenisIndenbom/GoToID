const express = require('express');

const prisma = require('../../lib/prisma');
const comparePassword = require('../../methods').passwordHashing.comparePassword;

const router = express.Router(); // Instantiate a new router

router.get('/', (req, res) => {
	// send back a simple form for the auth
	return res.render('authorization/login.html', {
		base: 'base.html',
		title: 'Login',
	});
});

router.post('/', async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	const back = req.query.back;

	if (!username || !password) return res.redirect(`/login?success=false` + (back ? `&back=${back}` : ''));

	const user = await prisma.user.findFirst({
		where: {
			username: username,
		},
		include: {
			Profile: true,
		},
	});

	const correct_password = user ? await comparePassword(password, user.password) : false;

	if (!correct_password)
		return res.redirect(
			`/login?success=false&username=${username}${back ? `&back=${back}` : ''}&wrong_password=true`
		);

	// login user
	req.session.user_id = user.id;
	req.session.username = user.username;
	req.session.fullname = { firstName: user.firstName, lastName: user.lastName };
	req.session.user_type = user.type;
	req.session.avatar_url = user.Profile ? user.Profile.avatarURL : null;

	return res.redirect(back ? decodeURIComponent(back) : '/');
});

module.exports = router;
