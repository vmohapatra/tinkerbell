var standAlone = false;
process.argv.forEach(processCommandLine);

var server = require('./app');

if (standAlone) {
    server.startOne();
}
else {
    server.start();
}

function processCommandLine (val, index) {
    standAlone = (val === '--standalone');
}