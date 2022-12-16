const http = require("http");
const fs = require("fs");
const express = require("express");   /* Accessing express module */
const app = express();  /* app is a request handler function */
const bodyParser = require("body-parser");
const path = require("path");

app.use(express.static(__dirname + '/miscellaneous'));
/* directory where templates will reside */
app.set("views", path.resolve(__dirname, "templates"));
/* view/templating engine */
app.set("view engine", "ejs");

/* implementing module for database management (helper functions) */
const Helper = require("./database");
let databaseHelper = new Helper();

/* takes the number input as the port number */
let portNumber = process.argv[2];
app.listen(portNumber);
console.log(`Web server is running at http://localhost:${portNumber}`);
const prompt = "Stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.setEncoding("utf8");

/* Initializes request.body with post information */ 
app.use(bodyParser.urlencoded({extended: false}));

/* listening for incorrect input and/or "stop" command */
process.stdin.on('readable', () => {  
	let dataInput = process.stdin.read();
	if (dataInput !== null) {
		let command = dataInput.trim(); 
		if (command === "stop") {
            /* when inputted "stop" server will shutdown */
			console.log("Shutting down the server");
            process.exit(0);
        } else {
			/*  */
			console.log(`Invalid command: ${command}`);
		}
        /* continues with listening */
        process.stdout.write(prompt);
        process.stdin.resume();
    }
});

/* defines the list of ___________________ */
let symbols;
if (symbols === undefined) {
    let fileContent = fs.readFileSync('private/symbols.json', 'utf-8');
    let json = JSON.parse(fileContent);
    symbols = Object.keys(json.symbols);
    let plot = {
        name: "plot",
    }

    databaseHelper.main(databaseHelper.find, plot).then(function(result) {
        if (result === null) {
            let start = 0;
            plot["x"] = new Array(100 - start).fill(0).map(() => start++);
            plot["y"] = new Array(100).fill(0);
        }
        databaseHelper.main(databaseHelper.insertUser, plot);
    });
}

/* for the index.ejs template file */
app.get("/", function (request, response) {
    let find = databaseHelper.find;
    databaseHelper.main(find, { name: "plot" }).then(function(result) {
        let plot = {
            x: result.x,
            y: result.y,
        };
        response.render("index", plot);
    });
})

/* for the addUser.ejs template file */
app.get("/add-user", function (request, response) {
    let variables = {
        formURL: `${request.originalUrl}`,
        confirmationMessage: `Are you sure you want to add the provided info?`,
    };
    response.render("addUser", variables);
});

/* for the addSuccess.ejs and addFailed.ejs template file */
app.post("/add-user", function (request, response) {
    let {name, email, age} = request.body;
    let add = databaseHelper.insertUser;
    let user = {
        name: name,
        email: email,
        age: age,
    };

    databaseHelper.main(add, user).then(function(result) {
        if (result === null) {
            /* Failed */
            response.render("addFail", user);
        }
        else {
            /* Successful */
            response.render("addSuccess", user);
        }
    });
});

/* for the searchUser.ejs template file */
app.get("/search-users", function (request, response) {
    let variables = {
        formURL: `${request.originalUrl}`,
        confirmationMessage: `Are you sure you want to search for users with the provided age and older?`,
    };
    response.render("searchUsers", variables);
});

/* for the searchSuccess.ejs and searchFailed.ejs template file */
app.post("/search-users", function (request, response) {
    const age = request.body.age;
    let variables = {
        age: age,
    };
    const search = databaseHelper.searchUsers;

    databaseHelper.main(search, age).then(function (usersWithAge) {
        if (usersWithAge === null || usersWithAge.length === 0) {
            /* Failed */
            response.render("searchFail", variables);
        } else {
            /* Successful */
            let tableOfUsers = "<table border='1'><thead><tr><th>Name</th><th>Age</th></tr></thead><tbody>";
            usersWithAge.sort((a, b) => Number(a["age"]) - Number(b["age"]));
            usersWithAge.forEach(element => tableOfUsers += `<tr><td>${element["name"]}</td><td>${element["age"]}</td></tr>`);
            tableOfUsers += "</tbody></table>";
            variables["tableOfUsers"] = tableOfUsers;
            response.render("searchSuccess", variables);
        }
    });
});

/* for the deleteUser.ejs template file */
app.get("/delete-user", function (request, response) {
    let variables = {
        formURL: `${request.originalUrl}`,
        confirmationMessage: `Are you sure you want to delete the user?`,
    };
    response.render("deleteUser", variables);
});

/* for the deleteSuccess.ejs and deleteFailed.ejs template file */
app.post("/delete-user", function (request, response) {
    let remove = databaseHelper.removeUser;
    let { name, email, age } = request.body;
    let user = {
        name: name,
        email: email,
    };

    databaseHelper.main(remove, user).then(function (result) {
        if (result === null) {
            /* Failed */
            user["age"] = "NONE";
            response.render("deleteFail", user);
        } else {
            /* Successful */
            user["age"] = result.age;
            response.render("deleteSuccess", user);
        }
    });
});

/* for the exchange.ejs template file */
app.get("/exchange", function (request, response) {
    let fromCurrency = '<select name="fromCurrency" id="fromCurrency" required>';
    let toCurrency = '<select name="toCurrency" id="toCurrency" required>';
    let currencySymbols = "";

    symbols.forEach(element => currencySymbols += `<option value="${element}">${element}</option>`);
    fromCurrency += currencySymbols;
    toCurrency += currencySymbols;
    fromCurrency += '</select>';
    toCurrency += '</select>';

    let variables = {
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
    };

    response.render("exchange", variables);
});