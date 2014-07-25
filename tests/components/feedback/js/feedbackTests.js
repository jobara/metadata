/*!
Copyright 2014 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    fluid.defaults("fluid.tests.feedback", {
        gradeNames: ["gpii.metadata.feedback", "autoInit"],
        resources: {
            template: {
                url: "../../../../src/components/feedback/html/feedbackTemplate.html"
            }
        }
    });

    fluid.tests.assertMarkup = function (msg, container, expectedMarkup) {
        jqUnit.assertEquals(msg, expectedMarkup, container.html());
    };

    fluid.defaults("fluid.tests.feedback.verifyInit", {
        gradeNames: ["fluid.tests.feedback", "autoInit"],
        listeners: {
            "onCreate.verifyContainerClass": {
                funcName: "jqUnit.assertTrue",
                args: ["The container should have the styling class added", "{that}.options.styles.container"],
                priority: "last"
            },
            "afterTemplateFetched.verifyResourceTextReturned": {
                funcName: "jqUnit.assertTrue",
                args: ["The resourceText property should be set", "{that}.options.resources.template.resourceText"]
            },
            "afterTemplateFetched.verifyResourceTextSet": {
                funcName: "jqUnit.assertTrue",
                args: ["The resourceText should be returned by the event", "{arguments}.0.template.resourceText"]
            },
            "afterMarkupReady.verifyMarkup": {
                funcName: "fluid.tests.assertMarkup",
                args: ["The template should be rendered into the markup", "{that}.container", "{that}.options.resources.template.resourceText"]
            },
            "afterMarkupReady.verifyMatchConfirmation": {
                funcName: "jqUnit.assertNotNull",
                args: ["The subcomponent bindMatchConfirmation should be created", "{that}.bindMatchConfirmation"],
                priority: 1
            },
            "afterMarkupReady.start": {
                funcName: "jqUnit.start",
                priority: "last"
            }
        }
    });

    $(document).ready(function () {
        jqUnit.asyncTest("Initial settings", function () {
            jqUnit.expect(5);
            fluid.tests.feedback.verifyInit(".gpiic-feedback");
        });
    });
})(jQuery, fluid);
