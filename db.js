
const mysql = require('mysql2');
const fs = require('fs');


const dotenv = require('dotenv');
dotenv.config();


// Configuration object for your SQL Server connection

//remember that we are selecting the data from projects.(table name)

const configurations= {
  host: process.env.HOST,//only copy the last value of the .env so it knows it.
  database: process.env.DATABASE,
  user: process.env.CLIENT,
  password: process.env.PASSWORD,
  port: process.env.PORT,
  ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")},
  
};

console.log(configurations)

const db = mysql.createConnection(configurations).promise();

db.connect(
  function (err) { 
  if (err) { 
      console.log("!!! Cannot connect !!! Error:");
      throw err;
  }
  else
  {
     console.log("Connection established.");
     const value = db.query('SELECT * FROM users');
    console.log(value)
  }
});


module.exports = db;



/*
for local testing....
const mysql = require('mysql2')
const db = mysql.createPool({//make sure your mysql server is started for this to create connection
    host: 'localhost',  //maybe add error handling later on to print something to make sure database is loaded.
    user: 'root',
    password: process.env.PASSWORD,
    database: process.env.LOCALDATABASE//we can get access to all tables in the database
}).promise()   //allows us to use async await with db to make sure it runs.








module.exports = db;
*/