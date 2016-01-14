var page = require('webpage').create(),
    system = require('system'),
    address, output;

page.paperSize = {
    format: 'pdf',
    orientation: 'portrait',
    margin: '0'
};

//page.viewportSize = { width: 1238, height: 1763 };
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