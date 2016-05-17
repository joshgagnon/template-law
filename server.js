import express from 'express';
import Handlebars from 'handlebars';
import Promise from 'bluebird';
import _fs from 'fs';
import proxy from 'express-http-proxy';
import bodyParser from 'body-parser'
const pgp = require('pg-promise')();

const cn = {
    host: 'localhost', // server name or IP address;
    port: 5432,
    database: 'template-law',
    //user: 'user_name',
    //password: 'user_password'
};
const db = pgp(cn);
const fs = Promise.promisifyAll(_fs);
const app = express();

const DEV = process.env.NODE_ENV !== 'production';
const PORT = DEV ? 3000 : 5667;
const CONVERT = DEV ? 'localhost:5668' : 'https://convert.catalex.nz'

let base, assetNames = {js: 'app.js', css: 'app.css'};



app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.post('/render', proxy(CONVERT, {
    forwardPath: function(req, res) {
        return '/render';
    }
}));



app.post('/save', function(req, res) {
    //USE UPSERT
    const title = req.body.title;
    db.none("DELETE FROM saved_data where title = $1", [title])
        .then((data) => {
            return db.none("INSERT into saved_data(title, data) values ($1, $2)", [title, req.body.data])
        })
        .then(() => {
            res.send({'message': 'saved'})
        })
        .catch(e => {
            console.log(e);
            res.status = 500;
            res.send(e)
        })

});


app.get('/load', function(req, res) {
    db.any("SELECT * from saved_data")
        .then((data) => {
            res.send(data);
        })
        .catch(e => {
            console.log(e);
            res.status = 500;
            res.send(e)
        })
});



app.get('/*', function(req, res) {
    res.send(base({content: '', assetNames}));
});


if(!DEV){
    fs.readFileAsync('stats.json', 'utf-8')
        .then(function(data){
            const hashes = JSON.parse(data);
            assetNames = {
                js: hashes.app[0],
                css: hashes.app[1]
            }
        })
}


fs.readFileAsync('templates/base.html', 'utf-8')
    .then((baseTemplate) => {
        base = Handlebars.compile(baseTemplate);
        app.listen(PORT, function() {
          console.log('App listening on port '+PORT+'!');
        })
    });