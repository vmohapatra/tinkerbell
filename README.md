# tinkerbell

Expressjs based Node web app 

Pre-requisites

Ensure you have node and npm installed.

Running the application

To run the app in dev environment, execute

$ ./bin/www
or

$ node server.js
Command above will launch express in cluster mode if your development machine has more than 1 cpu/core. If you want to run in non-cluster mode, use the following commands

$ ./bin/www --standalone
or

$ node server.js --standalone
To start the app in any other environment, set NODE_ENV environment variable to one of test, int or prod

In your browser of choice, navigate to http://localhost:12345.


//To load data
IMPORTANT - If you are building or deploying for the ***FIRST TIME ONLY*** :For windows machines, go to data folder in tinkerbell project(load script  located at /data/load.bat(sh)) and run load.bat. This will load the setup data necessary for the project into the database.
    NOTE - On Mac you may have to add execution permission to load.sh with the following command: chmod +x load.sh
    The default name of database is prototype
 
 cd tinkerbell/
 cd data
 sh load.sh

1) Install mongodb and nodejs on your local machine. for instructions to install please go to their resp. websites.
https://www.mongodb.org
https://nodejs.org/en/

(I recommend installing mongodb from Homebrew on Mac as that is really hassle free.)

https://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/

https://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/

2) To start mongodb, open cmd.exe and navigate to bin directory under mongodb installation directory and type mongod.exe (mongod on Mac) . This will start mongodb database daemon, databases will be stored in the data directory you have chosen as part of mongodb installation.

If you want to store databases in a different folder, type the following command. (I recommend this)
type  mongod.exe --dbpath <path to the data folder>
