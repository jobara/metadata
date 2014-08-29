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
        events: {
            // onSkip: null,
            // onSubmit: null,
            // onReset: null
        },
        listeners: {
            // "onCreate.refreshView": "{that}.refreshView",
            // "onCreate.setButtonText": {
            //     "this": "{that}.dom.submit",
            //     method: "text",
            //     args: "{that}.options.strings.submit"
            // },
            // "onCreate.bindSkipHandler": {
            //     "this": "{that}.dom.skip",
            //     method: "on",
            //     args: ["click", "{that}.events.onSkip.fire"]
            // },
            // "onCreate.bindSubmitHandler": {
            //     "this": "{that}.dom.submit",
            //     method: "on",
            //     args: ["click", "{that}.events.onSubmit.fire"]
            // },
            // "onCreate.bindTextareaKeyup": {
            //     "this": "{that}.dom.otherFeedback",
            //     method: "on",
            //     args: ["keyup", "{that}.bindTextareaKeyup"]
            // },
            // "onCreate.bindCheckboxOther": {
            //     "this": "{that}.dom.other",
            //     method: "on",
            //     args: ["click", "{that}.bindCheckboxOther"]
            // },
            // "onSkip.preventDefault": {
            //     listener: "gpii.metadata.feedback.mismatchDetails.preventDefault",
            //     args: "{arguments}.0"
            // },
            // "onReset.resetModel": {
            //     listener: "{that}.applier.change",
            //     args: ["", "{that}.defaultModel"],
            //     priority: "first"
            // }
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
                    messagekey: "vote"
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
            updateBadge: {
                funcName: "gpii.metadata.feedback.bindRequestSummary.updateBadge",
                args: ["{that}.dom.icon", "{arguments}.0", "{that}.options.styles.badge"]
            }
        }
    });

    gpii.metadata.feedback.bindRequestSummary.updateBadge = function (elm, count, style) {
        elm.attr("data-badge", count || "");
        elm.toggleClass(style, !!count);
    };

})(jQuery, fluid);
