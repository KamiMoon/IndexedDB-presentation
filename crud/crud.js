var UI = null;

window.onload = function() {
    UI = {

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

            return {
                el: form,
                model: formObject
            };
        },

        refreshEmployeesList: function() {
            EmployeesService.getEmployees({}, function(event, employees) {
                UI.renderEmployeesList(employees);
            });
        },

        renderEmployeesList: function(employees) {
            var html = '';
            var currentEmployee = null;
            var i = 0;
            var listObjectsEl = document.getElementById('list-objects');

            for (i = 0; i < employees.length; i++) {
                currentEmployee = employees[i];
                html += '<tr>';
                html += '<td> <input type="text" id="update_name_' + currentEmployee._id + '" value="' + currentEmployee.name + '"></input></td>';
                html += '<td> <input type="text" id="update_age_' + currentEmployee._id + '" value="' + currentEmployee.age + '"></input></td>';
                html += '<td> <input type="text" id="update_description_' + currentEmployee._id + '" value="' + currentEmployee.description + '"></input></td>';
                html += '<td><a href="#" onclick="UI.updateEmployee(' + currentEmployee._id + ');">Save</a></td>';
                html += '<td><a href="#" onclick="UI.deleteEmployee(' + currentEmployee._id + ');">Delete</a></td>';
                html += '</tr>';
            }

            listObjectsEl.innerHTML = html;

        },

        feedback: function(text) {
            document.getElementById('feedback').innerHTML = text;
        },

        add: function(event) {
            event.preventDefault();
            var form = UI.serializeForm("add-form");

            EmployeesService.addEmployee(form.model, function(event, id) {
                console.log("Created employee with id: " + id);
                UI.refreshEmployeesList();
                UI.feedback('Added Employee');

                form.el.reset();
            });

            return false;
        },

        deleteEmployee: function(id) {

            EmployeesService.deleteEmployee(id, function(event) {
                UI.refreshEmployeesList();
                UI.feedback('Deleted Employee');
            });

            return false;
        },

        updateEmployee: function(id) {

            var formObject = {
                _id: id,
                name: document.getElementById('update_name_' + id).value,
                age: document.getElementById('update_age_' + id).value,
                description: document.getElementById('update_description_' + id).value
            };

            EmployeesService.updateEmployee(formObject, function(event) {
                UI.refreshEmployeesList();
                UI.feedback('Updated Employee');
            });

            return false;
        },

        init: function() {
            var addButton = document.getElementById("add-button");
            addButton.addEventListener("click", UI.add);

            UI.refreshEmployeesList();
        }
    };

    var db;
    var DB_NAME = "CrudDB";
    var VERSION = 4;
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

            //Employee "table" with autoincremeted _id like in MongoDB
            var objectStore = db.createObjectStore(EMPLOYEES, {
                keyPath: '_id',
                autoIncrement: true
            });

            //objectStore.createIndex(EMPLOYEES, "name", {
            //    unique: false
            //});

        };
    };

    var getObjectStore = function(store_name, mode) {
        var transaction = db.transaction(store_name, mode);
        return transaction.objectStore(store_name);
    };

    var EmployeesService = {

        addEmployee: function(employee, callback) {
            var store = getObjectStore(EMPLOYEES, READ_WRITE);
            var id = null;

            var request = store.add(employee);

            request.onsuccess = function(event) {
                id = event.target.result;
                callback(event, id);
            };
        },

        getEmployees: function(criteria, callback) {
            var employees = [];
            var store = getObjectStore(EMPLOYEES, READ_ONLY);

            store.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    employees.push(cursor.value);
                    cursor.continue();
                } else {
                    callback(event, employees);
                }
            };

        },

        getEmployee: function(id, callback) {
            var store = getObjectStore(EMPLOYEES, READ_ONLY);

            store.get(id).onsuccess = function(event) {
                callback(event, event.target.result);
            };
        },

        updateEmployee: function(employee, callback) {
            var store = getObjectStore(EMPLOYEES, READ_WRITE);

            store.put(employee).onsuccess = callback;
        },

        deleteEmployee: function(id, callback) {
            var store = getObjectStore(EMPLOYEES, READ_WRITE);

            store.delete(id).onsuccess = callback;
        }
    };


    //start App
    openDB();

};
