const mysql = require('mysql');
const { dbConfig } = require('../config');

const connection = mysql.createConnection(dbConfig);

connection.connect((error)=>{
    if(error) {
        return console.log('Error connecting to MySQL DB: ', error.message);
    }

    console.log('MySQL DB Connected!');
});

module.exports = connection;