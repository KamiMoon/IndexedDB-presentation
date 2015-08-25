window.onload = function() {
    var UI = {

        serializeForm: function(formId) {
            var form = document.getElementById(formId);
            var formObject = {};
            var current = null;
            var i = 0;

            for (i = 0; i < form.length; i++) {
                current = form[i];

                if (current.name && current.value) {
                    formObject[current.name] = current.value;
                }

            }

            return formObject;
        },

        renderEmployeesList: function() {

            EmployeesService.getEmployees({}, function(employees) {
                var html = '';
                var currentEmployee = null;
                var i = 0;
                var listObjectsEl = document.getElementById('list-objects');

                for (i = 0; i < employees.length; i++) {
                    currentEmployee = employees[i];
                    html += '<tr>';
                    html += '<td>' + currentEmployee.name + '</td>';
                    html += '<td>' + currentEmployee.age + '</td>';
                    html += '<td>' + currentEmployee.description + '</td>';
                    html += '</tr>';
                }

                listObjectsEl.innerHTML = html;
            });

        },

        add: function(event) {
            event.preventDefault();
            var formObject = UI.serializeForm("add-form");

            EmployeesService.addEmployee(formObject, function(id) {
                console.log("Created employee with id: " + id);
                UI.renderEmployeesList();
            });

            return false;
        },

        search: function(event) {
            event.preventDefault();
            var formObject = UI.serializeForm("search-form");

            console.log(formObject);
            return false;
        },

        init: function() {
            //var searchButton = document.getElementById("search-button");
            //searchButton.addEventListener("click", UI.search);

            var addButton = document.getElementById("add-button");
            addButton.addEventListener("click", UI.add);

            UI.renderEmployeesList();

        }
    };

    var db;
    var DB_NAME = "CrudDB";
    var VERSION = 3;
    var EMPLOYEES = "employees";
    var READ_WRITE = "readwrite";
    var READ_ONLY = "readonly";

    var openDB = function() {
        var request = window.indexedDB.open(DB_NAME, VERSION);

        request.onerror = function(event) {
            // Do something with request.errorCode!
            console.error(request.errorCode);
        };
        request.onsuccess = function(event) {
            console.info("DB created: " + DB_NAME + " v" + VERSION);
            db = event.target.result;

            db.onerror = function(event) {
                // Generic error handler for all errors targeted at this database's
                // requests!
                alert("Database error: " + event.target.errorCode);
            };


            //initialize UI after DB is open
            UI.init();

        };

        //Used to change structure of the database
        //NOTE: MUST CHANGE VERSION in order for changes to be applied here
        request.onupgradeneeded = function(event) {
            console.log("onupgradeneeded triggered");
            var db = event.target.result;

            //Employee "table" with autoincremeted id
            var objectStore = db.createObjectStore(EMPLOYEES, {
                autoIncrement: true
            });

            //objectStore.createIndex(EMPLOYEES, "name", {
            //    unique: false
            //});

        };
    };

    var EmployeesService = {

        addEmployee: function(employee, callback) {
            var transaction = db.transaction([EMPLOYEES], READ_WRITE);
            var store = transaction.objectStore(EMPLOYEES);
            var id = null;

            var request = store.add(employee);

            request.onsuccess = function(event) {
                id = event.target.result;
                console.log("addEmployee:request:onsuccess");
            };

            transaction.oncomplete = function(event) {
                console.log("addEmployee:transaction:oncomplete");
                callback(id);
            };
        },

        getEmployees: function(criteria, callback) {
            var employees = [];

            var transaction = db.transaction([EMPLOYEES], READ_ONLY);
            var store = transaction.objectStore(EMPLOYEES);

            store.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    employees.push(cursor.value);
                    cursor.continue();
                } else {
                    //done
                }
            };

            transaction.oncomplete = function(event) {
                console.log("getEmployees:transaction:oncomplete");
                callback(employees);
            };

        }
    };


    //start App
    openDB();


};
