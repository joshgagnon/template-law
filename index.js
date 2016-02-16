require("babel-register")({
    presets: ['react', 'es2015', "stage-0"]
});
require('./server');

var DEV = process.env.NODE_ENV !== 'production';

if(DEV){
    require("./dev.js");
}