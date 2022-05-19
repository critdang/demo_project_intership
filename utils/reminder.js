const helperFn = require('./helperFn');
const {sequelize} = require('../models');
const {getReminder} = require('./getReminder');

const reminder = async(req, res) => {
    try{
        const [results] = await sequelize.query(getReminder);
        const groupEmail = Object.values(
            results.reduce((prev,cur) => {
                prev[cur.id] = prev[cur.id] || { ...cur, email: [] };
                prev[cur.id].email.push(cur.email);
            },{})
        );
        
        groupEmail.forEach((el) => {
            helperFn.sendEmail(
              el.email,
              'Reminder',
              `Your ${el.subject} class open on ${el.from} `
            );
          });
    }catch(err){

    }

}
const test = async() => {
    const [results] = await sequelize.query(getReminder);
    const groupEmail = results;
    
    groupEmail.forEach((acc) => {
        helperFn.sendEmail(
            acc.client_email,
            'Reminder',
            `Your ${acc.subject} class open on ${acc.from} `
          );
    });
}
module.exports = reminder;
test();