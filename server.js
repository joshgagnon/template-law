import express from 'express';
import Handlebars from 'handlebars';
import 'fs';
import Promise from 'bluebird';
import _fs from 'fs';
import './assets/js/helpers';
import bodyParser from 'body-parser';
import process from 'child_process';
import _temp from 'temp';
const exec = Promise.promisify(process.exec);
const fs = Promise.promisifyAll(_fs);
const temp = Promise.promisifyAll(_temp);
const app = express();

const PORT = 3000;

temp.track();
let base, print;

app.use(express.static('public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/render', function(req, res) {
    const data = req.body;
    let tempPath, html;
    Promise.join(
                 fs.readFileAsync('templates/'+data.formName+'.html', 'utf-8'),
                 fs.readFileAsync('templates/'+data.formName+'.json', 'utf-8'),
        (html, json) => {
            const template = Handlebars.compile(html);
            console.log({...data.values, mappings: JSON.parse(json).mappings})
            return print({path: __dirname + '/public',
                         content: template({...data.values,
                            path: __dirname + '/public',
                            mappings: JSON.parse(json).mappings})})
        })
    .then(_html => {
        html = _html;
        return temp.openAsync({suffix: '.html'})
    })
    .then(info => {
        tempPath = info.path;
        return fs.writeFileAsync(info.path,  html, 'utf-8')
    })
    .then(html => {
        const args = ['phantomjs', 'pdf.js', tempPath, 'out.pdf'];
        console.log('Running', args.join(' '))
        return exec(args.join(' '))
    })
    .then(() => {
        console.log('sending')
        res.attachment('out.pdf');
        res.sendFile('out.pdf' , { root : __dirname});
    })
    .catch((err) => {
        console.log('failed', err);
        res.status(500).send({ error: 'Could not generate document' });
    })
});

app.get('/', function(req, res) {
    res.send(base({content: ''}));
});



Promise.join(
             fs.readFileAsync('templates/print-base.html', 'utf-8'),
             fs.readFileAsync('templates/base.html', 'utf-8'),
             ((printTemplate, baseTemplate) => {
        print = Handlebars.compile(printTemplate);
        base = Handlebars.compile(baseTemplate);
    }))
    .then(() => {
        app.listen(PORT, function() {
          console.log('App listening on port '+PORT+'!');
        })
    });