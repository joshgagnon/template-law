require("babel-register");
require('./server');

var DEV = true;

if(DEV){
    require("./dev.js");

}