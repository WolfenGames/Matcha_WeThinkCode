const express		= require('express');
const router		= express.Router();
const chatFn		= require('../functions/chat')
const io			= require('socket.io')
const ListUsers		= require('../functions/userList');

// chatFn.addChat("Eyy", "Eyyyyy", "Etyyyyyy");
// chatFn.getAllChats("Eyyyyy", "Eyy", res => {
// 	console.log(res);
// })


router.get('*', (req, res, next) => {
    if (!req.session.user)
        res.redirect('/404')
    ListUsers.getMatchedUsers(req.session.user, result => {
        res.render('pages/chat', { user: req.session.user , name: req.session.user, matches: result });
    })
})

module.exports = router