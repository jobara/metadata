/*!
Copyright 2014 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

(function ($) {
    "use strict";

    fluid.registerNamespace("gpii.tests.utils");

    gpii.tests.utils.simulateKeyEvent = function (elm, eventType, keyCode) {
        $(elm).simulate(eventType, {keyCode: keyCode});
    };

    gpii.tests.utils.assertAria = function (elm, ariaAttrs) {
        fluid.each(ariaAttrs, function (value, attr) {
            jqUnit.assertEquals("The arai " + attr + " attribute should be set correctly.", value, $(elm).attr(attr));
        });
    };

    gpii.tests.utils.makeModelAssertion = function (that, expectedValue) {
        return function (newVal, oldVal, path) {
            jqUnit.assertEquals("The correct new value should be passed to the event", expectedValue, newVal);
            jqUnit.assertEquals("The model should be updated correctly", expectedValue, fluid.get(that.model, path));
        };
    };

})(jQuery);
