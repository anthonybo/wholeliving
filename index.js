const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const db = require('./db');
const PORT = process.env.PORT || 9000;
const ENV = process.env.NODE_ENV || 'development';
const fs = require('fs');
const stream = require ('stream');
const parse= require('csv-parse');
const request = require('request');
const fetch = require('node-fetch');
const sha1 = require('sha1');
const http = require('http');
const path = require('path');
const keys = require('./keys');

const app = express();

app.use( cors() );
app.use( express.json() );
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// const parser = parse({
//     delimiter:','
// })
//
// parser.on('readable', function(){
//     let record;
//     while (record = parser.read()) {
//         try{
//             var sql = 'INSERT INTO `wholefoods` (`lng`, `lat`, `address`, `city`,\
//             `state`, `zip`, `phone`, `hours`) \
//             VALUES (?,?,?,?,?,?,?,?)';
//             const query = mysql.format(sql, record);
//
//             db.query(query);
//         }catch(error){
//             console.log(error)
//         }
//     }
// })
//
// const readData = fs.createReadStream('./Whole_Foods_Markets.csv').pipe(parser);

// The following will allow you to see what the parser is reading from the CSV, I had some empty columns in my CSV
// I was unable to see the empty columns until running the following, once located the empty columns I was able to clear the fields
const results = [];

// fs.createReadStream('./Whole_Foods_Markets.csv')
//     .pipe(parse())
//     .on('data', (data) => results.push(data))
//     .on('end', () => {
//         console.log(results);
//     });

// Middleware to see information on every request
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

app.get('/api/wholefoods', async (req, res, next) => {
    const sql = 'SELECT * FROM `wholefoods`';

    let wholefoods = await db.query(sql);

    wholefoods = wholefoods.map(item => {
        // console.log(item);
        item.type = "Feature",
            item.geometry = {
                type:"Point",
                coordinates:[item.lng, item.lat]
            };
        item.properties = {
            Address: item['address'],
            "City": item['city'],
            "State": item['state'],
            "Zip":item.zip,
            Phone: item.phone,
            "Hours": item['hours'],
        }

        delete item.lng;
        delete item.lat;
        delete item.address;
        delete item.city;
        delete item.state;
        delete item.zip;
        delete item.phone;
        delete item.hours;
        return item;
    });

    res.send({
        success:true,
        geoJson: {
            type:"FeatureCollection",
            features: wholefoods
        }
    });

})

app.post('/api/wholefoods/state', async (req, res, next) => {
    // console.log(req.body);

    const sql = 'SELECT * FROM `wholefoods` WHERE state = ?';

    let wholefoodsByState = await db.query(sql, req.body.state);

    wholefoodsByState = wholefoodsByState.map(item => {
        // console.log(item);
        item.type = "Feature",
            item.geometry = {
                type:"Point",
                coordinates:[item.lng, item.lat]
            };
        item.properties = {
            Address: item['address'],
            "City": item['city'],
            "State": item['state'],
            "Zip":item.zip,
            Phone: item.phone,
            "Hours": item['hours'],
        }

        delete item.lng;
        delete item.lat;
        delete item.address;
        delete item.city;
        delete item.state;
        delete item.zip;
        delete item.phone;
        delete item.hours;
        return item;
    })

    res.send({
        success:true,
        geoJson: {
            type:"FeatureCollection",
            features: wholefoodsByState
        }
    });

})

app.post('/api/location', async (req, res, next) => {
    // console.log(req.body);

    const sql = 'SELECT * FROM `wholefoods` WHERE id = ?';

    let wholeFoodsByLocation = await db.query(sql, req.body.id);

    wholeFoodsByLocation = wholeFoodsByLocation.map(item => {
        item.type = "Feature",
            item.geometry = {
                type:"Point",
                coordinates:[item.lng, item.lat]
            };
        item.properties = {
            Address: item['address'],
            "City": item['city'],
            "State": item['state'],
            "Zip":item.zip,
            Phone: item.phone,
            "Hours": item['hours'],
        }

        delete item.lng;
        delete item.lat;
        delete item.address;
        delete item.city;
        delete item.state;
        delete item.zip;
        delete item.phone;
        delete item.hours;
        return item;
    })

    res.send({
        success:true,
        geoJson: {
            type:"FeatureCollection",
            features: wholeFoodsByLocation
        }
    });
})

