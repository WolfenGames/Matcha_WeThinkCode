const express		= require('express');
const router		= express.Router();

const chatFn		= require('../functions/chat')

// chatFn.addChat("Eyy", "Eyyyyy", "Etyyyyyy");
// chatFn.getAllChats("Eyyyyy", "Eyy", res => {
// 	console.log(res);
// })

router.get('*', (req, res, next) => {

	res.render('pages/chat', { user: req.session.user , name: "Julian" });

})

module.exports = router