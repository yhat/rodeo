(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['active-variable.hbs'] = template({"1":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "      <a href=\"#\" onclick=\"showVariable('"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "', '"
    + alias3(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"type","hash":{},"data":data}) : helper)))
    + "');\"><span class='fa fa-list-alt' aria-hidden='true'></span></a>\n";
},"3":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "      <a href=\"#\" onclick=\"showVariable('"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "', '"
    + alias3(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"type","hash":{},"data":data}) : helper)))
    + "');\"><span class='fa fa-table' aria-hidden='true'></span></a>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<tr>\n  <td>"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</td>\n  <td>"
    + alias3(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"type","hash":{},"data":data}) : helper)))
    + "</td>\n  <td>"
    + alias3(((helper = (helper = helpers.repr || (depth0 != null ? depth0.repr : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"repr","hash":{},"data":data}) : helper)))
    + "</td>\n  <td style=\"td-align: center;\">\n"
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.type : depth0),"list",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.type : depth0),"ndarray",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.type : depth0),"dict",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.type : depth0),"DataFrame",{"name":"compare","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.type : depth0),"Series",{"name":"compare","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "  </td>\n</tr>\n";
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
    + "\" style=\"height: 100%;\" data-filename=\""
    + alias3(((helper = (helper = helpers.filename || (depth0 != null ? depth0.filename : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"filename","hash":{},"data":data}) : helper)))
    + "\">\n  <div class=\"editor\" id=\"editor-"
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
templates['file-search-item.hbs'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<li class=\"hide\" onclick=\"$('#file-search-list .selected').removeClass('selected'); $(this).addClass('selected'); $('#file-search-form').submit();\" data-filename=\""
    + alias3(((helper = (helper = helpers.fullFilename || (depth0 != null ? depth0.fullFilename : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"fullFilename","hash":{},"data":data}) : helper)))
    + "\">\n  <a class=\"filename\">"
    + alias3(((helper = (helper = helpers.displayFilename || (depth0 != null ? depth0.displayFilename : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"displayFilename","hash":{},"data":data}) : helper)))
    + "</a>\n</li>\n";
},"useData":true});
templates['history-row.hbs'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<p style=\"margin: 0px;\">\n  <span class=\"pull-left\" style=\"width: 15px;\">()"
    + alias3(((helper = (helper = helpers.n || (depth0 != null ? depth0.n : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"n","hash":{},"data":data}) : helper)))
    + ")</span><span style=\"white-space: pre-wrap;\">"
    + alias3(((helper = (helper = helpers.command || (depth0 != null ? depth0.command : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"command","hash":{},"data":data}) : helper)))
    + "</span>\n</p>\n";
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
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, alias4=helpers.blockHelperMissing, buffer = 
  "<div class=\"tab-pane active\" id=\"editor-tab-pane-preferences\" style=\"height: 100%;\">\n  <div class=\"panel-body\">\n    <ul class=\"nav nav-tabs\">\n      <li class=\"active\"><a href=\"#general\" data-toggle=\"tab\">General</a></li>\n      <li><a href=\"#editor\" data-toggle=\"tab\">Editor</a></li>\n    </ul>\n    <div class=\"tab-content\" style=\"height: 100%;\">\n\n      <!-- General Tab -->\n      <div class=\"tab-pane active\" id=\"general\">\n        <br>\n        <div class=\"form-group\">\n          <label for=\"theme\">Theme</label>\n          <select onchange=\"setTheme($(this).val());\" class=\"form-control\" name=\"theme\" id=\"theme\">\n            <option value=\"css/styles.css\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.theme : depth0),"css/styles.css",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">light</option>\n            <option value=\"css/styles-presentation.css\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.theme : depth0),"css/styles-presentation.css",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">presentation</option>\n            <option value=\"css/styles-dark.css\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.theme : depth0),"css/styles-dark.css",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">dark</option>\n            <option value=\"css/styles-cobalt.css\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.theme : depth0),"css/styles-cobalt.css",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">cobalt</option>\n          </select>\n        </div>\n        <div class=\"form-group\">\n          <label for=\"defaultWorkingDirectory\">\n            Default Working Directory\n            <a data-toggle=\"tooltip\" data-placement=\"right\" title=\"<p class='small'>This is the default directory that Rodeo will open on launch.</p>\" data-html=\"true\"><i class=\"fa fa-question-circle\"></i></a>\n          </label>\n          <input onclick=\"var me = $(this); pickDirectory('Select a Default Working Directory', USER_WD, function(dir) { if (dir) { $(me).val(dir); setDefaultWd($(me).val()); }});\" class=\"form-control\" id=\"defaultWorkingDirectory\" name=\"defaultWorkingDirectory\" value=\""
    + alias3(((helper = (helper = helpers.defaultWd || (depth0 != null ? depth0.defaultWd : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"defaultWd","hash":{},"data":data}) : helper)))
    + "\" />\n        </div>\n        <div class=\"form-group\">\n          <label for=\"pythonCmd\">\n            Default Python Command\n            <a data-toggle=\"tooltip\" data-placement=\"right\" title=\"<p class='small'>The <code>python</code> command that Rodeo will use. Some operating systems (OSX in particular) ship with multiple versions of Python installed. This can be confusing and it is sometimes difficult to determine which <code>python</code> is the 'right one'.</p>\" data-html=\"true\"><i class=\"fa fa-question-circle\"></i></a>\n          </label>\n          <input onchange=\"setPythonCmd($(this).val());\" class=\"form-control\" id=\"pythonCmd\" name=\"pythonCmd\" value=\""
    + alias3(((helper = (helper = helpers.pythonCmd || (depth0 != null ? depth0.pythonCmd : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"pythonCmd","hash":{},"data":data}) : helper)))
    + "\" placeholder=\"/usr/local/bin/python\"/>\n        </div>\n        <div class=\"checkbox\">\n          <label>\n            <input onchange=\"setDisplayDotFiles($(this).prop('checked'));\" type=\"checkbox\" ";
  stack1 = ((helper = (helper = helpers.displayDotFiles || (depth0 != null ? depth0.displayDotFiles : depth0)) != null ? helper : alias1),(options={"name":"displayDotFiles","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.displayDotFiles) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "> Display Dot Files\n            <a data-toggle=\"tooltip\" data-placement=\"right\" title=\"<p class='small'>When checked, 'dotfiles' and directories (i.e. <code>.git</code>) will be displayed. NOTE: When updated, this will take affect upon restart.</p>\" data-html=\"true\"><i class=\"fa fa-question-circle\"></i></a>\n          </label>\n        </div>\n        <div class=\"checkbox\">\n          <label>\n            <input onchange=\"setTracking($(this).prop('checked'));\" type=\"checkbox\" ";
  stack1 = ((helper = (helper = helpers.trackingOn || (depth0 != null ? depth0.trackingOn : depth0)) != null ? helper : alias1),(options={"name":"trackingOn","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.trackingOn) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "> Tracking Metrics\n            <a data-toggle=\"tooltip\" data-placement=\"right\" title=\"<p class='small'>When checked, <strong>anonymous</strong> usage metrics will be reported back to <span style='color: #ee5311;'>&ycirc;</span>hat.</p>\" data-html=\"true\"><i class=\"fa fa-question-circle\"></i></a>\n          </label>\n        </div>\n      </div>\n      <!-- End General Tab -->\n\n      <!-- Editor Tab -->\n      <div class=\"tab-pane in\" id=\"editor\">\n        <br>\n        <div class=\"form-group\">\n          <label for=\"editorTheme\">Color Scheme</label>\n          <select onchange=\"setEditorTheme($(this).val());\" class=\"form-control\" name=\"editorTheme\" id=\"editorTheme\">\n            <option value=\"ace/theme/ambiance\" "
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
    + ">xcode</option>\n          </select>\n        </div>\n        <div class=\"form-group\">\n          <label for=\"keyBindings\">Key Bindings</label>\n          <select onchange=\"setKeyBindings($(this).val());\" class=\"form-control\" name=\"keyBindings\" id=\"keyBindings\">\n            <option value=\"default\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.keyBindings : depth0),"default",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">default</option>\n            <option value=\"ace/keyboard/vim\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.keyBindings : depth0),"ace/keyboard/vim",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">vim</option>\n            <option value=\"ace/keyboard/emacs\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.keyBindings : depth0),"ace/keyboard/emacs",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">emacs</option>\n          </select>\n        </div>\n        \n        <div class=\"form-group\">\n          <div style=\"width:10%; max-width: 25%;\">\n            <label for=\"fontSize\">Font Size</label>\n            <select onchange=\"setFontSize($(this).val());\" class=\"form-control\" id=\"fontSize\" name=\"fontSize\" type=\"number\" value=\""
    + alias3(((helper = (helper = helpers.fontSize || (depth0 != null ? depth0.fontSize : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"fontSize","hash":{},"data":data}) : helper)))
    + "\" >\n                <option value=\"10\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.fontSize : depth0),10,{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">10</option>\n                <option value=\"12\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.fontSize : depth0),12,{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">12</option>\n                <option value=\"14\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.fontSize : depth0),14,{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">14</option>\n                <option value=\"16\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.fontSize : depth0),16,{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">16</option>\n                <option value=\"18\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.fontSize : depth0),18,{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">18</option>\n                <option value=\"20\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.fontSize : depth0),20,{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">20</option>\n                <option value=\"22\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias1).call(depth0,(depth0 != null ? depth0.fontSize : depth0),22,{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">22</option>\n            </select>\n          </div>\n        </div>\n        <div class=\"checkbox\">\n          <label>\n            <input onchange=\"setAutoSave($(this).prop('checked'));\" type=\"checkbox\" ";
  stack1 = ((helper = (helper = helpers.autoSave || (depth0 != null ? depth0.autoSave : depth0)) != null ? helper : alias1),(options={"name":"autoSave","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.autoSave) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "> AutoSave Files\n          </label>\n        </div>\n      </div>\n      <!-- End Editor Tab -->\n\n      <!-- Layout Tab -->\n      <div class=\"tab-pane\" id=\"layout\">\n        <div class=\"row\" style=\"height: 100px;\">\n          <div class=\"col-sm-2\" style=\"height: 100px; background-color: skyblue;\">\n          </div>\n          <div class=\"col-sm-2\" style=\"height: 100px; background-color: grey;\">\n          </div>\n        </div>\n        <div class=\"row\" style=\"height: 100px;\">\n          <div class=\"col-sm-2\" style=\"height: 100px; background-color: grey;\">\n          </div>\n          <div class=\"col-sm-2\" style=\"height: 100px; background-color: skyblue;\">\n          </div>\n        </div>\n      </div>\n      <!-- End Layout Tab -->\n    </div>\n  </div>\n</div>\n";
},"useData":true});
templates['shortcuts.hbs'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<table class=\"table table-bordered\" style=\"margin-bottom: 0px;\">\n  <thead>\n    <tr>\n      <th>Topic</th>\n      <th>OSX</th>\n      <th>Windows / Linux</th>\n      <th>Action</th>\n    </tr>\n  </thead>\n  <tbody id=\"shortcut-rows\">\n    <!-- system shortcuts -->\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + enter</td>\n      <td>ctrl + enter</td>\n      <td>run code</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + ,</td>\n      <td>ctrl + ,</td>\n      <td>show preferences</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + g</td>\n      <td>ctrl + g</td>\n      <td>set default variables</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + Q</td>\n      <td>ctrl + Q</td>\n      <td>theoretical explanation</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + N</td>\n      <td>ctrl + N</td>\n      <td>new editor</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td> &#x21E7; + &#x2318; + O</td>\n      <td> &#x21E7; + ctrl + O</td>\n      <td>open file</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + s</td>\n      <td>ctrl + s</td>\n      <td>save file</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + w</td>\n      <td>ctrl + w</td>\n      <td>close file</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + t</td>\n      <td>ctrl + t</td>\n      <td>find file</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + &#x21E7; + &#x2190;</td>\n      <td>ctrl + &#x21E7; + &#x2190;</td>\n      <td>move to editor to the left of active editor</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + &#x21E7; + &#x2192;</td>\n      <td>ctrl + &#x21E7; + &#x2192;</td>\n      <td>move to editor to the right of active editor</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + 1</td>\n      <td>ctrl + 1</td>\n      <td>focus on editor</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + 2</td>\n      <td>ctrl + 2</td>\n      <td>focus on console</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + 3</td>\n      <td>ctrl + 3</td>\n      <td>toggle view for Environment/History</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + 4</td>\n      <td>ctrl + 4</td>\n      <td>toggle view for Files/Plots/Packages/Help</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + R</td>\n      <td>ctrl + R</td>\n      <td>restart Rodeo</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + 0</td>\n      <td>ctrl + 0</td>\n      <td>default zoom</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + =</td>\n      <td>ctrl + =</td>\n      <td>zoom in</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + -</td>\n      <td>ctrl + -</td>\n      <td>zoom out</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + &#x21E7; + g</td>\n      <td>ctrl + &#x21E7; + g</td>\n      <td>set working directory</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + &#x21E7; + 2</td>\n      <td>ctrl + &#x21E7; + 2</td>\n      <td>rerun 2nd to last command</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td>&#x2318; + &#x21E7; + 1</td>\n      <td>ctrl + &#x21E7; + 1</td>\n      <td>rerun last command</td>\n    </tr>\n    <!-- console shortcuts -->\n    <tr>\n      <td>Console</td>\n      <td>&#x2318;/ctrl + l</td>\n      <td>ctrl + l</td>\n      <td>clear console</td>\n    </tr>\n    <tr>\n      <td>Console</td>\n      <td>&#x2318;/ctrl + a</td>\n      <td>ctrl + a</td>\n      <td>skip to beginning of console</td>\n    </tr>\n    <tr>\n      <td>Console</td>\n      <td>&#x2318;/ctrl + e</td>\n      <td>ctrl + e</td>\n      <td>skip to end of console</td>\n    </tr>\n    <tr>\n      <td>Console</td>\n      <td>&#x2318;/ctrl + c</td>\n      <td>ctrl + c</td>\n      <td>cancel console input</td>\n    </tr>\n    <tr>\n      <td>Console</td>\n      <td>&#x2318;/ctrl + u</td>\n      <td>ctrl + u</td>\n      <td>clear to beginning of console</td>\n    </tr>\n    <tr>\n      <td>Console</td>\n      <td>&#x2318;/ctrl + k</td>\n      <td>ctrl + k</td>\n      <td>clear to end of console</td>\n    </tr>\n    <tr>\n      <td>Console</td>\n      <td>&#x2318;/ctrl + w</td>\n      <td>ctrl + w</td>\n      <td>clear one word backwards in console</td>\n    </tr>\n    <tr>\n      <td>Console</td>\n      <td><i>tab</i></td>\n      <td><i>tab</i></td>\n      <td>show autocomplete options</td>\n    </tr>\n    <!-- Editor shortcuts -->\n    <tr>\n      <td>Editor</td>\n      <td>&#x2318; + f</td>\n      <td>ctrl + f</td>\n      <td>find text</td>\n    </tr>\n    <tr>\n      <td>Editor</td>\n      <td><i>tab</i></td>\n      <td><i>tab</i></td>\n      <td>show autocomplete options</td>\n    </tr>\n  </tbody>\n</table>\n<footer class=\"container\">\n  &#x2318; = Command, &#x21E7; = Shift, &#x2190;&#x2191;&#x2192;&#x2193; = Arrow Keys\n</footer>\n";
},"useData":true});
templates['wd.hbs'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<a class=\"list-group-item\" style=\"padding: 5px 10px;\">\n  <i onclick=\"fileMenu.popup(remote.getCurrentWindow());\" class=\"fa fa-cogs\" style=\"color: grey;\"></i>&nbsp;\n  &nbsp;&nbsp;"
    + this.escapeExpression(((helper = (helper = helpers.dir || (depth0 != null ? depth0.dir : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"dir","hash":{},"data":data}) : helper)))
    + "\n</a>\n";
},"useData":true});
})();
