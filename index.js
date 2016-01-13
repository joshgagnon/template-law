require("babel-register");
require('./server');

var DEV = process.env.NODE_ENV !=='production';

if(DEV){
    require("./dev.js");
}