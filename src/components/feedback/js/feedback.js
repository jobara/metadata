/*
Copyright 2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global emit */

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("gpii.metadata");

    /*
     * feedback: The actual implementation of the feedback tool
     */

    gpii.metadata.feedback.invert = function (bool) {
        return !bool;
    };

    gpii.metadata.feedback.mapRequests =  function (doc) {
        var model = doc.model || doc;

        // Only look at votes and requests set to true
        fluid.remove_if(model.votes, gpii.metadata.feedback.invert);
        fluid.remove_if(model.requests, gpii.metadata.feedback.invert);

        // Merge the objects. It's okay to override duplicates as all the values should be true.
        var votes = $.extend({}, model.votes, model.requests);

        // Emit each item. The value is set to 1 to allow for easy counting.
        fluid.each(fluid.keys(votes), function (key) {
            emit(key, 1);
        });
    };

    fluid.defaults("gpii.metadata.feedback", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        members: {
            databaseName: {
                expander: {
                    funcName: "gpii.metadata.feedback.getDbName",
                    args: "{that}.options.databaseName"
                }
            },
            userID: {
                expander: {
                    funcName: "fluid.allocateGuid"
                }
            }
        },
        components: {
            bindMatchConfirmation: {
                type: "gpii.metadata.feedback.bindMatchConfirmation",
                container: "{feedback}.dom.matchConfirmationButton",
                createOnEvent: "onFeedbackMarkupReady",
                options: {
                    strings: {
                        buttonLabel: "{feedback}.options.strings.matchConfirmationLabel"
                    },
                    styles: {
                        activeCss: "{feedback}.options.styles.activeCss"
                    },
                    modelListeners: {
                        "isActive": {
                            listener: "gpii.metadata.feedback.updateFeedbackModel",
                            args: ["{change}.value", "like", "{bindMismatchDetails}", "{feedback}"],
                            excludeSource: "init"
                        }
                    },
                    listeners: {
                        "afterButtonClicked.escalateToParent": {
                            listener: "{feedback}.events.afterMatchConfirmationButtonClicked",
                            priority: "last"
                        }
                    }
                }
            },
            bindMismatchDetails: {
                type: "gpii.metadata.feedback.bindMismatchDetails",
                container: "{feedback}.dom.mismatchDetailsButton",
                createOnEvent: "onFeedbackMarkupReady",
                options: {
                    strings: {
                        buttonLabel: "{feedback}.options.strings.mismatchDetailsLabel"
                    },
                    styles: {
                        activeCss: "{feedback}.options.styles.activeCss"
                    },
                    modelListeners: {
                        "isActive": {
                            listener: "gpii.metadata.feedback.updateFeedbackModel",
                            args: ["{change}.value", "dislike", "{bindMatchConfirmation}", "{feedback}"],
                            excludeSource: "init"
                        }
                    },
                    listeners: {
                        "afterButtonClicked.escalateToParent": {
                            listener: "{feedback}.events.afterMismatchDetailsButtonClicked.fire",
                            priority: "last"
                        }
                    },
                    renderDialogContentOptions: {
                        model: {
                            notInteresting: "{feedback}.model.userData.notInteresting",
                            other: "{feedback}.model.userData.other",
                            otherFeedback: "{feedback}.model.userData.otherFeedback",
                            text: "{feedback}.model.userData.requests.text",
                            transcripts: "{feedback}.model.userData.requests.transcripts",
                            audio: "{feedback}.model.userData.requests.audio",
                            audioDesc: "{feedback}.model.userData.requests.audioDesc"
                        },
                        listeners: {
                            "onSkip.escalateToParent": {
                                listener: "{feedback}.events.onSkipAtMismatchDetails",
                                priority: "last"
                            },
                            "onSubmit.escalateToParent": {
                                listener: "{feedback}.events.onSubmitAtMismatchDetails",
                                priority: "last"
                            },
                            "onSubmit.save": "{feedback}.save"
                        }
                    }
                }
            },
            bindRequestSummary: {
                type: "gpii.metadata.feedback.bindRequestSummary",
                container: "{feedback}.dom.requestSummaryButton",
                createOnEvent: "onFeedbackMarkupReady",
                options: {
                    strings: {
                        buttonLabel: "{feedback}.options.strings.requestLabel"
                    },
                    styles: {
                        activeCss: "{feedback}.options.styles.activeCss"
                    },
                    modelRelay: [{
                        source: "{that}.model.dataSourceValue",
                        target: "numRequests",
                        transform: {
                            transform: {
                                type: "fluid.transforms.condition",
                                conditionPath: "0.value",
                                "true": {
                                    transform: {
                                        type: "fluid.transforms.value",
                                        outputPath: "",
                                        inputPath: "0.value"
                                    }
                                },
                                "false": {
                                    transform: {
                                        type: "fluid.transforms.value",
                                        outputPath: "",
                                        value: 0
                                    }
                                }
                            }
                        }
                    }],
                    listeners: {
                        "onCreate.fetchRequests": "{that}.fetchNumRequests",
                        "{feedback}.events.afterSave": "{that}.fetchNumRequests",
                        "afterButtonClicked.escalateToParent": {
                            listener: "{feedback}.events.afterRequestSummaryButtonClicked",
                            priority: "last"
                        }
                    },
                    invokers: {
                        updateNumRequests: {
                            changePath: "dataSourceValue"
                        },
                        fetchNumRequests: {
                            func: "{dataSource}.get",
                            args: [{id: "numRequests", query: {reduce: true}}, "{that}.updateNumRequests"]
                        }
                    },
                    renderDialogContentOptions: {
                        strings: {
                            text: "Text",
                            transcripts: "Transcripts",
                            audio: "Audio",
                            audioDesc: "Audio Descriptions"
                        },
                        styles: {
                            text: "gpii-icon gpii-icon-text",
                            transcripts: "gpii-icon gpii-icon-transcript",
                            audio: "gpii-icon gpii-icon-audio",
                            audioDesc: "gpii-icon gpii-icon-audioDescriptions"
                        },
                        renderOnInit: false,
                        model: {
                            user: "{feedback}.model.userData"
                        },
                        modelRelay: {
                            source: "dataSourceValue",
                            target: "requests",
                            transform: {
                                transform: {
                                    type: "fluid.transforms.arrayToObject",
                                    inputPath: "",
                                    outputPath: "",
                                    key: "key",
                                    innerValue: [{
                                        transform: {
                                            type: "fluid.transforms.value",
                                            inputPath: "value"
                                        }
                                    }]
                                }
                            }
                        },
                        modelListeners: {
                            "user.votes": [{
                                func: "{feedback}.save",
                                excludeSource: "init"
                            }, {
                                func: "{that}.fetchRequests",
                                excludeSource: "init"
                            }]
                        },
                        listeners: {
                            "onCreate.updateRequests": "{that}.fetchRequests"
                        },
                        invokers: {
                            updateRequests: {
                                changePath: "dataSourceValue"
                            },
                            fetchRequests: {
                                func: "{dataSource}.get",
                                args: [{id: "requests", query: {reduce: true, group: true}}, "{that}.updateRequests"]
                            }
                        }
                    }
                }
            },
            dataSource: {
                type: "gpii.pouchdb.dataSource",
                options: {
                    databaseName: "{feedback}.databaseName",
                    views: {
                        requests: {
                            map: gpii.metadata.feedback.mapRequests,
                            reduce: "_count"
                        },
                        numRequests: {
                            map: gpii.metadata.feedback.mapRequests,
                            reduce: "_sum"
                        }
                    }
                }
            }
        },
        databaseName: "feedback",
        strings: {
            matchConfirmationLabel: "I like this article, match me with similar content.",
            mismatchDetailsLabel: "I don't like this article, request improvements.",
            requestLabel: "Request improvements to the content."
        },
        styles: {
            container: "gpii-feedback",
            activeCss: "gpii-icon-active"
        },
        selectors: {
            matchConfirmationButton: ".gpiic-matchConfirmation-button",
            mismatchDetailsButton: ".gpiic-mismatchDetails-button",
            requestSummaryButton: ".gpiic-requestSummary-button"
        },
        model: {
            userData: {},
            inTransit: {
                opinion: ["none"]   // Possible values: like, dislike, none
            }
        },
        modelRelay: [{
            source: "{that}.model.inTransit.opinion",
            target: "{that}.model",
            forward: "liveOnly",
            singleTransform: {
                type: "fluid.transforms.arrayToSetMembership",
                options: {
                    "like": "userData.match",
                    "dislike": "userData.mismatch",
                    "none": "inTransit.none"
                }
            }
        }],
        events: {
            onFeedbackMarkupReady: null,
            afterMatchConfirmationButtonClicked: null,
            afterMismatchDetailsButtonClicked: null,
            afterRequestSummaryButtonClicked: null,
            onSkipAtMismatchDetails: null,
            onSubmitAtMismatchDetails: null,
            onSave: null,
            afterSave: null
        },
        listeners: {
            "onCreate.addContainerClass": {
                "this": "{that}.container",
                "method": "addClass",
                "args": "{that}.options.styles.container"
            },
            "onCreate.appendMarkup": {
                "this": "{that}.container",
                "method": "append",
                "args": "{that}.options.resources.template.resourceText",
                "priority": "first"
            },
            "onCreate.onFeedbackMarkupReady": {
                "func": "{that}.events.onFeedbackMarkupReady",
                "args": "{that}",
                "priority": "last"
            }
        },
        invokers: {
            save: {
                funcName: "gpii.metadata.feedback.save",
                args: ["{that}", "{dataSource}"]
            }
        }
    });

    gpii.metadata.feedback.getDbName = function (databaseName) {
        return databaseName ? databaseName : "feedback";
    };

    gpii.metadata.feedback.updateFeedbackModel = function (isActive, mappedToActiveValue, partner, feedback) {
        if (isActive) {
            feedback.applier.change("inTransit.opinion.0", mappedToActiveValue);
            if (partner.model.isActive) {
                partner.applier.change("isActive", false);
            }
        } else if (!partner.model.isActive) {
            feedback.applier.change("inTransit.opinion.0", "none");
        }
        feedback.save();
    };

    gpii.metadata.feedback.save = function (that, dataSource) {
        var dataToSave = {
            id: that.userID,
            model: that.model.userData
        };

        that.events.onSave.fire(dataToSave);

        dataSource.set(dataToSave, function () {
            that.events.afterSave.fire(dataToSave);
        });
    };

})(jQuery, fluid);
