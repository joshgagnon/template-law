require("babel-register")({
    presets: ['react', 'es2015', "stage-0"]
});
var FORMS = require('./assets/js/schemas.js').default;
var jsf = require('json-schema-faker');
var input = process.argv[2];

Object.keys(FORMS).map(function(k){
    if(k.indexOf(input) === 0){
        console.log(JSON.stringify(jsf(FORMS[k].schema), null, 4));
    }
})


