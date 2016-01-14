var page = require('webpage').create(),
    system = require('system'),
    address, output;

page.paperSize = {
    format: 'A4',
    orientation: 'portrait',
    margin: '0'
};

page.paperSize = { width: 595, height: 842, margin:0 };
address = system.args[1];
output = system.args[2];

page.open(address, function (status) {
    if (status !== 'success') {
        console.log('Unable to load the address!');
        phantom.exit(1);
    } else {
        page.render(output);
        phantom.exit();
    }
});