/*

Copyright 2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

(function ($, fluid) {

    "use strict";

    fluid.registerNamespace("gpii.metadata.feedback");

    /*
     * Renders request summary
     */
    fluid.defaults("gpii.metadata.feedback.requestSummary", {
        gradeNames: ["gpii.metadata.feedback.baseDialogContent", "autoInit"],
        model: {
            user: {},
            requests: {}
        },
        selectors: {
            header: ".gpiic-requestSummary-header",
            // requests: ".gpiic-requestSummary-requests",
            request: ".gpiic-requestSummary-request",
            requestIcon: ".gpiic-requestSummary-requestIcon",
            requestName: ".gpiic-requestSummary-requestName",
            requestCount: ".gpiic-requestSummary-requestCount",
            vote: ".gpiic-requestSummary-vote"
        },
        repeatingSelectors: ["request"],
        strings: {
            header: "Requests",
            vote: "+1"
        },
        produceTree: "gpii.metadata.feedback.requestSummary.produceTree",
        rendererFnOptions: {
            noexpand: true
        },
        invokers: {
            updateRequests: {
                changePath: "requests",
                value: "{arguments}.0"
            }
        },
        modelListeners: {
            "requests": {
                func: "{that}.refreshView"
            }
        }
    });

    gpii.metadata.feedback.requestSummary.generateVoteDecorator = function (that, currentRequest) {
        if (fluid.get(that.model.user.requests, currentRequest)) {
            return {
                type: "attrs",
                attributes: {
                    "disabled": "disabled"
                }
            };
        } else {
            return {
                type: "fluid",
                func: "gpii.metadata.feedback.toggleButton",
                options: {
                    styles: {
                        active: "gpii-requestSummary-activeVote"
                    },
                    invokers: {
                        bindButton: {
                            funcName: "gpii.metadata.feedback.requestSummary.bindButton",
                            args: ["{that}"]
                        }
                    },
                    listeners: {
                        // override the lister to a no-op function
                        // Since this is working on a <button>
                        // the click binding is also triggered on space and enter keyboard events.
                        // overriding this prevents the event from being fired twice and cancelling out the vote operation
                        "onCreate.bindKeyboard": "fluid.identity"
                    },
                    model: {
                        isActive: fluid.get(that.model.user.votes, currentRequest)
                    },
                    modelListeners: {
                        "isActive": {
                            funcName: that.applier.change,
                            excludeSource: "init",
                            args: ["user.votes." + currentRequest, "{change}.value"]
                        }
                    }
                }
            };
        }
    };

    gpii.metadata.feedback.requestSummary.generateRequestsTree = function (that) {
        var tree = [];

        fluid.each(that.model.requests, function (count, name) {
            tree.push({
                ID: "request:",
                children: [{
                    ID: "requestIcon",
                    decorators: [{
                        type: "addClass",
                        classes: fluid.get(that.options.styles, name)
                    }]
                }, {
                    ID: "requestName",
                    messagekey: name
                }, {
                    ID: "requestCount",
                    value: count
                }, {
                    ID: "vote",
                    messagekey: "vote",
                    decorators: [gpii.metadata.feedback.requestSummary.generateVoteDecorator(that, name)]
                }]
            });
        });
        return tree;
    };

    gpii.metadata.feedback.requestSummary.produceTree = function (that) {
        var tree = {
            children: [{
                ID: "header",
                messagekey: "header"
            }]
        };

        tree.children = tree.children.concat(gpii.metadata.feedback.requestSummary.generateRequestsTree(that));
        return tree;
    };

    gpii.metadata.feedback.requestSummary.bindButton = function (that) {
        that.applier.change("isActive", !that.model.isActive);
        that.events.afterButtonClicked.fire();
    };

    /*
     * Attaches the request summary panel with the "bindDialog" component
     */
    fluid.defaults("gpii.metadata.feedback.bindRequestSummary", {
        gradeNames: ["gpii.metadata.feedback.bindDialog", "autoInit"],
        panelType: "gpii.metadata.feedback.requestSummary",
        styles: {
            badge: "gpii-metadata-badge"
        },
        model: {
            numRequests: 0
        },
        renderDialogContentOptions: {
            listeners: {
                "afterRender.fireContentReadyEvent": "{bindRequestSummary}.events.onDialogContentReady"
            }
        },
        modelListeners: {
            numRequests: {
                func: "{that}.updateBadge",
                args: ["{change}.value"]
            }
        },
        invokers: {
            updateNumRequests: {
                changePath: "numRequests",
                value: "{arguments}.0"
            },
            updateBadge: {
                funcName: "gpii.metadata.feedback.bindRequestSummary.updateBadge",
                args: ["{that}.dom.icon", "{arguments}.0", "{that}.options.styles.badge"]
            }
        }
    });

    gpii.metadata.feedback.bindRequestSummary.updateBadge = function (elm, count, style) {
        count = fluid.isPrimitive(count) && count ? count : 0;
        elm.attr("data-badge", count);
        elm.toggleClass(style, !!count);
    };

})(jQuery, fluid);
