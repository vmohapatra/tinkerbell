var express = require('express');
var router = express.Router();

/* GET mongoData. */
router
    .route('/getdata')
    .get(function(req, res) {
        var data = {
            message: 'Hello, data'
        };

        res.json(data);
    });

module.exports = router;
