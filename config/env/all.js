'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

module.exports = {
	root: rootPath,
	port: process.env.PORT || 54321,
	accessLog: {
		fileSize: '1m',
		keep: 10,
		compress: true
	}
};
