import express from 'express';
import Handlebars from 'handlebars';
import 'fs';
import Promise from 'bluebird';
import _fs from 'fs';
import './assets/js/helpers';
const fs = Promise.promisifyAll(_fs);
const app = express();

const PORT = 3000;

let base;


app.get('/render', function(req, res) {
    fs.readFileAsync('templates/Letter\ of\ Engagement.html', 'utf-8')
        .then(text => {
            const template = Handlebars.compile(text);
            const data = {};
            res.send(base({content: template(data)}))
        })
});

app.get('/', function(req, res) {
    res.send(base({content: ''}));
});

app.use(express.static('public'));

fs.readFileAsync('templates/base.html', 'utf-8')
    .then(text => { base = Handlebars.compile(text) })
    .then(() => {
        app.listen(PORT, function() {
          console.log('App listening on port '+PORT+'!');
        })
    });