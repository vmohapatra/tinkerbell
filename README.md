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

