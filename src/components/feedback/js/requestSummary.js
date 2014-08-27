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
            requests: ".gpiic-requestSummary-requests",
            request: ".gpiic-requestSummary-request",
            requestIcon: ".gpiic-requestSummary-requestIcon",
            requestName: ".gpiic-requestSummary-requestName",
            vote: ".gpiic-requestSummary-vote"
        },
        strings: {
            header: "Requests",
            vote: "+1"
        },
        protoTree: {
            header: {messagekey: "header"},
            vote: {messagekey: "vote"}
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
            // bindTextareaKeyup: {
            //     funcName: "gpii.metadata.feedback.mismatchDetails.bindTextareaKeyup",
            //     args: ["{that}.dom.other", "{arguments}.0"]
            // },
            // bindCheckboxOther: {
            //     funcName: "gpii.metadata.feedback.mismatchDetails.bindCheckboxOther",
            //     args: ["{that}.dom.otherFeedback", "{arguments}.0"]
            // }
        }
    });

    /*
     * Attaches the request summary panel with the "bindDialog" component
     */
    fluid.defaults("gpii.metadata.feedback.bindRequestSummary", {
        gradeNames: ["gpii.metadata.feedback.bindDialog", "autoInit"],
        panelType: "gpii.metadata.feedback.requestSummary",
        renderDialogContentOptions: {
            listeners: {
                "afterRender.fireContentReadyEvent": "{bindRequestSummary}.events.onDialogContentReady"
            }
        }
    });

})(jQuery, fluid);
