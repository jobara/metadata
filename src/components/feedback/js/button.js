/*

Copyright 2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var gpii = gpii || {};

(function ($, fluid) {

    "use strict";

    fluid.registerNamespace("gpii.metadata.feedback");

    fluid.defaults("gpii.metadata.feedback.button", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        strings: {
            buttonLabel: null
        },
        listeners: {
            "onCreate.addAria": {
                "this": "{that}.container",
                method: "attr",
                args: [{
                    "role": "button",
                    "aria-label": "{that}.options.strings.buttonLabel"
                }]
            },
            "onCreate.bindButtonClick": {
                "this": "{that}.container",
                method: "click",
                args: "{that}.bindButton"
            },
            "onCreate.bindKeyboard": {
                listener: "fluid.activatable",
                args: ["{that}.container", "{that}.bindButton"]
            }
        },
        events: {
            afterButtonClicked: null
        },
        invokers: {
            bindButton: {
                funcName: "fluid.identity" // must be overridden
            }
        }
    });

    fluid.defaults("gpii.metadata.feedback.toggleButton", {
        gradeNames: ["gpii.metadata.feedback.button", "autoInit"],
        styles: {
            active: "gpii-icon-active"
        },
        model: {
            isActive: false    // Keep track of the active state of the button
        },
        modelListeners: {
            "isActive": "gpii.metadata.feedback.handleActiveState({change}.value, {that}.container, {that}.options.styles.active)"
        }
    });


    gpii.metadata.feedback.handleActiveState = function (isActive, buttonDom, activeCss) {
        buttonDom.toggleClass(activeCss, isActive);
        buttonDom.attr("aria-pressed", isActive);
    };

})(jQuery, fluid);
