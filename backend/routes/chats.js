const express		= require('express');
const router		= express.Router();

router.get('*', (req, res, next) => {

	res.render('pages/chat', { user: req.session.user , name: "Julian" });

})

module.exports = router