app.post('/api/places', async (req,res,next) => {
    let keyword = '';
    let location = '33.6526719,-117.74766229999999';

    if(req.body.keyword){
        keyword = req.body.keyword;
    }
    if (req.body.location){
        location = req.body.location;
    }

    try {
        // fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=16093.4&key=AIzaSyD-NNZfs0n53D0caUB0M_ERLC2n9psGZfc&keyword=${keyword}&fields=geometry,photos,formatted_address,name,opening_hours,rating`)
        fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${keyword}+${location}&sensor=false&key=${keys.googlePlaces}`)
            .then(res => res.json())
            .then(data=> {
                data = data.results.map(item => {
                    // console.log(item);

                    item.type = "Feature",
                        item.geometry = {
                            type:"Point",
                            coordinates:[item.geometry.location.lng, item.geometry.location.lat]
                        };
                    item.properties = {
                        Address: item.formatted_address,
                        Name: item.name,
                        Rating: item.rating,
                        PlaceId: item.place_id
                    }

                    delete item.lng;
                    delete item.lat;
                    delete item.formatted_address;
                    delete item.rating;
                    delete item.name;
                    delete item.place_id;
                    return item;
                })
                // res.send({data})
                res.send({
                    success:true,
                    geoJson: {
                        type:"FeatureCollection",
                        features: data
                    }
                });
            })
    } catch(error){
        res.status(500).send('Server Error');
    }
})

app.post('/api/housing/median', async (req,res,next) => {
    //ZHVIAH -All home data code
    //MLPAH -Median home data code
    //Documentation: https://www.quandl.com/data/ZILLOW-Zillow-Real-Estate-Research

    fetch(`https://www.quandl.com/api/v3/datasets/ZILLOW/Z${req.body.zip}_MLPAH?api_key=${keys.quandl}`)
        .then(res => res.json())
        .then(data=> {
            // console.log(data);

            res.send({
                success: true,
                median_prices: data
            })
        })
})

app.post('/api/walkscore', async (req,res,next)=>{
    // console.log(req.body);
    let address = req.body.address;
    let lat = req.body.lat;
    let lng = req.body.lng;

    fetch(`http://api.walkscore.com/score?format=json&address=${address}&lat=${lat}&lon=${lng}&transit=1&bike=1&wsapikey=${keys.walkscore}`)
        .then(res => res.json())
        .then(data=> {
            // console.log(data);

            res.send({
                success: true,
                walkscore: data
            })
        })
})

app.post('/api/wiki', async (req,res,next)=>{
    fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&format=json&redirects&titles=${req.body.city},_${req.body.state}`)
        .then(res => res.json())
        .then(data=> {
            res.send({
                success: true,
                wiki: data
            })
        })
})

app.post('/api/places/details', async (req,res,next) => {
    try{
        fetch(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${req.body.places_id}&fields=name,rating,formatted_phone_number,opening_hours/weekday_text,website,formatted_address,geometry,photo,review,icon,price_level&key=${keys.googlePlaces}`)
            .then(res => res.json())
            .then(data=> {
                // console.log(data);

                // res.send({data})
                res.send({
                    success:true,
                    data: data
                });
            })
    } catch (error){
        res.status(500).send('Server Error');
    }
})

