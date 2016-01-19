import express from 'express';
import Handlebars from 'handlebars';
import Promise from 'bluebird';
import _fs from 'fs';
import proxy from 'express-http-proxy';
const fs = Promise.promisifyAll(_fs);
const app = express();

const DEV = process.env.NODE_ENV !== 'production';
const PORT = DEV ? 3000 : 5667;


let base;

app.use(express.static('public'));


app.post('/render', proxy('localhost:5668', {
    forwardPath: function(req, res) {
        return '/render';
  }
}));


app.get('/', function(req, res) {
    res.send(base({content: ''}));
});




fs.readFileAsync('templates/base.html', 'utf-8')
    .then((baseTemplate) => {
        base = Handlebars.compile(baseTemplate);
        app.listen(PORT, function() {
          console.log('App listening on port '+PORT+'!');
        })
    });