import express from 'express';
import Handlebars from 'handlebars';
import 'fs';
import Promise from 'bluebird';
import _fs from 'fs';
import './assets/js/helpers';
const fs = Promise.promisifyAll(_fs);
const app = express();



let base;


app.get('/render', function(req, res) {
    fs.readFileAsync('templates/Letter\ of\ Engagement.html', 'utf-8')
        .then(text => {
            const template = Handlebars.compile(text);
            const data = {
                individuals: [{
                    firstName: 'Matt', lastName: 'Heath'
                },{
                    firstName: 'Pizza', lastName: 'Face'
                },{
                    firstName: 'Jimmy', lastName: 'Two-stiches'
                }],
                address: {
                    street: '10 Town St',
                    suburb: 'Suburbville',
                    postcode: '2134',
                    city: 'Citytopia',
                },
                email: 'test@example.com',
                matterType: 'purchase',
                properties: [{address: '1 Chingford Pl'}, {address: '2 Mingmon St'}],
                contact: {
                    fullName: 'Jim John',
                    phone: '+65 234 23554',
                    email: 'taco@time.com'
                }
            };
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
        app.listen(3000, function() {
          console.log('App listening on port 3000!');
        })
    });