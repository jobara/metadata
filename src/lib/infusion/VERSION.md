The version of Infusion included in this folder was created using a custom build from Antranig's FLUID-5506 branch:

https://github.com/amb26/infusion

commit#: d475bb4006f896af1c05c493ef71ac974fb5e0ca

```
    grunt custom --source=true --include="tooltip, uiOptions, tabs, overviewPanel"
```

The following directories were stripped out of the build since they contain code that is included in the infusion-custom.js file or is not required:

* src/lib/infusion/src/components/overviewPanel/js/
* src/lib/infusion/src/components/overviewPanel/overviewPanelDependencies.json
* src/lib/infusion/src/components/slidingPanel/
* src/lib/infusion/src/components/tableOfContents/js/
* src/lib/infusion/src/components/tableOfContents/tableOfContentsDependencies.json
* src/lib/infusion/src/components/tabs/
* src/lib/infusion/src/components/textfieldSlider/
* src/lib/infusion/src/components/tooltip/
* src/lib/infusion/src/components/uiOptions/
* src/lib/infusion/src/framework/core/
* src/lib/infusion/src/framework/enhancement/
* src/lib/infusion/src/framework/preferences/js/
* src/lib/infusion/src/framework/preferences/preferencesDependencies.json
* src/lib/infusion/src/framework/renderer/
* src/lib/infusion/src/lib/fastXmlPull/
* src/lib/infusion/src/lib/jquery/core/
* src/lib/infusion/src/lib/jquery/plugins/
* src/lib/infusion/src/lib/jquery/ui/jQueryUICoreDependencies.json
* src/lib/infusion/src/lib/jquery/ui/jQueryUIWidgetsDependencies.json
* src/lib/infusion/src/lib/jquery/ui/js/
* src/lib/infusion/src/lib/json/
* README.md

Additionally, the testing framework from Infusion is used (tests/lib/infusion) and should be updated to a matching version. This directory is a copy of

https://github.com/fluid-project/infusion/tree/master/tests

The following directories were stripped out since they contain code that is not required:

* all-tests.html
* component-tests/
* framework-tests/
* lib/mockjax/
* manual-tests/
* node-tests/
* test-core/testTests/
