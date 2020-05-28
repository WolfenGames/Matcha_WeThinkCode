const db = require("../database/db");
("use strict");

async function addNotification(user, message) {
    await db.pool.query('CALL add_notification($1::int, $2)',[user._id, message])
}

async function clearNotification(user) {
    await db.pool.query('CALL viewed_notification($1)', [user._id]);
}

async function isNewNotifications(user) {
    let notifications = await db.pool.query(`SELECT * FROM get_new_notifications($1::int)`, [user._id])
    return notifications.rowCount > 0;
}

async function getNotifications(user) {
    let notifications = await db.pool.query(`SELECT * FROM get_notifications($1::int)`, [user._id])
    return notifications.rows;
}
    

module.exports = {
    addNotification: addNotification,
    clearNotification: clearNotification,
    isNewNotifications: isNewNotifications,
    getNotifications: getNotifications
};