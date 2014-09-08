/*!
Copyright 2014 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

(function ($) {
    "use strict";

    fluid.registerNamespace("gpii.tests.requestSummary");

    gpii.tests.requestSummary.assertInit = function (that) {
        jqUnit.assertEquals("The header is rendered", that.options.strings.header, that.locate("header").text());
        var count = 0;
        // var requests = that.locate("request");
        var requestIcons = that.locate("requestIcon");
        var requestNames = that.locate("requestName");
        var requestCounts = that.locate("requestCount");
        var votes = that.locate("vote");

        fluid.each(that.model.requests, function (typeCount, type) {
            var iconClass = that.options.styles[type];
            var name = that.options.strings[type];
            var voteText = that.options.strings.vote;
            var vote = votes.eq(count);

            jqUnit.assertTrue("The requestIcon style '" + iconClass + "' should be added", requestIcons.eq(count).hasClass(iconClass));
            jqUnit.assertEquals("The request name '" + name + "' should be set", name, requestNames.eq(count).text());
            jqUnit.assertEquals("The request count: " + typeCount + ", should be set", typeCount, requestCounts.eq(count).text());
            jqUnit.assertEquals("The vote text '" + voteText + "' should be rendered", voteText, vote.text());

            if (that.model.user.requests[type]) {
                jqUnit.assertTrue("The vote button should be disabled", vote.prop("disabled"));
            } else {
                jqUnit.assertFalse("The vote button should not be disabled", vote.prop("disabled"));
            }

            count++;
        });
    };

    fluid.defaults("gpii.tests.requestSummary", {
        gradeNames: ["gpii.metadata.feedback.requestSummary", "autoInit"],
        model: {
            user: {
                requests: {
                    audio: true
                }
            },
            requests: {
                audio: 10,
                text: 5
            }
        },
        strings: {
            audio: "Audio",
            text: "Text"
        },
        styles: {
            audio: "gpii-tests-audio",
            text: "gpii-tests-text"
        },
        listeners: {
            "afterRender.setVoteElm": {
                listener: function (that, votePos) {
                    that.testVoteElm = that.locate("vote").eq(votePos);
                },
                args: ["{that}", 1],
                priority: "first"
            }
        }
    });

    fluid.defaults("gpii.tests.requestSummaryTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        markupFixture: ".gpiic-requestSummary-testFixture",
        components: {
            requestSummary: {
                type: "gpii.tests.requestSummary",
                container: ".gpiic-requestSummary"
            },
            requestSummaryTester: {
                type: "gpii.tests.requestSummaryTester"
            }
        }
    });

    fluid.defaults("gpii.tests.requestSummaryTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Request Summary Initialization",
            tests: [{
                expect: 11,
                name: "Rendering",
                sequence: [{
                    func: "{requestSummary}.refreshView"
                }, {
                    listener: "gpii.tests.requestSummary.assertInit",
                    priority: "last",
                    event: "{requestSummary}.events.afterRender"
                }]
            }]
        }, {
            name: "Vote",
            tests: [{
                expect: 12,
                name: "Interaction",
                sequence: [{
                    jQueryTrigger: "click",
                    element: "{requestSummary}.testVoteElm"
                }, {
                    listenerMaker: "gpii.tests.utils.makeModelAssertion",
                    makerArgs: ["{requestSummary}", 1],
                    spec: {path: "user.votes.text", priority: "last"},
                    changeEvent: "{requestSummary}.applier.modelChanged"
                }, {
                    jQueryTrigger: "click",
                    element: "{requestSummary}.testVoteElm"
                }, {
                    listenerMaker: "gpii.tests.utils.makeModelAssertion",
                    makerArgs: ["{requestSummary}", 0],
                    spec: {path: "user.votes.text", priority: "last"},
                    changeEvent: "{requestSummary}.applier.modelChanged"
                }, {
                    func: "gpii.tests.utils.simulateKeyEvent",
                    args: ["{requestSummary}.testVoteElm", "keypress", $.ui.keyCode.ENTER]
                }, {
                    listenerMaker: "gpii.tests.utils.makeModelAssertion",
                    makerArgs: ["{requestSummary}", 1],
                    spec: {path: "user.votes.text", priority: "last"},
                    changeEvent: "{requestSummary}.applier.modelChanged"
                }, {
                    func: "gpii.tests.utils.simulateKeyEvent",
                    args: ["{requestSummary}.testVoteElm", "keypress", $.ui.keyCode.ENTER]
                }, {
                    listenerMaker: "gpii.tests.utils.makeModelAssertion",
                    makerArgs: ["{requestSummary}", 0],
                    spec: {path: "user.votes.text", priority: "last"},
                    changeEvent: "{requestSummary}.applier.modelChanged"
                }, {
                    func: "gpii.tests.utils.simulateKeyEvent",
                    args: ["{requestSummary}.testVoteElm", "keyup", $.ui.keyCode.SPACE]
                }, {
                    listenerMaker: "gpii.tests.utils.makeModelAssertion",
                    makerArgs: ["{requestSummary}", 1],
                    spec: {path: "user.votes.text", priority: "last"},
                    changeEvent: "{requestSummary}.applier.modelChanged"
                }, {
                    func: "gpii.tests.utils.simulateKeyEvent",
                    args: ["{requestSummary}.testVoteElm", "keyup", $.ui.keyCode.SPACE]
                }, {
                    listenerMaker: "gpii.tests.utils.makeModelAssertion",
                    makerArgs: ["{requestSummary}", 0],
                    spec: {path: "user.votes.text", priority: "last"},
                    changeEvent: "{requestSummary}.applier.modelChanged"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "gpii.tests.requestSummaryTests"
        ]);
    });
})(jQuery);
