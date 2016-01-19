var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cacheResponseDirective = require('express-cache-response-directive');
var stream = require('logrotate-stream');
var hbs = require('hbs');
var MongoClient = require('mongodb').MongoClient;
var expressHbs = require('express3-handlebars');
var app = express();


//load config
var config = require('./config/config');

//set port
app.set('port', config.port);

// view engine setup to use Handlebars templates
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', expressHbs({extname:'hbs', defaultLayout:'main.hbs'}));
app.set('view engine', 'hbs');

//Use register partials to get partial templates from the specific partials directory "partials"
hbs.registerPartials(__dirname + '/views/partials');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

//set access logs
try {
    fs.mkdirSync(__dirname + '/logs/');
}
catch (ex) {
    if (ex.code != 'EEXIST') {
        throw ex;
    }
}

var accessLogStream = stream({
    file: __dirname + '/logs/access.log',
    size: config.accessLog.fileSize,
    keep: config.accessLog.keep,
    compress: config.accessLog.compress
});

logger.format('access', '[:date] ip=:remote-addr mtd=:method url=:url http=:http-version rfr=":referrer" st=:status cl=:res[content-length] - time=:response-time ms');
app.use(logger('access', { stream: accessLogStream, buffer: true }));

//configure
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.disable('etag');
app.use(cacheResponseDirective());
app.use(express.static(path.join(__dirname, 'public')));

//routes
var routes = require('./routes')(config);
app.use('/', routes);
app.use('/index', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found - didn\'t find what you were looking for');
    err.status = 404;
    next(err);
});

// error handlers

if (app.get('env') === 'dev') {
    app.use(developmentErrorHandler);
} else {
    // production error handler
    // no stacktraces leaked to user
    app.use(prodErrorHandler);
}

//calculateBestDeal(new Date('2016-01-15'), 10, [178280]);
Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + parseInt(days));
    return this;
};


var Cluster = require('./modules/cluster_support');
module.exports = new Cluster(app);

function prodErrorHandler(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
}

function developmentErrorHandler(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
}
var gatherFlightData = function(tlas, startDate, endDate, los, db, callback) {
    var result = {};
    var tla;

    for (var i = 0; i < tlas.length; i++) {
        tla = tlas[i];
        result[tla] = [];
    }

    var cursor = db.collection('processedFlightData').find({$and: [{destination:{$in: tlas}},
        {arrival: {$gte: startDate, $lt: endDate}},
        {departure: {$gte: startDate, $lt: endDate}}]});


    cursor.each(function(err, doc) {
        if (doc != null) {
            var arrival = new Date(doc['arrival']);
            var departure = new Date(doc['departure']);
            var price = doc['minPrice'];
            var dest = doc['destination'];
            departure.addDays(los);
            if (departure.getTime() === arrival.getTime()) {
                result[dest].push({departure:departure, price:price});
            }
        } else {
            callback(result);
        }
    });
};


var gatherHotelData = function (rids, startDate, endDate, db, callback) {
    var result = [];

    var cursor = db.collection('regionTrendsData').aggregate([{$match: {$and: [{pid: {$in: rids}},
        {stayDate: {$gte: startDate, $lt: endDate}}]}},
        {$group:{_id: { pid:"$pid",stayDate:"$stayDate"}, avgPrice: { $avg: "$price" }}}]);


    cursor.each(function(err, doc) {
        if (doc != null) {
            // console.log(doc);
            var stayDate = new Date(doc['_id']['stayDate']);
            var rid = doc['_id']['pid'];
            var price = doc['avgPrice'];
            result.push({rid:rid, stayDate:stayDate, price:price});
        } else {
            callback(result);
        }
    });
};


calculateBestDeal(new Date('2016-02-20'), 4, [178280, 180077, 178248, 178294,178293], 0, 100000);

