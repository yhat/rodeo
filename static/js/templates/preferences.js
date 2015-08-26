(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['preferences.hbs'] = template({"1":function(depth0,helpers,partials,data) {
    return "selected";
},"3":function(depth0,helpers,partials,data) {
    return "checked";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", buffer = 
  "<div class=\"tab-pane active\" id=\"editor-tab-pane-preferences\" style=\"height: 100%;\">\n  <div class=\"panel-body\">\n    <ul class=\"nav nav-tabs\">\n      <li class=\"active\"><a href=\"#editor\" data-toggle=\"tab\">Editor</a></li>\n      <li><a href=\"#theme\" data-toggle=\"tab\">Theme</a></li>\n    </ul>\n    <div id=\"myTabContent\" class=\"tab-content\">\n      <div class=\"tab-pane active in\" id=\"editor\">\n        <br>\n        <div class=\"form-group\">\n          <label for=\"editorTheme\">Color Scheme</label>\n          <select onchange=\"setEditorTheme($(this).val());\" class=\"form-control\" name=\"editorTheme\" id=\"editorTheme\">\n            <option value=\"ace/theme/ambiance\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/ambiance",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">ambiance</option>\n            <option value=\"ace/theme/chaos\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/chaos",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">chaos</option>\n            <option value=\"ace/theme/chrome\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/chrome",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">chrome</option>\n            <option value=\"ace/theme/clouds\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/clouds",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">clouds</option>\n            <option value=\"ace/theme/clouds_midnight\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/clouds_midnight",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">clouds midnight</option>\n            <option value=\"ace/theme/cobalt\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/cobalt",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">cobalt</option>\n            <option value=\"ace/theme/crimson_editor\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/crimson_editor",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">crimson editor</option>\n            <option value=\"ace/theme/dawn\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/dawn",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">dawn</option>\n            <option value=\"ace/theme/dreamweaver\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/dreamweaver",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">dreamweaver</option>\n            <option value=\"ace/theme/eclipse\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/eclipse",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">eclipse</option>\n            <option value=\"ace/theme/github\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/github",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">github</option>\n            <option value=\"ace/theme/idle_fingers\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/idle_fingers",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">idle fingers</option>\n            <option value=\"ace/theme/katzenmilch\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/katzenmilch",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">katzenmilch</option>\n            <option value=\"ace/theme/kr_theme\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/kr_theme",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">kr theme</option>\n            <option value=\"ace/theme/kuroir\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/kuroir",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">kuroir</option>\n            <option value=\"ace/theme/merbivore\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/merbivore",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">merbivore</option>\n            <option value=\"ace/theme/merbivore_soft\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/merbivore_soft",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">merbivore soft</option>\n            <option value=\"ace/theme/mono_industrial\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/mono_industrial",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">mono industrial</option>\n            <option value=\"ace/theme/monokai\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/monokai",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">monokai</option>\n            <option value=\"ace/theme/pastel_on_dark\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/pastel_on_dark",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">pastel on dark</option>\n            <option value=\"ace/theme/solarized_dark\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/solarized_dark",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">solarized dark</option>\n            <option value=\"ace/theme/solarized_light\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/solarized_light",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">solarized light</option>\n            <option value=\"ace/theme/terminal\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/terminal",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">terminal</option>\n            <option value=\"ace/theme/textmate\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/textmate",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">textmate</option>\n            <option value=\"ace/theme/tomorrow\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/tomorrow",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">tomorrow</option>\n            <option value=\"ace/theme/tomorrow_night\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/tomorrow_night",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">tomorrow night</option>\n            <option value=\"ace/theme/tomorrow_night_blue\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/tomorrow_night_blue",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">tomorrow night blue</option>\n            <option value=\"ace/theme/tomorrow_night_bright\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/tomorrow_night_bright",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">tomorrow night bright</option>\n            <option value=\"ace/theme/tomorrow_night_eighties\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/tomorrow_night_eighties",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">tomorrow night eighties</option>\n            <option value=\"ace/theme/twilight\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/twilight",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">twilight</option>\n            <option value=\"ace/theme/vibrant_ink\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/vibrant_ink",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">vibrant ink</option>\n            <option value=\"ace/theme/xcode\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/xcode",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">xcode</option>\n          </select>\n        </div>\n        <div class=\"form-group\">\n          <label for=\"keyBindings\">Key Bindings:</label>\n          <select onchange=\"setKeyBindings($(this).val());\" class=\"form-control\" name=\"keyBindings\" id=\"keyBindings\">\n            <option value=\"default\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.keyBindings : depth0),"default",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">default</option>\n            <option value=\"ace/keybindings/vim\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.keyBindings : depth0),"ace/keybindings/vim",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">vim</option>\n            <option value=\"ace/keybindings/emacs\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.keyBindings : depth0),"ace/keybindings/emacs",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">emacs</option>\n          </select>\n        </div>\n        <div class=\"form-group\">\n          <label for=\"fontSize\">Font Size</label>\n          <input onchange=\"setFontSize($(this).val());\" class=\"form-control\" id=\"fontSize\" name=\"fontSize\" type=\"number\" step=\"1\" value=\""
    + this.escapeExpression(((helper = (helper = helpers.fontSize || (depth0 != null ? depth0.fontSize : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"fontSize","hash":{},"data":data}) : helper)))
    + "\" min=\"8\" max=\"20\" />\n        </div>\n        <div class=\"checkbox\">\n          <label>\n            <input onchange=\"setAutoSave($(this).prop('checked'));\" type=\"checkbox\" ";
  stack1 = ((helper = (helper = helpers.autoSave || (depth0 != null ? depth0.autoSave : depth0)) != null ? helper : alias1),(options={"name":"autoSave","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.autoSave) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "> AutoSave Files\n          </label>\n        </div>\n      </div>\n      <div class=\"tab-pane\" id=\"theme\">\n        <br>\n        <div class=\"form-group\">\n          <label for=\"theme\">Theme</label>\n          <select onchange=\"setTheme($(this).val());\" class=\"form-control\" name=\"theme\" id=\"theme\">\n            <option value=\"light\" selected>light</option>\n            <option value=\"presentation\">presentation</option>\n            <option value=\"dark\">dark</option>\n          </select>\n        </div>\n      </div>\n      <div class=\"tab-pane\" id=\"layout\">\n        <div class=\"row\" style=\"height: 100px;\">\n          <div class=\"col-sm-2\" style=\"height: 100px; background-color: skyblue;\">\n          </div>\n          <div class=\"col-sm-2\" style=\"height: 100px; background-color: grey;\">\n          </div>\n        </div>\n        <div class=\"row\" style=\"height: 100px;\">\n          <div class=\"col-sm-2\" style=\"height: 100px; background-color: grey;\">\n          </div>\n          <div class=\"col-sm-2\" style=\"height: 100px; background-color: skyblue;\">\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n";
},"useData":true});
})();
