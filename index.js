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

app.get('/api/test', async (req, res, next) => {
    const sql = 'SELECT * FROM `test`';

    const wholefoods = await db.query(sql);

    res.send({
       success: true,
       wholefoods: wholefoods
    });
});

app.post('/api/test', async (req, res) => {
    const { lat, lng, state } = req.body;

    try {
        const sql = 'INSERT INTO `test` (`lat`, `lng`, `state`) VALUES (?, ?, ?)';
        const inserts = [lat, lng, state];

        const query = mysql.format(sql, inserts);

        const insertResults = await db.query(query);

        res.send({
            success: true,
            insertId: insertResults.insertId
        });
    } catch(error){
        res.status(500).send('Server Error');
    }

});

// app.get('/api/get-user', (req,res)=>{
//    res.send(req.user);
// });

app.listen(PORT, () => {
    console.log('Server Running at localhost: ' + PORT);
}).on('error', (err)=>{
    console.log('You probably already have a server running on that PORT: ' + PORT);
});
