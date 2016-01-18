import express from 'express';
import Handlebars from 'handlebars';
import 'fs';
import Promise from 'bluebird';
import _fs from 'fs';
import './assets/js/helpers';
import bodyParser from 'body-parser';
import childProcess from 'child_process';
import _temp from 'temp';
const exec = Promise.promisify(childProcess.exec);
const fs = Promise.promisifyAll(_fs);
const temp = Promise.promisifyAll(_temp);
const app = express();

const DEV = process.env.NODE_ENV !== 'production';
const PORT = DEV ? 3000 : 5667;

const PHANTOMJS = 'phantomjs';

temp.track();
let base, print;

app.use(express.static('public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/render', function(req, res) {
    const data = req.body;
    let htmlPath, outPath, html;
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
        return Promise.join(temp.openAsync({suffix: '.html'}), temp.openAsync({suffix: '.pdf'}))
    })
    .spread((htmlInfo, outInfo) => {
        htmlPath = htmlInfo.path;
        outPath = outInfo.path;
        return fs.writeFileAsync(htmlPath, html, 'utf-8')
    })
    .then(html => {
        const args = [PHANTOMJS, 'pdf.js', htmlPath, outPath];
        console.log('Running', args.join(' '))
        return exec(args.join(' '))
    })
    .then(() => {
        console.log('sending')
        res.sendFile(outPath);
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