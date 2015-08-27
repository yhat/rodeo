(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['active-variable.hbs'] = template({"1":function(depth0,helpers,partials,data) {
    return "fa-table";
},"3":function(depth0,helpers,partials,data) {
    return "fa-list-alt";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<tr>\n  <td>"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</td>\n  <td>"
    + alias3(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"type","hash":{},"data":data}) : helper)))
    + "</td>\n  <td style=\"td-align: center;\">\n    <a href=\"#\" onclick=\"showVariable('"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "', '"
    + alias3(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"type","hash":{},"data":data}) : helper)))
    + "');\"><span class='fa "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.type : depth0),"DataFrame",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.type : depth0),"list",{"name":"compare","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "' aria-hidden='true'></span></a>\n  </td>\n</tr>\n";
},"useData":true});
templates['editor-tab.hbs'] = template({"1":function(depth0,helpers,partials,data) {
    return "active";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, buffer = 
  "<li id=\"editor-tab-"
    + alias3(((helper = (helper = helpers.n || (depth0 != null ? depth0.n : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"n","hash":{},"data":data}) : helper)))
    + "\" class=\"";
  stack1 = ((helper = (helper = helpers.isFirst || (depth0 != null ? depth0.isFirst : depth0)) != null ? helper : alias1),(options={"name":"isFirst","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.isFirst) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\">\n  <a class=\"editor-tab-a\" href=\"#editor-tab-pane-"
    + alias3(((helper = (helper = helpers.n || (depth0 != null ? depth0.n : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"n","hash":{},"data":data}) : helper)))
    + "\" data-toggle=\"tab\" aria-expanded=\"false\">\n    <span class=\"name\">"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span><span class=\"unsaved hide\">*</span>&nbsp;<span style=\"color: red;\" onclick=\"closeActiveTab('"
    + alias3(((helper = (helper = helpers.n || (depth0 != null ? depth0.n : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"n","hash":{},"data":data}) : helper)))
    + "');\">&times;</span>\n  </a>\n</li>\n";
},"useData":true});
templates['editor.hbs'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"tab-pane active\" id=\"editor-tab-pane-"
    + alias3(((helper = (helper = helpers.n || (depth0 != null ? depth0.n : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"n","hash":{},"data":data}) : helper)))
    + "\" style=\"height: 100%;\">\n  <div class=\"editor\" id=\"editor-"
    + alias3(((helper = (helper = helpers.n || (depth0 != null ? depth0.n : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"n","hash":{},"data":data}) : helper)))
    + "\"></div>\n</div\n";
},"useData":true});
templates['file-item.hbs'] = template({"1":function(depth0,helpers,partials,data) {
    return "fa-folder";
},"3":function(depth0,helpers,partials,data) {
    return "fa-file-o";
},"5":function(depth0,helpers,partials,data) {
    return "color: grey;";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, alias4=helpers.blockHelperMissing, buffer = 
  "<a oncontextmenu=\"folderMenu.filename = '"
    + alias3(((helper = (helper = helpers.filename || (depth0 != null ? depth0.filename : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"filename","hash":{},"data":data}) : helper)))
    + "'; folderMenu.popup(remote.getCurrentWindow());\" onclick=\"openFile('"
    + alias3(((helper = (helper = helpers.filename || (depth0 != null ? depth0.filename : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"filename","hash":{},"data":data}) : helper)))
    + "');\" data-parnet-slug=\"\" data-dirname=\"top_dir\" href=\"#\" class=\"list-group-item showdir\" style=\"padding: 5px 10px;\">\n  <i class=\"fa fa ";
  stack1 = ((helper = (helper = helpers.isDir || (depth0 != null ? depth0.isDir : depth0)) != null ? helper : alias1),(options={"name":"isDir","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.isDir) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\" style=\"";
  stack1 = ((helper = (helper = helpers.isDir || (depth0 != null ? depth0.isDir : depth0)) != null ? helper : alias1),(options={"name":"isDir","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.isDir) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\"></i>\n  &nbsp;&nbsp;"
    + alias3(((helper = (helper = helpers.basename || (depth0 != null ? depth0.basename : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"basename","hash":{},"data":data}) : helper)))
    + "\n</a>\n";
},"useData":true});
templates['history-row.hbs'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<p><span style=\"white-space: pre-wrap;\">"
    + this.escapeExpression(((helper = (helper = helpers.command || (depth0 != null ? depth0.command : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"command","hash":{},"data":data}) : helper)))
    + "</span></p>\n";
},"useData":true});
templates['package-row.hbs'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<tr>\n  <td>"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</td>\n  <td>"
    + alias3(((helper = (helper = helpers.version || (depth0 != null ? depth0.version : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"version","hash":{},"data":data}) : helper)))
    + "</td>\n</tr>\n";
},"useData":true});
templates['preferences.hbs'] = template({"1":function(depth0,helpers,partials,data) {
    return "selected";
},"3":function(depth0,helpers,partials,data) {
    return "checked";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, buffer = 
  "<div class=\"tab-pane active\" id=\"editor-tab-pane-preferences\" style=\"height: 100%;\">\n  <div class=\"panel-body\">\n    <ul class=\"nav nav-tabs\">\n      <li class=\"active\"><a href=\"#editor\" data-toggle=\"tab\">Editor</a></li>\n      <li><a href=\"#theme\" data-toggle=\"tab\">Theme</a></li>\n    </ul>\n    <div id=\"myTabContent\" class=\"tab-content\">\n      <div class=\"tab-pane active in\" id=\"editor\">\n        <br>\n        <div class=\"form-group\">\n          <label for=\"editorTheme\">Color Scheme</label>\n          <select onchange=\"setEditorTheme($(this).val());\" class=\"form-control\" name=\"editorTheme\" id=\"editorTheme\">\n            <option value=\"ace/theme/ambiance\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/ambiance",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">ambiance</option>\n            <option value=\"ace/theme/chaos\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/chaos",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">chaos</option>\n            <option value=\"ace/theme/chrome\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/chrome",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">chrome (default)</option>\n            <option value=\"ace/theme/clouds\" "
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
    + alias3(((helper = (helper = helpers.fontSize || (depth0 != null ? depth0.fontSize : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"fontSize","hash":{},"data":data}) : helper)))
    + "\" min=\"8\" max=\"20\" />\n        </div>\n        <div class=\"form-group\">\n          <label for=\"defaultWorkingDirectory\">Default Working Directory</label>\n          <input onclick=\"var me = $(this); pickDirectory('Select a Default Working Directory', USER_WD, function(dir) { if (dir) { $(me).val(dir); setDefaultWd($(me).val()); }});\" class=\"form-control\" id=\"defaultWorkingDirectory\" name=\"defaultWorkingDirectory\" value=\""
    + alias3(((helper = (helper = helpers.defaultWd || (depth0 != null ? depth0.defaultWd : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"defaultWd","hash":{},"data":data}) : helper)))
    + "\" />\n        </div>\n        <div class=\"checkbox\">\n          <label>\n            <input onchange=\"setAutoSave($(this).prop('checked'));\" type=\"checkbox\" ";
  stack1 = ((helper = (helper = helpers.autoSave || (depth0 != null ? depth0.autoSave : depth0)) != null ? helper : alias1),(options={"name":"autoSave","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.autoSave) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "> AutoSave Files\n          </label>\n        </div>\n      </div>\n      <div class=\"tab-pane\" id=\"theme\">\n        <br>\n        <div class=\"form-group\">\n          <label for=\"theme\">Theme</label>\n          <select onchange=\"setTheme($(this).val());\" class=\"form-control\" name=\"theme\" id=\"theme\">\n            <option value=\"css/styles.css\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.theme : depth0),"css/styles.css",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">light</option>\n            <option value=\"css/styles-presentation.css\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.theme : depth0),"css/styles-presentation.css",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">presentation</option>\n            <option value=\"css/styles-dark.css\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.theme : depth0),"css/styles-dark.css",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">dark</option>\n            <option value=\"css/styles-cobalt.css\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.theme : depth0),"css/styles-cobalt.css",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">cobalt</option>\n          </select>\n        </div>\n      </div>\n      <div class=\"tab-pane\" id=\"layout\">\n        <div class=\"row\" style=\"height: 100px;\">\n          <div class=\"col-sm-2\" style=\"height: 100px; background-color: skyblue;\">\n          </div>\n          <div class=\"col-sm-2\" style=\"height: 100px; background-color: grey;\">\n          </div>\n        </div>\n        <div class=\"row\" style=\"height: 100px;\">\n          <div class=\"col-sm-2\" style=\"height: 100px; background-color: grey;\">\n          </div>\n          <div class=\"col-sm-2\" style=\"height: 100px; background-color: skyblue;\">\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n";
},"useData":true});
templates['wd.hbs'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<a class=\"list-group-item\" style=\"padding: 5px 10px;\">\n  <i onclick=\"fileMenu.popup(remote.getCurrentWindow());\" class=\"fa fa-cogs\" style=\"color: grey;\"></i>&nbsp;\n  &nbsp;&nbsp;"
    + this.escapeExpression(((helper = (helper = helpers.dir || (depth0 != null ? depth0.dir : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"dir","hash":{},"data":data}) : helper)))
    + "\n</a>\n";
},"useData":true});
})();
