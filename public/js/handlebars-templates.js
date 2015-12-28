(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['active-variable.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "onclick=\"showVariable('"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "', '"
    + alias4(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data}) : helper)))
    + "');\"";
},"3":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "href=\"variable?name="
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "&type="
    + alias4(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data}) : helper)))
    + "\"";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, buffer = 
  "<tr>\n  <td>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</td>\n  <td>"
    + alias4(((helper = (helper = helpers.repr || (depth0 != null ? depth0.repr : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"repr","hash":{},"data":data}) : helper)))
    + "</td>\n  <td style=\"td-align: center;\">\n    <a target=_blank ";
  stack1 = ((helper = (helper = helpers.isDesktop || (depth0 != null ? depth0.isDesktop : depth0)) != null ? helper : alias2),(options={"name":"isDesktop","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.isDesktop) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + ">\n      <span class='fa fa-list-alt' aria-hidden='true'></span>&nbsp;View\n    </a>\n  </td>\n</tr>\n";
},"useData":true});
templates['bad-python.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"\">\n  <div class=\"jumbotron\">\n    <div class=\"\">\n      <h1>Bad news! Rodeo can't start <i class=\"fa fa-frown-o\"></i></h1>\n    </div>\n  </div>\n  <div id=\"ipython-error\" class=\" hide\">\n    <h3>What's going on?</h3>\n    <p class=\"small\">\n      Unfortunately Rodeo wasn't able to find the <code>python</code> command it needs in order\n      to run. Rodeo uses the same libraries the IPython Notebook does. This means, if you don't\n      have your notebook setup properly, Rodeo probably isn't going to work.\n    </p>\n    <h3>How do I fix it?</h3>\n    <p class=\"small\">\n      The good news is that we've identified the problem and it's fairly easy to fix. The root\n      of the problem is that you don't have Python setup correctly (or it's setup in a pretty non-standard\n      way that Rodeo doesn't recognize). You've got a couple options.\n    </p>\n    <hr />\n    <h3>The \"I just want it to work\" option</h3>\n    <p class=\"small\">\n      If you just want this to work as quickly as humanly possible, you can install a pre-packaged version of Python.\n      <br />\n      <br />\n      The easiest way to go about this is to install <a href=\"http://docs.continuum.io/anaconda/install\" target=\"_blank\">Anaconda</a>. It's free,\n      you can double-click to install, and it has everything you need to use Rodeo.\n      <br>\n      <br />\n      Once you're done, try re-running Rodeo.\n    </p>\n    <hr />\n    <h3>The \"I know what I'm doing\" option</h3>\n    <p class=\"small\">\n      Rodeo needs to be able to import either the <code>jupyter_client</code> or the <code>IPython</code> module. If you don't have\n      one of these installed, then that's probably your problem.\n      <br>\n      <br />\n      If you do have one of them installed, then the issue is that Rodeo is using the \"wrong python\". Rodeo defaults to using\n      whatever <code>python</code> is on your PATH (or on Windows, whatever is set in your Environment Variables).\n      <br />\n      <br />\n      Not sure if you have python installed? You should probably go back to the \"I just want it to work\" section.\n    </p>\n  </div>\n  <div id=\"matplotlib-error\" class=\" hide\">\n    <h3>What's going on?</h3>\n    <p class=\"small\">\n      Good news and bad news. The good news is that you've configured Jupyter/IPython correctly. The bad news is Rodeo wasn't able to load <code>matplotlib</code>.\n    </p>\n    <hr />\n    <h3>Installing <code>matplotlib</code></h3>\n    <p class=\"small\">\n      Luckily it's fairly easy to get out of this mess. The easiest way is to use <code>conda</code> (if you're using Anaconda) or\n      <code>pip</code> (if you're using \"regular\" python). Open up your terminal/command prompt and type in the following:\n    </p>\n    <pre># if you're a conda user...\n$ conda install matplotlib\n# or\n$ pip install matplotlib</pre>\n  </div>\n\n</div>";
},"useData":true});
templates['editor-tab.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "active";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, buffer = 
  "<li id=\"editor-tab-"
    + alias4(((helper = (helper = helpers.n || (depth0 != null ? depth0.n : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"n","hash":{},"data":data}) : helper)))
    + "\" class=\"";
  stack1 = ((helper = (helper = helpers.isFirst || (depth0 != null ? depth0.isFirst : depth0)) != null ? helper : alias2),(options={"name":"isFirst","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.isFirst) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\">\n  <a class=\"editor-tab-a\" href=\"#editor-tab-pane-"
    + alias4(((helper = (helper = helpers.n || (depth0 != null ? depth0.n : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"n","hash":{},"data":data}) : helper)))
    + "\" data-toggle=\"tab\" aria-expanded=\"false\">\n    <span class=\"name\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span><span class=\"unsaved hide\">*</span>&nbsp;<span style=\"color: red;\" onclick=\"closeActiveTab('"
    + alias4(((helper = (helper = helpers.n || (depth0 != null ? depth0.n : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"n","hash":{},"data":data}) : helper)))
    + "');\">&times;</span>\n  </a>\n</li>\n";
},"useData":true});
templates['editor.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"tab-pane active\" id=\"editor-tab-pane-"
    + alias4(((helper = (helper = helpers.n || (depth0 != null ? depth0.n : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"n","hash":{},"data":data}) : helper)))
    + "\" style=\"height: 100%;\" data-filename=\""
    + alias4(((helper = (helper = helpers.filename || (depth0 != null ? depth0.filename : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"filename","hash":{},"data":data}) : helper)))
    + "\">\n  <div class=\"editor\" id=\"editor-"
    + alias4(((helper = (helper = helpers.n || (depth0 != null ? depth0.n : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"n","hash":{},"data":data}) : helper)))
    + "\"></div>\n</div\n";
},"useData":true});
templates['file-item.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "fa-folder";
},"3":function(container,depth0,helpers,partials,data) {
    return "fa-file-o";
},"5":function(container,depth0,helpers,partials,data) {
    return "color: grey;";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=helpers.blockHelperMissing, buffer = 
  "<a oncontextmenu=\"folderMenu.filename = '"
    + alias4(((helper = (helper = helpers.filename || (depth0 != null ? depth0.filename : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"filename","hash":{},"data":data}) : helper)))
    + "'; folderMenu.popup(remote.getCurrentWindow());\" onclick=\"openFile('"
    + alias4(((helper = (helper = helpers.filename || (depth0 != null ? depth0.filename : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"filename","hash":{},"data":data}) : helper)))
    + "', "
    + alias4(((helper = (helper = helpers.isDir || (depth0 != null ? depth0.isDir : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"isDir","hash":{},"data":data}) : helper)))
    + ");\" data-parnet-slug=\"\" data-dirname=\"top_dir\" href=\"#\" class=\"list-group-item showdir\" style=\"padding: 5px 10px;\">\n  <i class=\"fa fa ";
  stack1 = ((helper = (helper = helpers.isDir || (depth0 != null ? depth0.isDir : depth0)) != null ? helper : alias2),(options={"name":"isDir","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.isDir) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\" style=\"";
  stack1 = ((helper = (helper = helpers.isDir || (depth0 != null ? depth0.isDir : depth0)) != null ? helper : alias2),(options={"name":"isDir","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.isDir) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\"></i>\n  &nbsp;&nbsp;"
    + alias4(((helper = (helper = helpers.basename || (depth0 != null ? depth0.basename : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"basename","hash":{},"data":data}) : helper)))
    + "\n</a>\n";
},"useData":true});
templates['file-search-item.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<li class=\"hide\" onclick=\"$('#file-search-list .selected').removeClass('selected'); $(this).addClass('selected'); $('#file-search-form').submit();\" data-filename=\""
    + alias4(((helper = (helper = helpers.fullFilename || (depth0 != null ? depth0.fullFilename : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"fullFilename","hash":{},"data":data}) : helper)))
    + "\">\n  <a class=\"filename\">"
    + alias4(((helper = (helper = helpers.displayFilename || (depth0 != null ? depth0.displayFilename : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayFilename","hash":{},"data":data}) : helper)))
    + "</a>\n</li>\n";
},"useData":true});
templates['history-row.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<p style=\"margin: 0px;\">\n  <span style=\"white-space: pre-wrap;\">"
    + container.escapeExpression(((helper = (helper = helpers.command || (depth0 != null ? depth0.command : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"command","hash":{},"data":data}) : helper)))
    + "</span>\n</p>\n";
},"useData":true});
templates['markdown-output.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "  <script type=\"text/javascript\">\n    window.$ = window.jQuery = require('jquery');\n  </script>\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "";
},"5":function(container,depth0,helpers,partials,data) {
    return "  <!-- start nav -->\n  <nav class=\"navbar navbar-default\" style=\"margin-bottom: 2px;\">\n    <div class=\"container-fluid\">\n      <div class=\"navbar-header\">\n        <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#bs-example-navbar-collapse-1\">\n          <span class=\"sr-only\">Toggle navigation</span>\n          <span class=\"icon-bar\"></span>\n          <span class=\"icon-bar\"></span>\n          <span class=\"icon-bar\"></span>\n        </button>\n      </div>\n\n      <form id=\"pdf-form\" class=\"navbar-form navbar-right\" method=\"POST\" action=\"/pdf\" role=\"search\">\n        <div class=\"form-group\">\n          <input type=\"hidden\" id=\"pdf-html\" name=\"html\" value=\"\" />\n        </div>\n        <button type=\"submit\" id=\"pdf\" class=\"btn btn-primary\">Export as PDF</button>\n      </form>\n\n    </div>\n  </nav>\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "  <script type=\"text/javascript\">\n    $(\"#pdf-form\").submit(function(e) {\n      e.preventDefault();\n      require('ipc').send('pdf', { html: $(\"#content\").html() });\n      return false;\n    });\n  </script>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <title>Rodeo</title>\n  <link rel=\"stylesheet\" href=\"css/styles.css\" />\n  <link rel=\"stylesheet\" href=\"http://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.9.1/styles/default.min.css\">\n  <script src=\"http://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.9.1/highlight.min.js\"></script>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.desktop : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  <script src=\"js/external.min.js\"></script>\n</head>\n<body>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.desktop : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(5, data, 0),"data":data})) != null ? stack1 : "")
    + "  <!-- end nav -->\n  <div id=\"content\" class=\"container\">\n    "
    + ((stack1 = ((helper = (helper = helpers.renderedMarkdown || (depth0 != null ? depth0.renderedMarkdown : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"renderedMarkdown","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n  </div>\n  <script type=\"text/javascript\" src=\"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML\"></script>\n  <script type=\"text/javascript\">\n    $(document).ready(function() {\n      $(\"#pdf-html\").val($(\"#content\").html());\n    });\n  </script>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.desktop : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</body>\n";
},"useData":true});
templates['menu-item.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.isDivider || (depth0 != null ? depth0.isDivider : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"isDivider","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(4, data, 0),"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.isDivider) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"2":function(container,depth0,helpers,partials,data) {
    return "      <li class=\"divider\"></li>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "        <li>\n          <a "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.onclick : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.href : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\n            <div class=\"row\">\n              <div class=\"col-sm-6\">\n                "
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "\n              </div>\n              <div class=\"col-sm-6 text-right\">\n                <span style=\"font-size: 10px;\">\n                  "
    + alias4(((helper = (helper = helpers.shortcut || (depth0 != null ? depth0.shortcut : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"shortcut","hash":{},"data":data}) : helper)))
    + "\n                </span>\n              </div>\n            </div>\n          </a>\n        </li>\n";
},"5":function(container,depth0,helpers,partials,data) {
    var helper;

  return "onclick=\""
    + container.escapeExpression(((helper = (helper = helpers.onclick || (depth0 != null ? depth0.onclick : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"onclick","hash":{},"data":data}) : helper)))
    + "\"";
},"7":function(container,depth0,helpers,partials,data) {
    var helper;

  return "href=\""
    + container.escapeExpression(((helper = (helper = helpers.href || (depth0 != null ? depth0.href : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"href","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\"";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, buffer = 
  "<li class=\"dropdown\">\n  <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" role=\"button\" aria-expanded=\"false\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span></a>\n  <ul id=\"menu-"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" class=\"dropdown-menu\" role=\"menu\" style=\"width: 250px !important;\">\n";
  stack1 = ((helper = (helper = helpers.items || (depth0 != null ? depth0.items : depth0)) != null ? helper : alias2),(options={"name":"items","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.items) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "  </ul>\n</li>\n";
},"useData":true});
templates['nav-item.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<li>\n  <a onclick=\""
    + alias4(((helper = (helper = helpers.onclick || (depth0 != null ? depth0.onclick : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"onclick","hash":{},"data":data}) : helper)))
    + "\">\n    <div class=\"row\">\n      <div class=\"col-sm-6\">"
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "</div>\n      <div class=\"col-sm-6 text-right\">\n        <span style=\"font-size: 10px;\">\n          "
    + alias4(((helper = (helper = helpers.shortcut || (depth0 != null ? depth0.shortcut : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"shortcut","hash":{},"data":data}) : helper)))
    + "\n        </span>\n      </div>\n    </div>\n  </a>\n</li>\n";
},"useData":true});
templates['package-row.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<tr>\n  <td>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</td>\n  <td>"
    + alias4(((helper = (helper = helpers.version || (depth0 != null ? depth0.version : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"version","hash":{},"data":data}) : helper)))
    + "</td>\n</tr>\n";
},"useData":true});
templates['preferences.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "selected";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "              <option "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depths[1] != null ? depths[1].pythonCmd : depths[1]),depth0,{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "</option>\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "checked";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=helpers.blockHelperMissing, buffer = 
  "<div class=\"container\">\n  <ul class=\"nav nav-tabs\">\n    <li class=\"active\"><a href=\"#general\" data-toggle=\"tab\">General</a></li>\n    <li><a href=\"#editor\" data-toggle=\"tab\">Editor</a></li>\n  </ul>\n  <div id=\"preferences-container\" class=\"tab-content\" style=\"height: 100%;\">\n\n    <!-- General Tab -->\n    <div class=\"tab-pane active\" id=\"general\" style=\"height: 100%;\">\n      <br>\n      <div class=\"form-group\">\n        <label for=\"theme\">Theme</label>\n        <select onchange=\"setTheme($(this).val());\" class=\"form-control\" name=\"theme\" id=\"theme\">\n          <option value=\"css/styles.css\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.theme : depth0),"css/styles.css",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">light</option>\n          <option value=\"css/styles-presentation.css\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.theme : depth0),"css/styles-presentation.css",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">presentation</option>\n          <option value=\"css/styles-dark.css\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.theme : depth0),"css/styles-dark.css",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">dark</option>\n          <option value=\"css/styles-cobalt.css\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.theme : depth0),"css/styles-cobalt.css",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">cobalt</option>\n        </select>\n      </div>\n      <div class=\"form-group\">\n        <label for=\"defaultWorkingDirectory\">\n          Default Working Directory\n          <a data-toggle=\"tooltip\" data-placement=\"right\" title=\"<p class='small'>This is the default directory that Rodeo will open on launch.</p>\" data-html=\"true\"><i class=\"fa fa-question-circle\"></i></a>\n        </label>\n        <input onclick=\"var me = $(this); setWorkingDirectory(function(wd) { $(me).val(wd); });\" class=\"form-control\" id=\"defaultWorkingDirectory\" name=\"defaultWorkingDirectory\" value=\""
    + alias4(((helper = (helper = helpers.defaultWd || (depth0 != null ? depth0.defaultWd : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"defaultWd","hash":{},"data":data}) : helper)))
    + "\" />\n      </div>\n      <div class=\"form-group\">\n        <label for=\"pythonCmd\">\n          Default Python Command\n          <a data-toggle=\"tooltip\" data-placement=\"right\" title=\"<p class='small'>The <code>python</code> command that Rodeo will use. Some operating systems (OSX in particular) ship with multiple versions of Python installed. This can be confusing and it is sometimes difficult to determine which <code>python</code> is the 'right one'.</p>\" data-html=\"true\"><i class=\"fa fa-question-circle\"></i></a>\n        </label>\n        <div class=\"input-group\">\n          <select onchange=\"changeDefaultPath($(this).val());\" class=\"form-control col-sm-6\">\n";
  stack1 = ((helper = (helper = helpers.pythonPaths || (depth0 != null ? depth0.pythonPaths : depth0)) != null ? helper : alias2),(options={"name":"pythonPaths","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.pythonPaths) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "            <option value=\"add-path\">Add new python path</option>\n          </select>\n          <div class=\"input-group-btn\">\n            <button class=\"btn btn-primary\">Add new python path</button>\n          </div>\n        </div>\n      </div>\n      <div class=\"form-group\">\n        <label for=\"defaultVariables\">\n          Default Variables\n          <a data-toggle=\"tooltip\" data-placement=\"right\" title=\"<p class='small'>Configure default variables that will be created when Rodeo is started. This is just a Python script that is executed on startup.</p>\" data-html=\"true\"><i class=\"fa fa-question-circle\"></i></a>\n        </label>\n        <button class=\"btn btn-xs btn-primary\" onclick=\"showRodeoProfile();\">Configure</button>\n      </div>\n      <div class=\"form-group\">\n        <div style=\"width:20%; max-width: 25%;\">\n          <label for=\"fontType\">Font Type</label>\n          <select onchange=\"setFontType($(this).val());\" class=\"form-control\" id=\"fontType\" name=\"fontType\" type=\"number\" value=\""
    + alias4(((helper = (helper = helpers.fontType || (depth0 != null ? depth0.fontType : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"fontType","hash":{},"data":data}) : helper)))
    + "\" >\n              <option value=\"Consolas\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.fontType : depth0),(depth0 != null ? depth0.Consolas : depth0),{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">Consolas</option>\n              <option value=\"Courier New\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.fontType : depth0),"Courier New",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">Courier New</option>\n              <option value=\"Georgia\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.fontType : depth0),(depth0 != null ? depth0.Georgia : depth0),{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">Georgia</option>\n              <option value=\"Helvetica Neue\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.fontType : depth0),"Helvetica Neue",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">Helvetica Neue (default)</option>\n              <option value=\"Helvetica\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.fontType : depth0),"Helvetica",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">Helvetica</option>\n              <option value=\"Inconsolata\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.fontType : depth0),(depth0 != null ? depth0.Inconsolata : depth0),{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">Inconsolata</option>\n          </select>\n        </div>\n      </div>\n      <div class=\"form-group\">\n        <div style=\"width:10%; max-width: 25%;\">\n          <label for=\"fontSize\">Font Size</label>\n          <select onchange=\"setFontSize($(this).val());\" class=\"form-control\" id=\"fontSize\" name=\"fontSize\" type=\"number\" value=\""
    + alias4(((helper = (helper = helpers.fontSize || (depth0 != null ? depth0.fontSize : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"fontSize","hash":{},"data":data}) : helper)))
    + "\" >\n              <option value=\"10\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.fontSize : depth0),10,{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">10</option>\n              <option value=\"12\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.fontSize : depth0),12,{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">12</option>\n              <option value=\"14\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.fontSize : depth0),14,{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">14</option>\n              <option value=\"16\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.fontSize : depth0),16,{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">16</option>\n              <option value=\"18\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.fontSize : depth0),18,{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">18</option>\n              <option value=\"20\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.fontSize : depth0),20,{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">20</option>\n              <option value=\"22\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.fontSize : depth0),22,{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">22</option>\n          </select>\n        </div>\n      </div>\n      <div class=\"checkbox\">\n        <label>\n          <input onchange=\"setDisplayDotFiles($(this).prop('checked'));\" type=\"checkbox\" ";
  stack1 = ((helper = (helper = helpers.displayDotFiles || (depth0 != null ? depth0.displayDotFiles : depth0)) != null ? helper : alias2),(options={"name":"displayDotFiles","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.displayDotFiles) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "> Display Dot Files\n          <a data-toggle=\"tooltip\" data-placement=\"right\" title=\"<p class='small'>When checked, 'dotfiles' and directories (i.e. <code>.git</code>) will be displayed. NOTE: When updated, this will take affect upon restart.</p>\" data-html=\"true\"><i class=\"fa fa-question-circle\"></i></a>\n        </label>\n      </div>\n      <div class=\"checkbox\">\n        <label>\n          <input onchange=\"setTracking($(this).prop('checked'));\" type=\"checkbox\" ";
  stack1 = ((helper = (helper = helpers.trackingOn || (depth0 != null ? depth0.trackingOn : depth0)) != null ? helper : alias2),(options={"name":"trackingOn","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.trackingOn) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "> Tracking Metrics\n          <a data-toggle=\"tooltip\" data-placement=\"right\" title=\"<p class='small'>When checked, <strong>anonymous</strong> usage metrics will be reported back to <span style='color: #ee5311;'>&ycirc;</span>hat.</p>\" data-html=\"true\"><i class=\"fa fa-question-circle\"></i></a>\n        </label>\n      </div>\n    </div>\n    <!-- End General Tab -->\n\n    <!-- Editor Tab -->\n    <div class=\"tab-pane in\" id=\"editor\" style=\"height: 100%;\">\n      <br>\n      <div class=\"form-group\">\n        <label for=\"editorTheme\">Color Scheme</label>\n        <select onchange=\"setEditorTheme($(this).val());\" class=\"form-control\" name=\"editorTheme\" id=\"editorTheme\">\n          <option value=\"ace/theme/ambiance\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/ambiance",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">ambiance</option>\n          <option value=\"ace/theme/chaos\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/chaos",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">chaos</option>\n          <option value=\"ace/theme/chrome\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/chrome",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">chrome (default)</option>\n          <option value=\"ace/theme/clouds\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/clouds",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">clouds</option>\n          <option value=\"ace/theme/clouds_midnight\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/clouds_midnight",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">clouds midnight</option>\n          <option value=\"ace/theme/cobalt\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/cobalt",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">cobalt</option>\n          <option value=\"ace/theme/crimson_editor\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/crimson_editor",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">crimson editor</option>\n          <option value=\"ace/theme/dawn\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/dawn",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">dawn</option>\n          <option value=\"ace/theme/dreamweaver\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/dreamweaver",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">dreamweaver</option>\n          <option value=\"ace/theme/eclipse\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/eclipse",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">eclipse</option>\n          <option value=\"ace/theme/github\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/github",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">github</option>\n          <option value=\"ace/theme/idle_fingers\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/idle_fingers",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">idle fingers</option>\n          <option value=\"ace/theme/katzenmilch\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/katzenmilch",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">katzenmilch</option>\n          <option value=\"ace/theme/kr_theme\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/kr_theme",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">kr theme</option>\n          <option value=\"ace/theme/kuroir\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/kuroir",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">kuroir</option>\n          <option value=\"ace/theme/merbivore\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/merbivore",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">merbivore</option>\n          <option value=\"ace/theme/merbivore_soft\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/merbivore_soft",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">merbivore soft</option>\n          <option value=\"ace/theme/mono_industrial\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/mono_industrial",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">mono industrial</option>\n          <option value=\"ace/theme/monokai\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/monokai",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">monokai</option>\n          <option value=\"ace/theme/pastel_on_dark\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/pastel_on_dark",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">pastel on dark</option>\n          <option value=\"ace/theme/solarized_dark\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/solarized_dark",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">solarized dark</option>\n          <option value=\"ace/theme/solarized_light\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/solarized_light",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">solarized light</option>\n          <option value=\"ace/theme/terminal\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/terminal",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">terminal</option>\n          <option value=\"ace/theme/textmate\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/textmate",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">textmate</option>\n          <option value=\"ace/theme/tomorrow\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/tomorrow",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">tomorrow</option>\n          <option value=\"ace/theme/tomorrow_night\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/tomorrow_night",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">tomorrow night</option>\n          <option value=\"ace/theme/tomorrow_night_blue\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/tomorrow_night_blue",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">tomorrow night blue</option>\n          <option value=\"ace/theme/tomorrow_night_bright\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/tomorrow_night_bright",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">tomorrow night bright</option>\n          <option value=\"ace/theme/tomorrow_night_eighties\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/tomorrow_night_eighties",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">tomorrow night eighties</option>\n          <option value=\"ace/theme/twilight\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/twilight",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">twilight</option>\n          <option value=\"ace/theme/vibrant_ink\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/vibrant_ink",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">vibrant ink</option>\n          <option value=\"ace/theme/xcode\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.editorTheme : depth0),"ace/theme/xcode",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">xcode</option>\n        </select>\n      </div>\n      <div class=\"form-group\">\n        <label for=\"keyBindings\">Key Bindings</label>\n        <select onchange=\"setKeyBindings($(this).val());\" class=\"form-control\" name=\"keyBindings\" id=\"keyBindings\">\n          <option value=\"default\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.keyBindings : depth0),"default",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">default</option>\n          <option value=\"ace/keyboard/vim\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.keyBindings : depth0),"ace/keyboard/vim",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">vim</option>\n          <option value=\"ace/keyboard/emacs\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || alias2).call(alias1,(depth0 != null ? depth0.keyBindings : depth0),"ace/keyboard/emacs",{"name":"compare","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">emacs</option>\n        </select>\n      </div>\n      <div class=\"checkbox\">\n        <label>\n          <input onchange=\"setAutoSave($(this).prop('checked'));\" type=\"checkbox\" ";
  stack1 = ((helper = (helper = helpers.autoSave || (depth0 != null ? depth0.autoSave : depth0)) != null ? helper : alias2),(options={"name":"autoSave","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.autoSave) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "> AutoSave Files\n        </label>\n      </div>\n    </div>\n    <!-- End Editor Tab -->\n\n    <!-- Layout Tab -->\n    <div class=\"tab-pane\" id=\"layout\">\n      <div class=\"row\" style=\"height: 100px;\">\n        <div class=\"col-sm-2\" style=\"height: 100px; background-color: skyblue;\">\n        </div>\n        <div class=\"col-sm-2\" style=\"height: 100px; background-color: grey;\">\n        </div>\n      </div>\n      <div class=\"row\" style=\"height: 100px;\">\n        <div class=\"col-sm-2\" style=\"height: 100px; background-color: grey;\">\n        </div>\n        <div class=\"col-sm-2\" style=\"height: 100px; background-color: skyblue;\">\n        </div>\n      </div>\n    </div>\n    <!-- End Layout Tab -->\n  </div>\n</div>\n";
},"useData":true,"useDepths":true});
templates['python-path-item.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "<li class=\"list-group-item\">\n  <i>"
    + alias2(alias1(depth0, depth0))
    + "</i>\n  <button onclick=\"deletePythonPath(this);\" data-path=\""
    + alias2(alias1(depth0, depth0))
    + "\" class=\"btn btn-xs btn-danger pull-right\">remove</button>\n</li>\n";
},"useData":true});
templates['python-test-output.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "list-group-item-success";
},"3":function(container,depth0,helpers,partials,data) {
    return "list-group-item-danger";
},"5":function(container,depth0,helpers,partials,data) {
    return "<i class=\"fa fa-check\"></i>";
},"7":function(container,depth0,helpers,partials,data) {
    return "<i class=\"fa fa-times\"></i>";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "<ul class=\"list-group\">\n  <li id=\"output-python\" class=\"list-group-item "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.status : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "\">\n    Python PATH&nbsp;"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.status : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data})) != null ? stack1 : "")
    + "\n  </li>\n  <li id=\"output-jupyter\" class=\"list-group-item "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.jupyter : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "\">\n    Jupyter&nbsp;"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.jupyter : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data})) != null ? stack1 : "")
    + "\n  </li>\n  <li id=\"output-matplotlib\" class=\"list-group-item "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.matplotlib : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "\">\n    matplotlib&nbsp;"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.matplotlib : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data})) != null ? stack1 : "")
    + "\n  </li>\n</ul>\n";
},"useData":true});
templates['python-triage.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"jumbotron\" style=\"background-color: inherit;\">\n  <h2>"
    + alias4(((helper = (helper = helpers.errorMessage || (depth0 != null ? depth0.errorMessage : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"errorMessage","hash":{},"data":data}) : helper)))
    + "</h2>\n  <p class=\"lead\">"
    + alias4(((helper = (helper = helpers.errorSubmessage || (depth0 != null ? depth0.errorSubmessage : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"errorSubmessage","hash":{},"data":data}) : helper)))
    + "</p>\n</div>\n\n\n\n\n\n<div class=\"jumbotron\" style=\"background-color: inherit;\">\n  <h2>Looks like we're having trouble finding your python path</h2>\n  <p class=\"lead\">If you know your python path, paste it in the field below:</p>\n  <div class=\"row\">\n    <div class=\"form-group col-sm-8 col-sm-offset-2\">\n      <div class=\"input-group\">\n        <input id=\"python-path\" class=\"form-control\" type=\"text\"/>\n        <div class=\"input-group-btn\">\n          <button id=\"btn-set-path\" class=\"btn btn-primary\">Set Path</button>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div id=\"test-results\" class=\"col-sm-4 col-sm-offset-4\">\n    </div>\n  </div>\n  <img id=\"loading-gif\" src=\"img/loading-stopped.gif\" style=\"max-height: 200px;\" />\n  <div id=\"which-python\" class=\"row\">\n    <h2>Don't know your python path?</h2>\n    <p class=\"lead\">\n      <a onClick=\"shell.openItem('"
    + alias4(((helper = (helper = helpers.pathToterminal || (depth0 != null ? depth0.pathToterminal : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"pathToterminal","hash":{},"data":data}) : helper)))
    + "');\">Click here to open the Terminal application</a>\n      and run the command below:\n    </p>\n    <div class=\"row\">\n      <div class=\"col-sm-8 col-sm-offset-2 text-left\">\n        <pre>$ which python</pre>\n      </div>\n    </div>\n  </div>\n  <!--  start ready -->\n  <div id=\"rodeo-ready\" class=\"row hide\">\n    <h2>Ok! You're ready to go!</h2>\n    <p class=\"lead\">Hope you enjoy Rodeo!</p>\n    <img src=\"img/rodeo-text-dark.png\" style=\"max-height: 150px;\"/>\n  </div>\n  <!--  end ready -->\n  <!--  start install jupyter -->\n  <div id=\"install-jupyter\" class=\"row hide\">\n    <h2>Looks like you're missing <i>jupyter</i></h2>\n    <p class=\"lead\">\n      <a onClick=\"shell.openItem('"
    + alias4(((helper = (helper = helpers.pathToterminal || (depth0 != null ? depth0.pathToterminal : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"pathToterminal","hash":{},"data":data}) : helper)))
    + "');\">Click here to open the Terminal application</a>\n      and run the command below:\n    </p>\n    <p class=\"lead\">For Conda users:</p>\n    <div class=\"row\">\n      <div class=\"col-sm-8 col-sm-offset-2 text-left\">\n        <pre>$ conda install jupyter</pre>\n      </div>\n    </div>\n    <p class=\"lead\">For pip users:</p>\n    <div class=\"row\">\n      <div class=\"col-sm-8 col-sm-offset-2 text-left\">\n        <pre>$ pip install jupyter</pre>\n      </div>\n    </div>\n  </div>\n  <!--  end install jupyter -->\n\n  <!--  start install matplotlib -->\n  <div id=\"install-matplotlib\" class=\"row hide\">\n    <h2>Looks like you're missing <i>matplotlib</i></h2>\n    <p class=\"lead\">\n      <a onClick=\"shell.openItem('"
    + alias4(((helper = (helper = helpers.pathToterminal || (depth0 != null ? depth0.pathToterminal : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"pathToterminal","hash":{},"data":data}) : helper)))
    + "');\">Click here to open the Terminal application</a>\n      and run the command below:\n    </p>\n    <p class=\"lead\">For Conda users:</p>\n    <div class=\"row\">\n      <div class=\"col-sm-8 col-sm-offset-2 text-left\">\n        <pre>$ conda install matplotlib</pre>\n      </div>\n    </div>\n    <p class=\"lead\">For pip users:</p>\n    <div class=\"row\">\n      <div class=\"col-sm-8 col-sm-offset-2 text-left\">\n        <pre>$ pip install matplotlib</pre>\n      </div>\n    </div>\n  </div>\n  <!--  end install matplotlib -->\n</div>\n";
},"useData":true});
templates['shortcuts.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<table class=\"table table-bordered\" style=\"margin-bottom: 0px;\">\n  <thead>\n    <tr>\n      <th>Topic</th>\n      <th>OSX</th>\n      <th>Windows / Linux</th>\n      <th>Action</th>\n    </tr>\n  </thead>\n  <tbody id=\"shortcut-rows\">\n    <!-- system shortcuts -->\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>enter</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>enter</kbd></td>\n      <td>run code</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>,</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>,</kbd></td>\n      <td>show preferences</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>g</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>g</kbd></td>\n      <td>set default variables</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>Q</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>Q</kbd></td>\n      <td>theoretical explanation</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>N</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>N</kbd></td>\n      <td>new editor</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8679;</kbd> + <kbd>&#8984;</kbd> + <kbd>O</kbd></td>\n      <td> <kbd>&#8679;</kbd> + <kbd><kbd>ctrl</kbd></kbd> + <kbd>O</kbd></td>\n      <td>open file</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>s</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>s</kbd></td>\n      <td>save file</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>w</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>w</kbd></td>\n      <td>close file</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>t</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>t</kbd></td>\n      <td>find file</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>opt</kbd> + <kbd>&#8592;</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>opt</kbd> + <kbd>&#8592;</kbd></td>\n      <td>move to editor to the left of active editor</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>opt</kbd> + <kbd>&#8594;</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>opt</kbd> + <kbd>&#8594;</kbd></td>\n      <td>move to editor to the right of active editor</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>1</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>1</kbd></td>\n      <td>focus on editor</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>2</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>2</kbd></td>\n      <td>focus on console</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>3</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>3</kbd></td>\n      <td>toggle view for Environment/History</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>4</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>4</kbd></td>\n      <td>toggle view for Files/Plots/Packages/Help</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>R</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>R</kbd></td>\n      <td>restart Rodeo</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>0</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>0</kbd></td>\n      <td>default zoom</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>=</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>=</kbd></td>\n      <td>zoom in</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>-</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>-</kbd></td>\n      <td>zoom out</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>&#8679;</kbd> + <kbd>g</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>&#8679;</kbd> + <kbd>g</kbd></td>\n      <td>set working directory</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>&#8679;</kbd> + <kbd>2</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>&#8679;</kbd> + <kbd>2</kbd></td>\n      <td>rerun 2nd to last command</td>\n    </tr>\n    <tr>\n      <td>System</td>\n      <td><kbd>&#8984;</kbd> + <kbd>&#8679;</kbd> + <kbd>1</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>&#8679;</kbd> + <kbd>1</kbd></td>\n      <td>rerun last command</td>\n    </tr>\n    <!-- console shortcuts -->\n    <tr>\n      <td>Console</td>\n      <td><kbd>&#8984;</kbd>/<kbd>ctrl</kbd> + <kbd>l</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>l</kbd></td>\n      <td>clear console</td>\n    </tr>\n    <tr>\n      <td>Console</td>\n      <td><kbd>&#8984;</kbd>/<kbd>ctrl</kbd> + <kbd>a</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>a</kbd></td>\n      <td>skip to beginning of console</td>\n    </tr>\n    <tr>\n      <td>Console</td>\n      <td><kbd>&#8984;</kbd>/<kbd>ctrl</kbd> + <kbd>e</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>e</kbd></td>\n      <td>skip to end of console</td>\n    </tr>\n    <tr>\n      <td>Console</td>\n      <td><kbd>&#8984;</kbd>/<kbd>ctrl</kbd> + <kbd>c</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>c</kbd></td>\n      <td>cancel console input</td>\n    </tr>\n    <tr>\n      <td>Console</td>\n      <td><kbd>&#8984;</kbd>/<kbd>ctrl</kbd> + <kbd>u</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>u</kbd></td>\n      <td>clear to beginning of console</td>\n    </tr>\n    <tr>\n      <td>Console</td>\n      <td><kbd>&#8984;</kbd>/<kbd>ctrl</kbd> + <kbd>k</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>k</kbd></td>\n      <td>clear to end of console</td>\n    </tr>\n    <tr>\n      <td>Console</td>\n      <td><kbd>&#8984;</kbd>/<kbd>ctrl</kbd> + <kbd>w</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>w</kbd></td>\n      <td>clear one word backwards in console</td>\n    </tr>\n    <tr>\n      <td>Console</td>\n      <td><kbd><i>tab</i></kbd></td>\n      <td><kbd><i>tab</i></kbd></td>\n      <td>show autocomplete options</td>\n    </tr>\n    <!-- Editor shortcuts -->\n    <tr>\n      <td>Editor</td>\n      <td><kbd>&#8984;</kbd> + <kbd>f</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>f</kbd></td>\n      <td>find text</td>\n    </tr>\n    <tr>\n      <td>Editor</td>\n      <td><kbd><i>tab</i></kbd></td>\n      <td><kbd><i>tab</i></kbd></td>\n      <td>show autocomplete options</td>\n    </tr>\n      <tr>\n      <td>Editor</td>\n      <td><kbd>&#8984;</kbd>/<kbd>ctrl</kbd> + <kbd>/</kbd></td>\n      <td><kbd>ctrl</kbd> + <kbd>/</kbd></td>\n      <td>comment code</td>\n    </tr>\n  </tbody>\n</table><footer class=\"container\">\n  &#x2318; = Command, &#x21E7; = Shift, &#x2190;&#x2191;&#x2192;&#x2193; = Arrow Keys\n</footer>\n";
},"useData":true});
templates['wd.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<a class=\"list-group-item\" style=\"padding: 5px 10px;\">\n  <i onclick=\"fileMenu.popup(remote.getCurrentWindow());\" class=\"fa fa-cogs\" style=\"color: grey;\"></i>&nbsp;\n  &nbsp;&nbsp;"
    + container.escapeExpression(((helper = (helper = helpers.dir || (depth0 != null ? depth0.dir : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"dir","hash":{},"data":data}) : helper)))
    + "\n</a>\n";
},"useData":true});
})();