app.post('/api/geoSpacial', async(req,res,next) => {
    let range = 10;
    if(req.body.range > 0){
        range = req.body.range;
    }
    if(req.body.lat !== '' && req.body.lng !== ''){
        const sql = 'SELECT\n' +
            '    id,lat,lng,address,city,state,zip,phone,hours, (\n' +
            '      3959 * acos (\n' +
            '      cos ( radians('+ req.body.lat +') )\n' +
            '      * cos( radians( lat ) )\n' +
            '      * cos( radians( lng ) - radians('+ req.body.lng +') )\n' +
            '      + sin ( radians('+ req.body.lat +') )\n' +
            '      * sin( radians( lat ) )\n' +
            '    )\n' +
            ') AS distance\n' +
            'FROM wholefoods\n' +
            'HAVING distance <' + range + '\n' +
            'ORDER BY distance\n';

        // const sql = 'SELECT * FROM `wholefoods`';

        let wholefoods = await db.query(sql);

        wholefoods = wholefoods.map(item => {
            // console.log(item);
            item.type = "Feature",
                item.geometry = {
                    type:"Point",
                    coordinates:[item.lng, item.lat]
                };
            item.properties = {
                Address: item['address'],
                "City": item['city'],
                "State": item['state'],
                "Zip":item.zip,
                Phone: item.phone,
                "Hours": item['hours'],
            }

            delete item.lng;
            delete item.lat;
            delete item.address;
            delete item.city;
            delete item.state;
            delete item.zip;
            delete item.phone;
            delete item.hours;
            return item;
        })

        res.send({
            success: true,
            geoJson: {
                type: "FeatureCollection",
                features: wholefoods
            }
        });
    }
})


// app.get('/api/test', async (req, res, next) => {
//     const sql = 'SELECT * FROM `test`';
//
//     const wholefoods = await db.query(sql);
//
//     res.send({
//        success: true,
//        wholefoods: wholefoods
//     });
// });

// app.post('/api/test', async (req, res) => {
//     const { lat, lng, state } = req.body;
//
//     try {
//         const sql = 'INSERT INTO `test` (`lat`, `lng`, `state`) VALUES (?, ?, ?)';
//         const inserts = [lat, lng, state];
//
//         const query = mysql.format(sql, inserts);
//
//         const insertResults = await db.query(query);
//
//         res.send({
//             success: true,
//             insertId: insertResults.insertId
//         });
//     } catch(error){
//         res.status(500).send('Server Error');
//     }
//
// });

app.post('/api/new/user', async (req,res) => {
    let {email, password, lastLogin} = req.body;
    let ipv4 = "127.0.0.1";
    password = sha1(password);

    delete req.body.password;
    // console.log(req.body);
    // var ip;
    // if (req.headers['x-forwarded-for']) {
    //     ip = req.headers['x-forwarded-for'].split(",")[0];
    // } else if (req.connection && req.connection.remoteAddress) {
    //     ip = req.connection.remoteAddress;
    // } else {
    //     ip = req.ip;
    // }console.log("client IP is *********************" + ip);
    //
    // console.log(ip);

    var options = {
        host: 'ipv4bot.whatismyipaddress.com',
        port: 80,
        path: '/'
    };

    http.get(options, function(httpRes) {
        // console.log("status: " + httpRes.statusCode);

        httpRes.on("data", async function(chunk) {
            // console.log("BODY: " + chunk);
            ipv4 = chunk;

            var rand = function() {
                return Math.random().toString(36).substr(2); // remove `0.`
            };

            var token = function() {
                return rand() + rand(); // to make it longer
            };

            var generatedToken = token();

            try {
                const sql = 'INSERT INTO `users` (`email`, `password`, `lastLogin`, `ipv4`, `token`) VALUES (?, ?, ?, ?, ?)';
                const inserts = [email, password, lastLogin, ipv4, generatedToken];

                const query = mysql.format(sql, inserts);

                const insertResults = await db.query(query);

                res.send({
                    success: true,
                    insertId: insertResults.insertId
                })
            } catch (error){
                res.status(500).send('Server Error');
            }
        });
    }).on('error', function(e) {
        console.log("error: " + e.message);
    });
});

