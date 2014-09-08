/*!
Copyright 2014 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

(function ($) {
    "use strict";

    fluid.registerNamespace("gpii.tests.button");

    fluid.defaults("gpii.tests.button", {
        gradeNames: ["gpii.metadata.feedback.button", "autoInit"],
        strings: {
            buttonLabel: "test button"
        }
    });

    fluid.defaults("gpii.tests.buttonTree", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        markupFixture: ".gpiic-button-testFixture",
        components: {
            button: {
                type: "gpii.tests.button",
                container: ".gpiic-button"
            },
            buttonTester: {
                type: "gpii.tests.buttonTester"
            }
        }
    });

    fluid.defaults("gpii.tests.buttonTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Button Initialization",
            tests: [{
                expect: 2,
                name: "onCreate aria values",
                type: "test",
                func: "gpii.tests.utils.assertAria",
                args: ["{button}.container", {"role": "button", "aria-label": "{button}.options.strings.buttonLabel"}]
            }]
        }, {
            name: "Button Click",
            tests: [{
                name: "Mouse Interaction",
                expect: 1,
                sequence: [{
                    jQueryTrigger: "click",
                    element: "{button}.container"
                }, {
                    listener: "jqUnit.assert",
                    args: ["The afterButtonClicked event should have fired"],
                    event: "{button}.events.afterButtonClicked"
                }]
            }, {
                name: "Keyboard Interaction",
                expect: 2,
                sequence: [{
                    func: "gpii.tests.utils.simulateKeyEvent",
                    args: ["{button}.container", "keydown", $.ui.keyCode.ENTER]
                }, {
                    listener: "jqUnit.assert",
                    args: ["The afterButtonClicked event should have fired"],
                    event: "{button}.events.afterButtonClicked"
                }, {
                    func: "gpii.tests.utils.simulateKeyEvent",
                    args: ["{button}.container", "keydown", $.ui.keyCode.SPACE]
                }, {
                    listener: "jqUnit.assert",
                    args: ["The afterButtonClicked event should have fired"],
                    event: "{button}.events.afterButtonClicked"
                }]
            }]
        }]
    });

    fluid.defaults("gpii.tests.toggleButton", {
        gradeNames: ["gpii.metadata.feedback.toggleButton", "autoInit"],
        strings: {
            buttonLabel: "test button"
        }
    });

    fluid.defaults("gpii.tests.toggleButtonTree", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        markupFixture: ".gpiic-toggleButton-testFixture",
        components: {
            toggleButton: {
                type: "gpii.tests.toggleButton",
                container: ".gpiic-toggleButton"
            },
            toggleButtonTester: {
                type: "gpii.tests.toggleButtonTester"
            }
        }
    });

    fluid.defaults("gpii.tests.toggleButtonTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Toggle Button Initialization",
            tests: [{
                expect: 2,
                name: "onCreate aria values",
                type: "test",
                func: "gpii.tests.utils.assertAria",
                args: ["{toggleButton}.container", {"role": "button", "aria-label": "{toggleButton}.options.strings.buttonLabel"}]
            }, {
                expect: 1,
                name: "onCreate isActive model value",
                type: "test",
                func: "jqUnit.assertFalse",
                args: ["{that}.model.isActive"]
            }]
        }, {
            name: "Toggle Button Click",
            tests: [{
                name: "Mouse Interaction",
                expect: 4,
                sequence: [{
                    jQueryTrigger: "click",
                    element: "{toggleButton}.container"
                }, {
                    listenerMaker: "gpii.tests.utils.makeModelAssertion",
                    makerArgs: ["{toggleButton}", true],
                    spec: {path: "isActive"},
                    changeEvent: "{toggleButton}.applier.modelChanged"
                }, {
                    jQueryTrigger: "click",
                    element: "{toggleButton}.container"
                }, {
                    listenerMaker: "gpii.tests.utils.makeModelAssertion",
                    makerArgs: ["{toggleButton}", false],
                    spec: {path: "isActive"},
                    changeEvent: "{toggleButton}.applier.modelChanged"
                }]
            }, {
                name: "Keyboard Interaction",
                expect: 8,
                sequence: [{
                    func: "gpii.tests.utils.simulateKeyEvent",
                    args: ["{toggleButton}.container", "keydown", $.ui.keyCode.ENTER]
                }, {
                    listenerMaker: "gpii.tests.utils.makeModelAssertion",
                    makerArgs: ["{toggleButton}", true],
                    spec: {path: "isActive"},
                    changeEvent: "{toggleButton}.applier.modelChanged"
                }, {
                    func: "gpii.tests.utils.simulateKeyEvent",
                    args: ["{toggleButton}.container", "keydown", $.ui.keyCode.ENTER]
                }, {
                    listenerMaker: "gpii.tests.utils.makeModelAssertion",
                    makerArgs: ["{toggleButton}", false],
                    spec: {path: "isActive"},
                    changeEvent: "{toggleButton}.applier.modelChanged"
                }, {
                    func: "gpii.tests.utils.simulateKeyEvent",
                    args: ["{toggleButton}.container", "keydown", $.ui.keyCode.SPACE]
                }, {
                    listenerMaker: "gpii.tests.utils.makeModelAssertion",
                    makerArgs: ["{toggleButton}", true],
                    spec: {path: "isActive"},
                    changeEvent: "{toggleButton}.applier.modelChanged"
                }, {
                    func: "gpii.tests.utils.simulateKeyEvent",
                    args: ["{toggleButton}.container", "keydown", $.ui.keyCode.SPACE]
                }, {
                    listenerMaker: "gpii.tests.utils.makeModelAssertion",
                    makerArgs: ["{toggleButton}", false],
                    spec: {path: "isActive"},
                    changeEvent: "{toggleButton}.applier.modelChanged"
                }]
            }]
        }]
    });


    $(document).ready(function () {
        fluid.test.runTests([
            "gpii.tests.buttonTree",
            "gpii.tests.toggleButtonTree"
        ]);
    });
})(jQuery);