function calculateBestDeal(departDate, los, rids, minPrice, maxPrice) {

    var url = 'mongodb://10.0.17.180:27017/tellme-db';
    var regionidsToTlas = {};
    regionidsToTlas['178276'] = ['LAS'];
    regionidsToTlas['178293'] = ['JFK', 'EWR', 'LGA', 'JRB', 'ISP'];
    regionidsToTlas['178294'] = ['MCO', 'SFB'];
    regionidsToTlas['178286'] = ['MIA'];
    regionidsToTlas['178280'] = ['SNA', 'LAX', 'ONT', 'BUR', 'LGB'];
    regionidsToTlas['178304'] = ['SAN', 'CLD'];
    regionidsToTlas['178248'] = ['ORD', 'MDW', 'RFD'];
    regionidsToTlas['178305'] = ['SFO', 'SJC', 'OAK'];
    regionidsToTlas['180077'] = ['HNL'];
    regionidsToTlas['601685'] = ['MYR'];
    regionidsToTlas['178239'] = ['BOS'];
    regionidsToTlas['178318'] = ['BWI', 'IAD', 'DCA'];
    regionidsToTlas['603224'] = ['SNA'];
    regionidsToTlas['178292'] = ['MSY', 'NEW'];
    regionidsToTlas['601750'] = ['MIA', 'FLL'];
    regionidsToTlas['178232'] =['ATL', 'PDK'];
    regionidsToTlas['180073'] = ['OGG'];
    regionidsToTlas['6023765'] = ['MCO', 'SFB', 'MIA'];

    var startDate = new Date(departDate.getTime()),
        endDate = new Date(departDate.getTime()),
        hotelPrices={},
        flightPrices={},
        pricePackages = [],
        bestDeal = null;

    startDate.addDays(-7);
    endDate.addDays(los+7);

    var currentTlas = [];
    for (var i = 0; i < rids.length; i++) {
        var rid_index = rids[i];
        for (var tla_index = 0; tla_index < regionidsToTlas[rid_index].length; tla_index++) {
            currentTlas.push(regionidsToTlas[rid_index][tla_index]);
        }
    }

    MongoClient.connect(url, function(err, db) {
        gatherFlightData(currentTlas, startDate, endDate, los, db, function(flightResult) {
            gatherHotelData(rids, startDate, endDate, db, function (hotelResult) {

                //For each destination region
                for (var r = 0; r < rids.length; r++) {
                    var rid = rids[r];

                    //Loop over hotels data, map staydate to price
                    for (var j = 0; j < hotelResult.length; j++) {
                        if (hotelResult[j]["rid"] == rid) {
                            hotelPrices[hotelResult[j]["stayDate"]] = Math.round(hotelResult[j]["price"]);
                        }
                    }

                    //Loop over flights data, map departdate to tla/price
                    var tlas = regionidsToTlas[rid];
                    for (var j = 0; j < tlas.length; j++) {

                        var tlaData = flightResult[tlas[j]];
                        if (typeof tlaData !== 'undefined') {
                            for (var k = 0; k < tlaData.length; k++) {
                                var depart = tlaData[k]["departure"];
                                var flightPrice = tlaData[k]["price"];
                                if (depart in flightPrices) {
                                    if (flightPrices[depart]["price"] > flightPrice) {
                                        flightPrices[depart] = {price: flightPrice, tla: tlas[j]};
                                    }
                                } else {
                                    flightPrices[depart] = {price: flightPrice, tla: tlas[j]};
                                }
                            }
                        }
                    }

                    /*Loop over each potential trip interval. Sum each interval
                     package total, and add to list.*/
                    var startIntervalDate = new Date(startDate.getTime());
                    var maxStartDate = new Date(endDate.getTime());
                    maxStartDate.addDays(-los);
                    while (startIntervalDate < maxStartDate) {
                        var hotelSum = 0;
                        var currStayDate = new Date(startIntervalDate.getTime());
                        for (var j = 0; j < los; j++) {
                            if (currStayDate in hotelPrices) {
                                hotelSum += hotelPrices[currStayDate];
                            }
                            currStayDate.addDays(1);
                        }

                        if (hotelSum > 0 && currStayDate in flightPrices) {
                            var flightPrice = Math.round((flightPrices[currStayDate]['price'] / 100));
                            var packagePrice = flightPrice + hotelSum;
                            if (packagePrice <= maxPrice && packagePrice >= minPrice) {

                                var listOfTla = regionidsToTlas[rid];
                                var tlaContained = false;
                                for (var s = 0; s < listOfTla.length; s++) {
                                    if (listOfTla[s] === flightPrices[currStayDate]['tla']) {
                                        tlaContained= true;
                                    }
                                }

                                if (tlaContained) {
                                    var currentDeal = {
                                        rid: rid,
                                        tla: flightPrices[currStayDate]['tla'],
                                        hotelprice: hotelSum,
                                        flightprice: flightPrice,
                                        totalprice: packagePrice
                                    };

                                    pricePackages.push(currentDeal);

                                    if (bestDeal === null || packagePrice < bestDeal["totalprice"]) {
                                        bestDeal = currentDeal;
                                    }
                                }
                            }
                        }
                        startIntervalDate.addDays(1);
                    }
                }

                ////Output deal info
                //console.log("TOTAL DEALS: ");
                //console.log(pricePackages.length );
                //console.log("ALL DEALS: ");
                //console.log(pricePackages);
                //console.log("BEST DEAL: ");
                //console.log(bestDeal);
            });
        });
    });
}