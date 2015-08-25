window.onload = function() {
    var UI = {

        serializeForm: function(formId) {
            var form = document.getElementById(formId);
            var formObject = {};
            var current = null;
            var i = 0;

            for (i = 0; i < form.length; i++) {
                current = form[i];

                if (current.id && current.value) {
                    formObject[current.id] = current.value;
                }

            }

            return formObject;
        },

        add: function(event) {
            event.preventDefault();
            var formObject = UI.serializeForm("search-form");

            EmployeesService.addEmployee(function(event, id) {
                console.log("Add employee with ID:" + id);
            });

            return false;
        },

        search: function(event) {
            event.preventDefault();
            var formObject = UI.serializeForm("add-form");

            console.log(formObject);
            return false;
        },

        init: function() {
            var searchButton = document.getElementById("search-button");
            searchButton.addEventListener("click", UI.search);

            var addButton = document.getElementById("add-button");
            addButton.addEventListener("click", UI.add);

        }
    };

    UI.init();



    // In the following line, you should include the prefixes of implementations you want to test.
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    // DON'T use "var indexedDB = ..." if you're not in a function.
    // Moreover, you may need references to some window.IDB* objects:
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
    if (!window.indexedDB) {
        window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
    }

    var db;
    var DB_NAME = "CrudDB";
    var VERSION = 2;
    var EMPLOYEES = "employees";
    var READ_WRITE = "readwrite";

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

        objectStore.createIndex(EMPLOYEES, "name", {
            unique: false
        });
    };

    var EmployeesService = {

        addEmployee: function(employee, callback) {
            var transaction = db.transaction([EMPLOYEES], READ_WRITE);
            var store = transaction.objectStore(EMPLOYEES);
            var id = null;

            var request = store.add(employee);
            request.onsuccess = function(event) {
                //event.target.result == customerData[i].ssn;
                console.log(event.target.result);
            };

            transaction.oncomplete = function(event) {
                callback(event, id);
            };

            transaction.onerror = function(event) {
                console.error(event);
            };

        }
    };

};
