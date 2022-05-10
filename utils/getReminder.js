const getReminder = `SELECT classes.subject, DATE_FORMAT(classes.from, '%Y-%m-%d') AS 'from', clients.client_email From clients, classes
WHERE DATEDIFF(classes.from, CURDATE()) <= 1;`;

module.exports = {
    getReminder
};