app.post('/api/login', (request, response) => {
    try {
        const email = request.body.email;
        if (email === undefined || request.body.password === undefined) {
            throw new Error ('Email & Password are required fields.');
        }
        const password = sha1(request.body.password);
        delete request.body.password;
        const query = `SELECT id, email FROM users WHERE email = ? AND password = ?`;

        db.query(query, [email,password], (error,data)=>{
            try {
                if (!error) {
                    if (data.length === 1) {
                        var options = {
                            host: 'ipv4bot.whatismyipaddress.com',
                            port: 80,
                            path: '/'
                        };

                        http.get(options, function(httpRes) {
                            httpRes.on("data", async function(chunk) {
                                var ipv4 = chunk;

                                var rand = function() {
                                    return Math.random().toString(36).substr(2); // remove `0.`
                                };

                                var token = function() {
                                    return rand() + rand(); // to make it longer
                                };

                                var generatedToken = token();

                                try {
                                    const updateIpSql = `UPDATE users SET ipv4 = ?, lastLogin = ?, token = ? WHERE id = ?`;
                                    const inserts = [ipv4, request.body.lastLogin, generatedToken, data[0].id];
                                    const updateIpQuery = mysql.format(updateIpSql, inserts);
                                    const insertResults = db.query(updateIpQuery);

                                    response.send({
                                        success: true,
                                        user: {
                                            id: data[0].id,
                                            email: data[0].email,
                                            token: generatedToken,
                                            message: 'User exists'
                                        }
                                    });
                                } catch (error){
                                    response.status(500).send('Server Error');
                                }
                            });
                        }).on('error', function(e) {
                            console.log("error: " + e.message);
                        });

                    } else {
                        response.send({
                            success: false,
                            user: {
                                message: 'User does not exist'
                            }
                        })
                        // throw new Error('email or password is invalid')
                    }
                } else {
                    throw new Error(error);
                }
            } catch (err) {
                handleError(response, err.message);
            }

        });
    } catch (err) {
        handleError(response, err.message);
    }
})

app.post('/api/login/token', (request, response) => {
    try {
        const email = request.body.email;
        if (email === undefined) {
            throw new Error ('Email & Password are required fields.');
        }
        const query = `SELECT id, email FROM users WHERE token = ?`;

        db.query(query, [request.body.token], (error,data) =>{
            try {
                if (!error) {
                    if (data.length === 1) {
                        response.send({
                            success: true,
                            user: {
                                id: data[0].id,
                                email: data[0].email,
                                message: 'User exists'
                            }
                        })
                    } else {
                        response.send({
                            success: false,
                            user: {
                                message: 'User does not exist'
                            }
                        })
                        // throw new Error('email or password is invalid')
                    }
                } else {
                    throw new Error(error);
                }
            } catch (err) {
                handleError(response, err.message);
            }

        });
    } catch (err) {
        handleError(response, err.message);
    }
})

app.post('/api/login/check', (request, response) => {
    try {
        const email = request.body.email;
        if (email === undefined) {
            throw new Error ('Email & Password are required fields.');
        }
        const query = `SELECT id, email FROM users WHERE email = ?`;

        db.query(query, [email], (error,data) =>{
            try {
                if (!error) {
                    if (data.length === 1) {
                        response.send({
                            success: true,
                            user: {
                                id: data[0].id,
                                email: data[0].email,
                                message: 'User exists'
                            }
                        })
                    } else {
                        response.send({
                            success: false,
                            user: {
                                message: 'User does not exist'
                            }
                        })
                        // throw new Error('email or password is invalid')
                    }
                } else {
                    throw new Error(error);
                }
            } catch (err) {
                handleError(response, err.message);
            }

        });
    } catch (err) {
        handleError(response, err.message);
    }
})

app.post('/api/user/get/favorites', async (req, res) => {
    // SELECT wholefoods.id, wholefoods.city, wholefoods.address, wholefoods.state, wholefoods.zip, wholefoods.phone, wholefoods.hours
    // FROM users, wholefoods
    // INNER JOIN users_wf_favorites uwff
    // ON uwff.wholefoods_id = wholefoods.id
    // WHERE uwff.users_id = users.id
    // AND users.email = 'testman@gmail.com'
    try {
        const sql = `SELECT wholefoods.id, wholefoods.city, wholefoods.address, wholefoods.state, wholefoods.zip, wholefoods.phone, wholefoods.hours FROM users, wholefoods INNER JOIN users_wf_favorites uwff ON uwff.wholefoods_id = wholefoods.id WHERE uwff.users_id = users.id AND users.email = ?`;
        let queryResults = await db.query(sql, [req.body.email, req.body.location]);

        res.send({
            success: true,
            results: queryResults
        });
    } catch(error){
        res.status(500).send('Server Error');
    }

})

