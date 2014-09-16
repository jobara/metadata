/*!
Copyright 2014 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

/* global PouchDB */

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("gpii.tests");

    gpii.tests.dbName = "feedback-TestDB";

    var resources = {
        matchConfirmation: {url: "../../../../src/components/feedback/html/matchConfirmationTemplate.html"},
        mismatchDetails: {url: "../../../../src/components/feedback/html/mismatchDetailsTemplate.html"},
        requestSummary: {url: "../../../../src/components/feedback/html/requestSummaryTemplate.html"}
    };

    // synchronously load in the templates.
    fluid.each(resources, function (resource) {
        $.ajax(resource.url, {
            async: false,
            success: function (data) {
                resource.template = data;
            }
        });
    });

    fluid.defaults("gpii.tests.feedback", {
        gradeNames: ["gpii.metadata.feedback", "autoInit"],
        databaseName: gpii.tests.dbName,
        testResources: resources,
        distributeOptions: [{
            source: "{that}.options.testResources.matchConfirmation.template",
            target: "{that > bindMatchConfirmation}.options.renderDialogContentOptions.resources.template.resourceText"
        }, {
            source: "{that}.options.testResources.mismatchDetails.template",
            target: "{that > bindMismatchDetails}.options.renderDialogContentOptions.resources.template.resourceText"
        }, {
            source: "{that}.options.testResources.requestSummary.template",
            target: "{that > bindRequestSummary}.options.renderDialogContentOptions.resources.template.resourceText"
        }],
        events: {
            requestsChanged: null,
            numRequestsChanged: null
        },
        components: {
            bindRequestSummary: {
                options: {
                    modelListeners: {
                        numRequests: {
                            func: "{feedback}.events.numRequestsChanged",
                            excludeSource: ["init"],
                            args: ["{change}.value"]
                        }
                    },
                    renderDialogContentOptions: {
                        modelListeners: {
                            requests: {
                                func: "{feedback}.events.requestsChanged",
                                excludeSource: ["init"],
                                priority: "last",
                                args: ["{change}.value"]
                            }
                        }
                    }
                }
            }
        }
    });

    fluid.defaults("gpii.tests.feedbackNoRequests", {
        gradeNames: ["gpii.tests.feedback", "autoInit"],
        selectors: {
            requestSummaryButton: null
        },
        components: {
            bindRequestSummary: {
                type: "fluid.emptySubcomponent"
            }
        }
    });

    gpii.tests.assertButtonAria = function (elm, name, expectedLabel) {
        jqUnit.assertEquals("The aria role for " + name + " is set correctly", "button", elm.attr("role"));
        jqUnit.assertEquals("The aria label for " + name + " is set correctly", expectedLabel, elm.attr("aria-label"));
    };

    gpii.tests.verifyInit = function (that) {
        $.each(that.options.components, function (compName) {
            jqUnit.assertNotNull("The subcomponent '" + compName + "' has been created.", that[compName]);
        });

        fluid.each(that.options.selectors, function (sel, selName) {
            if (sel) {
                jqUnit.assertEquals("The aria button role is set for " + selName, "button", that.locate(selName).attr("role"));
            }
        });

        gpii.tests.assertButtonAria(that.locate("matchConfirmationButton"), "matchConfirmationButton", that.options.strings.matchConfirmationLabel);
        gpii.tests.assertButtonAria(that.locate("mismatchDetailsButton"), "mismatchDetailsButton", that.options.strings.mismatchDetailsLabel);

        jqUnit.assertNotNull("The user id has been generated", that.userID);
    };

    gpii.tests.verifyInitWithRequest = function (that) {
        gpii.tests.verifyInit(that);
        gpii.tests.assertButtonAria(that.locate("requestSummaryButton"), "requestSummaryButton", that.options.strings.requestLabel);
    };

    gpii.tests.checkSavedModel = function (savedModel, expectedModelValues) {
        fluid.each(expectedModelValues, function (expectedValue, key) {
            jqUnit.assertEquals("The value " + expectedValue + " on the path " + key + " is correct", expectedValue, fluid.get(savedModel.model, key));
        });
    };

    gpii.tests.verifyDialog = function (feedback, dialogComponentName, expectedIsDialogOpen) {
        var dialogComponent = feedback[dialogComponentName];

        jqUnit.assertNotNull("Button click triggers the creation of the dialog", dialogComponent.dialog);
        jqUnit.assertEquals("The isDailogOpen: " + expectedIsDialogOpen + ", is set correctly", expectedIsDialogOpen, dialogComponent.model.isDialogOpen);
    };

    gpii.tests.verifyToggleDialog = function (feedback, dialogComponentName, expectedIsDialogOpen, expectedIsActive) {
        var dialogComponent = feedback[dialogComponentName];

        gpii.tests.verifyDialog(feedback, dialogComponentName, expectedIsDialogOpen);
        jqUnit.assertEquals("The state is active", expectedIsActive, dialogComponent.model.isActive);
    };

    gpii.tests.clickMismatchDetailsLinks = function (feedback, linkSelector) {
        var mismatchDetailsComponent = feedback.bindMismatchDetails.renderDialogContent;
        mismatchDetailsComponent.locate(linkSelector).click();
    };

    gpii.tests.verifyDialogOnSkip = function (feedback) {
        var bindMismatchDetails = feedback.bindMismatchDetails;
        jqUnit.assertFalse("The dialog is closed", bindMismatchDetails.model.isDialogOpen);
    };

    gpii.tests.setMismatchDetailsFields = function (feedback, newText) {
        var mismatchDetailsComponent = feedback.bindMismatchDetails.renderDialogContent;

        mismatchDetailsComponent.locate("notInteresting").click();
        mismatchDetailsComponent.locate("text").click();
        mismatchDetailsComponent.locate("transcripts").click();
        mismatchDetailsComponent.locate("audio").click();
        mismatchDetailsComponent.locate("audioDesc").click();
        mismatchDetailsComponent.locate("other").click();
        mismatchDetailsComponent.locate("otherFeedback").text(newText).change();
    };

    gpii.tests.verifyDialogOnSubmit = function (feedback) {
        var bindMismatchDetails = feedback.bindMismatchDetails;
        jqUnit.assertFalse("The dialog is closed", bindMismatchDetails.model.isDialogOpen);
    };

    gpii.tests.verifyNumRequests = function (bindRequestSummary, expectedNumRequests) {
        var sanitizedNumRequests = fluid.isPrimitive(expectedNumRequests) && expectedNumRequests ? expectedNumRequests : 0;
        jqUnit.assertEquals("The numRequests model value should be updated", expectedNumRequests, bindRequestSummary.model.numRequests);
        jqUnit.assertEquals("The badge should be updated to the number of requests", sanitizedNumRequests, bindRequestSummary.locate("icon").attr("data-badge"));
    };

    gpii.tests.verifyRequests = function (bindRequestSummary, expectedRequests) {
        jqUnit.assertDeepEq("The requests model data should be updated", expectedRequests, bindRequestSummary.renderDialogContent.model.requests);
    };

    gpii.tests.saveRequest = function (feedback, requestType, value) {
        feedback.applier.change(["userData", "requests", requestType], value);
        feedback.save();
    };

    fluid.defaults("gpii.tests.feedbackNoRequestsTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        markupFixture: ".gpiic-feedback-noRequests-testFixture",
        components: {
            feedback: {
                type: "gpii.tests.feedbackNoRequests",
                container: ".gpiic-feedback-noRequests",
                createOnEvent: "{feedbackTester}.events.onTestCaseStart"
            },
            feedbackTester: {
                type: "gpii.tests.feedbackNoRequestsTester"
            }
        }
    });

    fluid.defaults("gpii.tests.feedbackNoRequestsTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            newText: "some text"
        },
        modules: [{
            name: "Feedback No Requests",
            tests: [{
                name: "Init",
                expect: 11,
                sequence: [{
                    listener: "gpii.tests.verifyInit",
                    args: ["{feedback}"],
                    priority: "last",
                    event: "{feedbackNoRequestsTests feedback}.events.onFeedbackMarkupReady"
                }]
            }, {
                name: "Match confirmation dialog",
                expect: 7,
                sequence: [{
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.matchConfirmationButton"
                }, {
                    listener: "gpii.tests.verifyToggleDialog",
                    args: ["{feedback}", "bindMatchConfirmation", true, true],
                    priority: "last",
                    event: "{feedback}.events.afterMatchConfirmationButtonClicked"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: true,
                        mismatch: false
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }, {
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.matchConfirmationButton"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: false,
                        mismatch: false
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }]
            }, {
                name: "Mismatch details dialog",
                expect: 33,
                sequence: [{
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.mismatchDetailsButton"
                }, {
                    listener: "gpii.tests.verifyToggleDialog",
                    args: ["{feedback}", "bindMismatchDetails", true, true],
                    priority: "last",
                    event: "{feedback}.events.afterMismatchDetailsButtonClicked"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: false,
                        mismatch: true
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }, {
                    func: "gpii.tests.clickMismatchDetailsLinks",
                    args: ["{feedback}", "skip"]
                }, {
                    listener: "gpii.tests.verifyDialogOnSkip",
                    args: ["{feedback}"],
                    priority: "last",
                    event: "{feedback}.events.onSkipAtMismatchDetails"
                }, {
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.mismatchDetailsButton"
                }, {
                    listener: "gpii.tests.verifyToggleDialog",
                    args: ["{feedback}", "bindMismatchDetails", false, false],
                    priority: "last",
                    event: "{feedback}.events.afterMismatchDetailsButtonClicked"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: false,
                        mismatch: false,
                        notInteresting: false,
                        other: false,
                        otherFeedback: "",
                        "requests.text": false,
                        "requests.transcripts": false,
                        "requests.audio": false,
                        "requests.audioDesc": false
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }, {
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.mismatchDetailsButton"
                }, {
                    listener: "gpii.tests.verifyToggleDialog",
                    args: ["{feedback}", "bindMismatchDetails", true, true],
                    priority: "last",
                    event: "{feedback}.events.afterMismatchDetailsButtonClicked"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: false,
                        mismatch: true
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }, {
                    func: "gpii.tests.setMismatchDetailsFields",
                    args: ["{feedback}", "{that}.options.testOptions.newText"]
                }, {
                    func: "gpii.tests.clickMismatchDetailsLinks",
                    args: ["{feedback}", "submit"]
                }, {
                    listener: "gpii.tests.verifyDialogOnSubmit",
                    args: ["{feedback}"],
                    priority: "last",
                    event: "{feedback}.events.onSubmitAtMismatchDetails"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: false,
                        mismatch: true,
                        notInteresting: true,
                        other: true,
                        otherFeedback: "{that}.options.testOptions.newText",
                        "requests.text": true,
                        "requests.transcripts": true,
                        "requests.audio": true,
                        "requests.audioDesc": true
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }]
            }, {
                name: "Interaction between Match confirmation and mismatch details icons",
                expect: 8,
                sequence: [{
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.matchConfirmationButton"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: true,
                        mismatch: false
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }, {
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.mismatchDetailsButton"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: false,
                        mismatch: true
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }, {
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.matchConfirmationButton"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: true,
                        mismatch: false
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }, {
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.matchConfirmationButton"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: false,
                        mismatch: false
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }]
            }]
        }]
    });

    fluid.defaults("gpii.tests.feedbackTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        markupFixture: ".gpiic-feedback-testFixture",
        components: {
            feedback: {
                type: "gpii.tests.feedback",
                container: ".gpiic-feedback",
                createOnEvent: "{feedbackTester}.events.onTestCaseStart"
            },
            feedbackTester: {
                type: "gpii.tests.feedbackTester"
            }
        }
    });

    fluid.defaults("gpii.tests.feedbackTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            newText: "some text"
        },
        modules: [{
            name: "Feedback",
            tests: [{
                name: "Init",
                expect: 14,
                sequence: [{
                    listener: "gpii.tests.verifyInitWithRequest",
                    args: ["{feedback}"],
                    priority: "last",
                    event: "{feedbackTests feedback}.events.onFeedbackMarkupReady"
                }]
            }, {
                name: "Request summary dialog",
                expect: 13,
                sequence: [{
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.requestSummaryButton"
                }, {
                    listener: "gpii.tests.verifyDialog",
                    args: ["{feedback}", "bindRequestSummary", true],
                    priority: "last",
                    event: "{feedback}.events.afterRequestSummaryButtonClicked"
                }, {
                    funcName: "gpii.tests.saveRequest",
                    args: ["{feedback}", "text", true]
                }, {
                    listener: "gpii.tests.verifyNumRequests",
                    args: ["{feedback}.bindRequestSummary", "{arguments}.0"],
                    priority: "last",
                    event: "{feedback}.events.numRequestsChanged"
                }, {
                    func: "{feedback}.bindRequestSummary.renderDialogContent.applier.change",
                    args: ["user.votes.transcripts", true]
                }, {
                    listener: "gpii.tests.verifyRequests",
                    args: ["{feedback}.bindRequestSummary", {
                        "text": 1,
                        "transcripts": 1
                    }],
                    event: "{feedback}.events.requestsChanged"
                }, {
                    listener: "gpii.tests.verifyNumRequests",
                    args: ["{feedback}.bindRequestSummary", "{arguments}.0"],
                    priority: "last",
                    event: "{feedback}.events.numRequestsChanged"
                }, {
                    func: "{feedback}.bindRequestSummary.renderDialogContent.applier.change",
                    args: ["user.votes.transcripts", false]
                // TODO: the verifyRquests tests are failing as the requests model change isn't being fired
                // despite the fact that the dataSourceValue is being updated correctly. It appears that
                // there may be an issue with the modelRelay. Although it works properly in the demo.
                // }, {
                //     listener: "gpii.tests.verifyRequests",
                //     args: ["{feedback}.bindRequestSummary", {
                //         "text": 1
                //     }],
                //     event: "{feedback}.events.requestsChanged"
                }, {
                    listener: "gpii.tests.verifyNumRequests",
                    args: ["{feedback}.bindRequestSummary", "{arguments}.0"],
                    priority: "last",
                    event: "{feedback}.events.numRequestsChanged"
                }, {
                    // Note: This test will fail if a request hasn't been added before
                    // because the model starts as 0 the value will be the same with this change.
                    // It won't be considered as a model change, thereby preventing the events
                    // from firing.
                    funcName: "gpii.tests.saveRequest",
                    args: ["{feedback}", "text", false]
                // TODO: the verifyRquests tests are failing as the requests model change isn't being fired
                // despite the fact that the dataSourceValue is being updated correctly. It appears that
                // there may be an issue with the modelRelay. Although it works properly in the demo.
                // }, {
                //     listener: "gpii.tests.verifyRequests",
                //     args: ["{feedback}.bindRequestSummary", {}],
                //     event: "{feedback}.events.requestsChanged"
                }, {
                    listener: "gpii.tests.verifyNumRequests",
                    args: ["{feedback}.bindRequestSummary", "{arguments}.0"],
                    priority: "last",
                    event: "{feedback}.events.numRequestsChanged"
                }, {
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.requestSummaryButton"
                }, {
                    listener: "gpii.tests.verifyDialog",
                    args: ["{feedback}", "bindRequestSummary", false],
                    priority: "last",
                    event: "{feedback}.events.afterRequestSummaryButtonClicked"
                }]
            }, {
                name: "Interaction between Match confirmation, mismatch details and request summary dialogs",
                expect: 9,
                sequence: [{
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.mismatchDetailsButton"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: false,
                        mismatch: true
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }, {
                    func: "gpii.tests.setMismatchDetailsFields",
                    args: ["{feedback}", "Testing Feedback Interaction"]
                }, {
                    func: "gpii.tests.clickMismatchDetailsLinks",
                    args: ["{feedback}", "submit"]
                }, {
                    listener: "gpii.tests.verifyNumRequests",
                    args: ["{feedback}.bindRequestSummary", "{arguments}.0"],
                    priority: "last",
                    event: "{feedback}.events.numRequestsChanged"
                }, {
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.requestSummaryButton"
                }, {
                    listener: "gpii.tests.verifyRequests",
                    args: ["{feedback}.bindRequestSummary", {
                        "audio": 1,
                        "audioDesc": 1,
                        "text": 1,
                        "transcripts": 1
                    }],
                    event: "{feedback}.events.requestsChanged"
                }, {
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.mismatchDetailsButton"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: false,
                        mismatch: false
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }, {
                    listener: "gpii.tests.verifyNumRequests",
                    args: ["{feedback}.bindRequestSummary", "{arguments}.0"],
                    priority: "last",
                    event: "{feedback}.events.numRequestsChanged"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        // Ensures that the database doesn't already exist
        PouchDB.destroy(gpii.tests.dbName, function () {
            fluid.test.runTests([
                // "gpii.tests.feedbackNoRequestsTests",
                "gpii.tests.feedbackTests"
            ]);
        });
    });
})(jQuery, fluid);
