#!/bin/sh
#http://stackoverflow.com/questions/6753330/specify-which-database-to-use-in-mongodb-js-script
#mongo <name of db> --eval "db.runCommand( <js in here> );"
#Drop these preexisting tables if they exist
mongo tinkerbell-db --eval 'db.regionTrendsData.drop()'
mongo tinkerbell-db --eval 'db.processedFlightsData.drop()'
#import from csv files the preloaded tag data
mongoimport -d tinkerbell-db -c regionTrendsData --type csv --file regionTrendsData.csv --headerline
mongoimport -d tinkerbell-db -c processedFlightsData --type csv --file processedFlightData.csv --headerline
