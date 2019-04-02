const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const db = require('./db');
const PORT = process.env.PORT || 9000;
const ENV = process.env.NODE_ENV || 'development';

const app = express();

app.use( cors() );
app.use( express.json()) ;

// app.use((req, res, next)=>{
//     // Call db for user information
//     console.log('I will get called with every request');
//
//     req.user = {
//         name: 'Jim',
//         occupation: 'Channel Surfing',
//         favFood: 'Sushi'
//     };
//
//     next();
// });

app.get('/api/test', (req, res, next) => {
    const sql = 'SELECT * FROM `test`';

    db.query(sql, (error, results) => {
        console.log('DB Results: ', results);

        res.send({
            success: true,
            wholefoods: results
        });
    });
});

app.post('/api/test', (req, res) => {
    console.log('POST DATA: ', req.body);

    res.send({
        success: true,
        postDataReceived: req.body,
        message: 'API POST test working'
    });
});

// app.get('/api/get-user', (req,res)=>{
//    res.send(req.user);
// });

app.listen(PORT, () => {
    console.log('Server Running at localhost: ' + PORT);
}).on('error', (err)=>{
    console.log('You probably already have a server running on that PORT: ' + PORT);
});
