const mysql = require('mysql');
const { dbConfig } = require('../config');
const { promisify } = require('util');

const connection = mysql.createConnection(dbConfig);

connection.connect((error)=>{
    if(error) {
        return console.log('Error connecting to MySQL DB: ', error.message);
    }

    console.log('MySQL DB Connected!');
});

connection.query = promisify(connection.query);

module.exports = connection;