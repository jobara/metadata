/*!
Copyright 2013 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

/* global PouchDB, emit */

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("gpii.tests");

    fluid.defaults("gpii.tests.simple.dataSource", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        invokers: {
            get: "fluid.identity",
            "delete": "fluid.identity",
            set: {
                funcName: "gpii.tests.simple.dataSource.set"
            }
        }
    });

    gpii.tests.simple.dataSource.set = function (directModel, callback) {
        setTimeout(function () {
            callback("set completed", directModel);
        }, 100);
    };

    fluid.defaults("gpii.tests.queuedDataSource", {
        gradeNames: ["gpii.queuedDataSource", "autoInit"],
        members: {
            fireRecord: {
                requestQueued: 0,
                requestUnqueued: 0,
                isActive: 0
            }
        },
        dataSourceType: "gpii.tests.simple.dataSource",
        listeners: {
            "requestQueued": {
                func: "{that}.record",
                args: ["requestQueued"]
            },
            "requestUnqueued": {
                func: "{that}.record",
                args: ["requestUnqueued"]
            }
        },
        modelListeners: {
            "isActive": {
                funcName: "{that}.record",
                excludeSource: ["init"],
                args: ["isActive"]
            }
        },
        invokers: {
            record: {
                funcName: "gpii.tests.queuedDataSource.record",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });

    gpii.tests.queuedDataSource.record = function (that, recordName) {
        that.fireRecord[recordName] += 1;
    };

    gpii.tests.verifyQueuedDataSource = function (grade, cleanup) {
        var expectedFireRecord = {
            requestQueued: 3,
            requestUnqueued: 3,
            isActive: 6
        };
        var count = 0;

        var that = grade();
        that.set({model: 1}, function () {
            jqUnit.assertTrue("Set call 1 should be triggered in the correct order", 1, ++count);
        });
        that.set({model: 2}, function () {
            jqUnit.assertTrue("Set call 2 should be triggered in the correct order", 2, ++count);
        });
        that.set({model: 3}, function () {
            jqUnit.assertTrue("Set call 3 should be triggered in the correct order", 3, ++count);
            jqUnit.assertDeepEq("The event record should have been updated appropriately.", expectedFireRecord, that.fireRecord);
            cleanup();
        });
    };

    jqUnit.asyncTest("Queued DataSource", function () {
        gpii.tests.verifyQueuedDataSource(gpii.tests.queuedDataSource, jqUnit.start);
    });

    gpii.tests.cleanUp = function (dbname) {
        PouchDB.destroy(dbname, jqUnit.start);
    };

    jqUnit.asyncTest("PouchDB DataSource - Creation", function () {
        var dbname = "test";
        var ds = gpii.pouchdb.dataSource({
            databaseName: dbname
        });

        ds.database.info(function (err, result) {
            jqUnit.assertEquals("The database should have been created",  dbname, result.db_name);
            gpii.tests.cleanUp (dbname);
        });
    });

    jqUnit.asyncTest("PouchDB DataSource - Set: create document - POST", function () {
        var dbname = "test";
        var ds = gpii.pouchdb.dataSource({
            databaseName: dbname
        });

        var doc = {
            "model": "data"
        };

        ds.set(doc, function (createdDoc) {
            ds.database.get(createdDoc.id).then(function (getDoc) {
                jqUnit.assertEquals("The document should be created", doc.model, getDoc.model);
                gpii.tests.cleanUp (dbname);
            });
        });
    });

    jqUnit.asyncTest("PouchDB DataSource - Set: create document - PUT", function () {
        var dbname = "test";
        var ds = gpii.pouchdb.dataSource({
            databaseName: dbname
        });

        var doc = {
            id: "test",
            "model": "data"
        };

        ds.set(doc, function () {
            ds.database.get(doc.id).then(function (getDoc) {
                jqUnit.assertEquals("The document should be created", doc.model, getDoc.model);
                gpii.tests.cleanUp (dbname);
            });
        });
    });

    jqUnit.asyncTest("PouchDB DataSource - Set: update document", function () {
        var dbname = "test";
        var ds = gpii.pouchdb.dataSource({
            databaseName: dbname
        });

        var doc = {
            id: "test",
            "model": "new"
        };

        ds.database.put({
            _id: doc.id,
            "model": "original"
        }).then(function () {
            ds.set(doc, function () {
                ds.database.get(doc.id).then(function (getDoc) {
                    jqUnit.assertEquals("The document should be updated", doc.model, getDoc.model);
                    gpii.tests.cleanUp (dbname);
                });
            });
        });
    });

    jqUnit.asyncTest("PouchDB DataSource - Get", function () {
        var dbname = "test";
        var ds = gpii.pouchdb.dataSource({
            databaseName: dbname
        });

        var doc = {
            id: "test",
            "model": "data"
        };

        ds.database.put({
            _id: doc.id,
            "model": doc.model
        }).then(function () {
            ds.get(doc, function (result) {
                jqUnit.assertEquals("The model should have been returned", doc.model, result);
                gpii.tests.cleanUp (dbname);
            });
        });
    });

    jqUnit.asyncTest("PouchDB DataSource - Get: query view", function () {
        var dbname = "test";
        var ds = gpii.pouchdb.dataSource({
            databaseName: dbname
        });

        var view = {
            _id: "_design/nameView",
            views: {
                "nameView": {
                    map: function (doc) {
                        emit(doc.name);
                    }.toString()
                }
            }
        };
        var newDocName = "JavaScript";

        ds.database.put(view).then(function () {
            ds.database.post({name: newDocName});
        }).then(function () {
            ds.get({id: "nameView", query: {}}, function (doc) {
                jqUnit.assertEquals("The correct value should be returned from the query.", newDocName, doc[0].key);
                gpii.tests.cleanUp (dbname);
            });
        });
    });

    jqUnit.asyncTest("PouchDB DataSource - Delete", function () {
        var dbname = "test";
        var ds = gpii.pouchdb.dataSource({
            databaseName: dbname
        });

        var doc = {
            id: "test",
            "model": "data"
        };

        ds.database.put({
            _id: doc.id,
            "model": doc.model
        }).then(function () {
            ds["delete"](doc, function () {
                ds.database.get(doc.id)["catch"](function (err) {
                    jqUnit.assertTrue("The document should no longer exist", err);
                    gpii.tests.cleanUp (dbname);
                });
            });
        });
    });

    jqUnit.asyncTest("PouchDB DataSource - afterChange event", function () {
        var dbname = "test";
        var ds = gpii.pouchdb.dataSource({
            databaseName: dbname,
            listeners: {
                afterChange: [{
                    listener: "jqUnit.assert",
                    args: ["The afterChange event should have fired."]
                }, {
                    listener: "gpii.tests.cleanUp",
                    args: [dbname],
                    priority: "last"
                }]
            }
        });

        var doc = {
            id: "test",
            "model": "data"
        };

        ds.database.put({
            _id: doc.id,
            "model": doc.model
        });
    });

    jqUnit.asyncTest("PouchDB DataSource - createView: view added", function () {
        var dbname = "test";
        var ds = gpii.pouchdb.dataSource({
            databaseName: dbname
        });

        var viewSetup = {
            name: "testView",
            map: function (doc) {
                emit(doc.name, 1);
            },
            reduce: "_count"
        };

        ds.createView(viewSetup.name, viewSetup.map, viewSetup.reduce, function () {
            ds.database.get("_design/" + viewSetup.name).then(function (doc) {
                jqUnit.assertEquals("The map function should be added", viewSetup.map, doc.views[viewSetup.name].map);
                jqUnit.assertEquals("The reduce function should be added", viewSetup.reduce, doc.views[viewSetup.name].reduce);
                gpii.tests.cleanUp (dbname);
            });
        });
    });

    jqUnit.asyncTest("PouchDB DataSource - createView: assert view", function () {
        var dbname = "test";
        var ds = gpii.pouchdb.dataSource({
            databaseName: dbname
        });

        var viewSetup = {
            name: "petView",
            map: function (doc) {
                fluid.each(doc.pets, function (names, species) {
                    emit(species, names.length);
                });
            },
            reduce: "_sum"
        };

        var owner = {
            pets: {
                dog: ["Spot", "Fido"],
                cat: ["Fluffy", "Whiskers"],
                bird: ["Polly"]
            }
        };

        ds.createView(viewSetup.name, viewSetup.map, viewSetup.reduce, function () {
            ds.database.post(owner).then(function () {
                ds.get({id: viewSetup.name, query: {reduce: true}}, function (doc) {
                    jqUnit.assertEquals("Total number of pets should be calculated.", 5, doc[0].value);
                    gpii.tests.cleanUp (dbname);
                });
            });
        });
    });

    fluid.defaults("gpii.tests.pouchdb.queuedDataSource", {
        gradeNames: ["gpii.pouchdb.queuedDataSource", "gpii.tests.queuedDataSource", "autoInit"],
        dataSourceOptions: {
            databaseName: "queuedTest"
        }

    });

    jqUnit.asyncTest("Queued PouchDB DataSource", function () {
        gpii.tests.verifyQueuedDataSource(gpii.tests.pouchdb.queuedDataSource, function () {
            gpii.tests.cleanUp("queuedTest");
        });
    });

})(jQuery, fluid);
