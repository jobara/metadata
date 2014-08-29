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
     * templateLoader: Define the template urls for rendering each dialog content
     */

    fluid.defaults("gpii.metadata.templateLoader", {
        gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
        templates: {
            feedback: "%prefix/feedbackTemplate.html",
            matchConfirmation: "%prefix/matchConfirmationTemplate.html",
            mismatchDetails: "%prefix/mismatchDetailsTemplate.html",
            requestSummary: "%prefix/requestSummaryTemplate.html"
        }
    });

    /*
     * feedbackLoader: The component to instantiate the feedback tool.
     * This component has two sub-components: the feedback component that implements the
     * feedback tool; the templateLoader that loads in all the templates, from where on,
     * operations would be synchronous.
     */

    fluid.defaults("gpii.metadata.feedbackLoader", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        components: {
            feedback: {
                type: "gpii.metadata.feedback",
                createOnEvent: "onTemplatesLoaded",
                container: "{feedbackLoader}.container",
                options: {
                    components: {
                        bindMatchConfirmation: {
                            options: {
                                listeners: {
                                    "afterButtonClicked.escalateToTopParent": {
                                        listener: "{feedbackLoader}.events.afterMatchConfirmationButtonClicked.fire",
                                        priority: "last"
                                    }
                                }
                            }
                        },
                        bindMismatchDetails: {
                            options: {
                                listeners: {
                                    "afterButtonClicked.escalateToTopParent": {
                                        listener: "{feedbackLoader}.events.afterMismatchDetailsButtonClicked.fire",
                                        priority: "last"
                                    }
                                },
                                renderDialogContentOptions: {
                                    listeners: {
                                        "onSkip.escalateToTopParent": {
                                            listener: "{feedbackLoader}.events.onSkipAtMismatchDetails.fire",
                                            priority: "last"
                                        },
                                        "onSubmit.escalateToTopParent": {
                                            listener: "{feedbackLoader}.events.onSubmitAtMismatchDetails.fire",
                                            priority: "last"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    events: {
                        onSave: "{feedbackLoader}.events.onSave",
                        afterSave: "{feedbackLoader}.events.afterSave"
                    },
                    resources: {
                        template: "{templateLoader}.resources.feedback"
                    }
                }
            },
            templateLoader: {
                type: "gpii.metadata.templateLoader",
                options: {
                    events: {
                        onResourcesLoaded: "{feedbackLoader}.events.onTemplatesLoaded"
                    }
                }
            }
        },
        events: {
            onTemplatesLoaded: null,
            onSave: null,
            afterSave: null,
            afterMatchConfirmationButtonClicked: null,
            afterMismatchDetailsButtonClicked: null,
            onSkipAtMismatchDetails: null,
            onSubmitAtMismatchDetails: null
        },
        distributeOptions: [{
            source: "{that}.options.templatePrefix",
            target: "{that > templateLoader > resourcePath}.options.value",
            removeSource: true
        }, {
            source: "{that}.options.templates",
            target: "{that > templateLoader}.options.templates",
            removeSource: true
        }, {
            source: "{that}.options.feedback",
            target: "{that > feedback}.options"
        }]
    });

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
            _id: {
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
                    renderDialogContentOptions: {
                        resources: {
                            template: "{templateLoader}.resources.matchConfirmation"
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
                            "onSubmit.save": "{feedback}.save"
                        },
                        resources: {
                            template: "{templateLoader}.resources.mismatchDetails"
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
                    listeners: {
                        "onCreate.fetchRequests": {
                            listener: "{that}.fetchNumRequests"
                        },
                        "{feedback}.events.afterSave": {
                            listener: "{that}.fetchNumRequests"
                        }
                    },
                    transformations: {
                        numRequests: {
                            transform: {
                                type: "fluid.transforms.value",
                                outputPath: "",
                                inputPath: "0.value"
                            }
                        }
                    },
                    invokers: {
                        updateBadgeFromPouchDB: {
                            funcName: "gpii.metadata.feedback.updateRequestsFromPouchDB",
                            args: ["{arguments}.0", "{that}.options.transformations.numRequests", "{that}.updateBadge"]
                        },
                        fetchNumRequests: {
                            func: "{dataSource}.get",
                            args: [{id: "numRequests", query: {reduce: true}}, "{that}.updateBadgeFromPouchDB"]
                        }
                    },
                    renderDialogContentOptions: {
                        strings: {
                            text: "Text",
                            transcripts: "Transcripts",
                            audio: "Audio",
                            audioDesc: "Audio Descriptions"
                        },
                        resources: {
                            template: "{templateLoader}.resources.requestSummary"
                        },
                        renderOnInit: false,
                        listeners: {
                            "onCreate.updateRequests": {
                                listener: "{dataSource}.get",
                                args: [{id: "requests", query: {reduce: true, group: true}}, "{that}.updateRequestsFromPouchDB"]
                            }
                        },
                        transformations: {
                            requests: {
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
                        invokers: {
                            updateRequestsFromPouchDB: {
                                funcName: "gpii.metadata.feedback.updateRequestsFromPouchDB",
                                args: ["{arguments}.0", "{that}.options.transformations.requests", "{that}.updateRequests"]
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
            backward: "never",
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
            feedback.save();
        } else if (!partner.model.isActive) {
            feedback.applier.change("inTransit.opinion.0", "none");
        }
    };

    gpii.metadata.feedback.save = function (that, dataSource) {
        var model = {
            id: that._id,
            model: that.model.userData
        };

        that.events.onSave.fire(model);

        dataSource.set(model, function () {
            that.events.afterSave.fire(model);
        });
    };

    gpii.metadata.feedback.updateRequestsFromPouchDB = function (model, transformation, updateFn) {
        var result = fluid.model.transform(model, transformation);
        updateFn(result);
    };

})(jQuery, fluid);
