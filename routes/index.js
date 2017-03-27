var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

module.exports = function (config) {
    function renderHome(req, res) {
       res.render('index', {});
    }
    /* GET home page. */
    router.get('/', renderHome);

    Date.prototype.addDays = function(days) {
        this.setDate(this.getDate() + parseInt(days));
        return this;
    };

    var gatherFlightData = function(tlas, startDate, endDate, los, db, callback) {
        console.log("tlas : "+tlas);
        console.log("startDate : "+startDate);
        console.log("endDate : "+endDate);
        console.log("los : "+los);

        var result = {};
        var tla;

        for (var i = 0; i < tlas.length; i++) {
            tla = tlas[i];
            result[tla] = [];
        }

        //Find a match for the TLA where flying from date 
        var cursor = db.collection('processedFlightsData').find({$and: 
            [ {destination:{$in: tlas}},
              {departure: {$gte: startDate, $lt: endDate}},
              {arrival: {$gte: startDate, $lt: endDate}} ]
        });

        cursor.each(function(err, doc) {
            if (doc != null) {
                //console.log(doc);
                var arrival = new Date(doc['arrival']);
                var departure = new Date(doc['departure']);
                var price = doc['minPrice'];
                var dest = doc['destination'];
                //add length of stay to the fetched departure date
                departure.addDays(parseInt(7));
                //If departure + length of stay is equal to predicted arrival time we have a deal
                if (departure.getTime() === arrival.getTime()) {
                    result[dest].push({departure:departure.toISOString(), price:price});
                }
            } 
            else {
                //Gather hotel data for each flight data result
                callback(result);
            }
        });
    };


    var gatherHotelData = function (rid, startDate, endDate, db, callback) {
            var result = [];

            console.log("RID: " + parseInt(rid, 10));
            var cursor = db.collection('regionTrendsData').aggregate(
                             [{ $match: {$and: [{pid: parseInt(rid, 10)},
                                                {stayDate: {$gte: startDate, $lt: endDate}}]
                                        }},
                                        {$group:{_id: { pid:"$pid",stayDate:"$stayDate"}, 
                                        avgPrice: { $avg: "$price" }}
                            }]);


        cursor.each(function(err, doc) {
            if (doc != null) {
                //console.log(doc);
                var stayDate = new Date(doc['_id']['stayDate']);
                var rid = doc['_id']['pid'];
                var price = doc['avgPrice'];
                result.push({rid:rid, stayDate:stayDate.toISOString(), price:price});
            } 
            else {
                callback(result);
            }
        });
    };

    function getParameterByName(name, url) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(url);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    //get some server data for sending it to the client
    var getMongoData = function(req, res) {
        console.log(req.protocol+"://"+req.host+req.originalUrl);
        var rid = getParameterByName('regionId',req.originalUrl);
        var regionidsToTlas = getParameterByName('regionidsToTlas',req.originalUrl).split(',');
        var departDateVal = getParameterByName('departDate',req.originalUrl);
        var los = getParameterByName('los',req.originalUrl);

        var combinedResult = {};
        console.log('rid : '+rid);
        console.log('regionidsToTlas : '+regionidsToTlas);
        console.log('departDate : '+departDateVal);
        console.log('los : '+los);
        console.log(typeof regionidsToTlas);

        var departDate = new Date(departDateVal);

        var startDate = new Date(departDate.getTime()),
            endDate = new Date(departDate.getTime()),
            hotelPrices={},
            flightPrices={},
            pricePackages = [],
            bestDeal = null;

        startDate = startDate.addDays(-7);//Subtract 7 days from starting date
        endDate = endDate.addDays(parseInt(los)+7);//Add 7 days  and length of stay to the startDate

        var url = 'mongodb://localhost/tinkerbell-db';
        /*
        MongoClient.connect(url, function(err, db) {
            console.log("Connected correctly to Joshua's server at http://10.0.17.180:27017/tellme-db.");
            db.collection('regionTrendsData').findOne(function(err, item){
                if(err){
                    console.log("Error! ", err);
                    db.close();
                }
                console.log("Pulling one record!");
                console.log(JSON.stringify(item, null, 4));
                console.log("Closing the db...");
                db.close();
            });
        });
        */

        MongoClient.connect(url, function(err, db) {

            //First gather flight data
            gatherFlightData(regionidsToTlas, startDate.toISOString(), endDate.toISOString(), los, db, function(flightResult) {
                console.log(flightResult);

                //Gather hotel data for every flight data result
                gatherHotelData(rid, startDate.toISOString(), endDate.toISOString(), db, function (hotelResult) {

                //Loop over hotels data, map staydate to price
                for (var j = 0; j < hotelResult.length; j++) {
                    if (hotelResult[j]["rid"] == rid) {
                        hotelPrices[hotelResult[j]["stayDate"]] = Math.round(hotelResult[j]["price"]);
                    }
                }
                console.log(hotelPrices);

                //Loop over flights data, map departdate to tla/price
                var tlas = regionidsToTlas;
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
                            } 
                            else {
                                flightPrices[depart] = {price: flightPrice, tla: tlas[j]};
                            }
                        }
                    }

                }

                console.log(flightPrices);

                /*Loop over each potential trip interval. Sum each interval
                package total, and add to list.*/
                var startIntervalDate = new Date(startDate.getTime());
                var maxStartDate = new Date(endDate.getTime());

                //maxStartDate.addDays(-los);
                maxStartDate.addDays(-7);

                while (startIntervalDate < maxStartDate) {
                    var hotelSum = 0;
                    var currStayDate = new Date(startIntervalDate.getTime());
                    console.log("currStayDate : "+currStayDate.toISOString());
                    for (var j = 0; j < 7; j++) {
                        if (currStayDate.toISOString() in hotelPrices) {
                            hotelSum += hotelPrices[currStayDate.toISOString()];
                        }
                        currStayDate.addDays(1);
                    }

                    if (hotelSum > 0 && currStayDate.toISOString() in flightPrices) {
                        var flightPrice = Math.round((flightPrices[currStayDate.toISOString()]['price'] / 100));
                        var packagePrice = flightPrice + hotelSum;
                        if (packagePrice <= 50000 && packagePrice >= 0) {

                            var currentDeal = {
                                rid: rid,
                                tla: flightPrices[currStayDate.toISOString()]['tla'],
                                hotelprice: hotelSum,
                                flightprice: flightPrice,
                                totalprice: packagePrice,
                                date: currStayDate.toISOString()
                            };

                            pricePackages.push(currentDeal);

                            if (bestDeal === null || packagePrice < bestDeal["totalprice"]) {
                                bestDeal = currentDeal;
                            }

                        }
                    }
                    startIntervalDate.addDays(1);
                }
                console.log("TOTAL DEALS: ");
                console.log(pricePackages.length );
                console.log("ALL DEALS: ");
                console.log(pricePackages);
                console.log("BEST DEAL: ");
                console.log(bestDeal);

                combinedResult.totalDeals = pricePackages.length;
                combinedResult.pricePackages = pricePackages;
                combinedResult.bestDeal = bestDeal;
                //console.log(combinedResult);
                res.send(combinedResult);
                console.log("Closing the db...");
                db.close();

            });

        });

    });

    //console.log(combinedResult);
    //res.send('hello mongo');
    }
    //
    router.get('/mymongo*', getMongoData);

    return router;
};