app.post('/api/user/insert/favorites', async (req, res) => {
    try {
        const sql = 'INSERT INTO `users_wf_favorites` (`users_id`, `wholefoods_id`) VALUES (?, ?)';
        const inserts = [req.body.user_id, req.body.location];

        const query = mysql.format(sql, inserts);

        const insertResults = await db.query(query);

        res.send({
            success: true,
            insertId: insertResults.insertId
        });
    } catch(error){
        res.status(500).send('Server Error');
    }

})

app.post('/api/user/check/favorites', async(req, res) => {
    try {
        const sql = `SELECT wholefoods.id, wholefoods.city FROM users, wholefoods INNER JOIN users_wf_favorites uwff ON uwff.wholefoods_id = wholefoods.id WHERE uwff.users_id = users.id AND users.email = ? AND wholefoods.id = ?`;
        let queryResults = await db.query(sql, [req.body.email, req.body.location]);

        res.send({
            success: true,
            results: queryResults
        });
    } catch(error){
        res.status(500).send('Server Error');
    }
})

app.post('/api/admin/get/users', async (req, res) => {
    // SELECT id,email,lastLogin,ipv4 FROM `users`
    if(req.body.email === 'admin@admin.com' && req.body.user_id == 214){
        try {
            const sql = `SELECT id,email,lastLogin,ipv4 FROM users WHERE email != 'admin@admin.com'`;
            let queryResults = await db.query(sql);

            res.send({
                success: true,
                results: queryResults
            });
        } catch(error){
            res.status(500).send('Server Error');
        }
    }
})

app.post('/api/admin/remove/user', async (req, res) => {
    // DELETE FROM users WHERE id = 215
    if(req.body.email === 'admin@admin.com' && req.body.admin_id == 214){
        try {
            const sql = `DELETE FROM users WHERE id = ?`;
            let queryResults = await db.query(sql, [req.body.user_id]);

            res.send({
                success: true,
                results: queryResults
            });
        } catch(error){
            res.status(500).send('Server Error');
            console.log(error);
        }
    }
})

app.post('/api/user/remove/favorites', async(req, res) => {
    // DELETE FROM users_wf_favorites WHERE users_id = 205 AND wholefoods_id = 83

    try {
        const sql = `DELETE FROM users_wf_favorites WHERE users_id = ? AND wholefoods_id = ?`;
        let queryResults = await db.query(sql, [req.body.user_id, req.body.location]);

        res.send({
            success: true,
            results: queryResults
        });
    } catch(error){
        res.status(500).send('Server Error');
    }
})

app.post('/api/user/get/business/favorites', async(req, res) =>{
    try {
        // const sql = `-- SELECT business_id FROM users_business_favorites WHERE users_id = 221 AND business_id = 'ChIJT3nDW1Dv3IARuOmZax7UU0o'`;
        const sql = `SELECT business_id FROM users_business_favorites WHERE users_id = ? AND business_id = ?`;
        let queryResults = await db.query(sql, [req.body.user_id, req.body.business_id]);

        if(queryResults.length < 1){
            res.send({
                success: false,
                message: 'That business is not in the database for the current user.'
            })
        } else {
            res.send({
                success: true,
                message: 'That business is in the database for current user.'
            })
        }

    } catch (error) {
        res.status(500).send('Server Error');
    }
})

app.post('/api/user/insert/business/favorites', async (req, res) => {
    try {
        const sql = 'INSERT INTO `users_business_favorites` (`users_id`, `business_id`) VALUES (?, ?)';
        let queryResults = await db.query(sql, [req.body.users_id], req.body.business_id);

    } catch (error) {
        res.status(500).send('Server Error');
    }
})



app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});


function handleError( response, error ){
    response.status(500).send( {success: false, error: [error]} );
}

// app.get('/api/get-user', (req,res)=>{
//    res.send(req.user);
// });

app.listen(PORT, () => {
    console.log('Server Running at localhost: ' + PORT);
}).on('error', (err)=>{
    console.log('You probably already have a server running on that PORT: ' + PORT);
});
