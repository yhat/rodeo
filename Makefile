LESS_FILES=$(shell find public/less -name '*.less' -type f)
HBS_FILES=$(shell find public/handlebars-templates -name '*.hbs' -type f)
JS_FILES=$(shell find public/js -type f -name '*.js' | grep -v main.js)
ACE_FILES=$(shell find public/ace -type f -name '*.js' | grep -v ace.min.js)
APP_FILES=src/editors.js src/console.js src/script.js src/preferences.js src/menu.js

.PHONEY: all css js

all: css js

css: static/css/styles.css static/css/styles-dark.css static/css/styles-presentation.css static/css/styles-cobalt.css

js: static/js/server-main.js static/js/desktop-main.js static/js/ace.min.js

handlebars: public/js/handlebars-templates.js

static/css/styles.css: $(LESS_FILES)
	lessc public/less/styles.less > static/css/styles.css

static/css/styles-cobalt.css: $(LESS_FILES)
	lessc public/less/styles-cobalt.less > static/css/styles-cobalt.css

static/css/styles-presentation.css: $(LESS_FILES)
	lessc public/less/styles-presentation.less > static/css/styles-presentation.css

static/css/styles-dark.css: $(LESS_FILES)
	lessc public/less/styles-dark.less > static/css/styles-dark.css

public/js/handlebars-templates.js: $(HBS_FILES)
	handlebars public/handlebars-templates/* > public/js/handlebars-templates.js

static/js/server-main.js : $(JS_FILES)
	uglifyjs public/js/lib/jquery.min.js \
		public/js/lib/jqconsole.min.js \
		public/js/lib/jquery.dataTables.js \
		public/js/lib/jquery.splitter-0.15.0.js \
		public/js/lib/mousetrap.js \
		public/js/lib/ascii-table.min.js \
		public/js/lib/bootstrap.min.js \
		public/js/lib/bootbox.js \
		public/js/lib/list.js \
		public/js/lib/owl.carousel.js \
		public/js/lib/saveSvgAsPng.js \
		public/js/lib/handlebars-v4.0.2.js \
		public/js/handlebars-templates.js \
		public/js/editor-events.js \
		public/js/event-handlers.js \
		public/js/helpers.js \
		public/js/editors.js \
		public/js/console.js \
		public/js/plots.js \
		public/js/search.js \
		public/js/templates.js \
		public/js/install-package.js \
		public/js/display-shortcuts.js \
		public/js/file-display.js \
		public/js/focus.js \
		public/js/session.js \
		public/js/global-shortcuts.js \
		public/js/preferences.js \
		public/js/server-menu.js > static/js/server-main.js

static/js/desktop-main.js : $(JS_FILES)
	uglifyjs public/js/lib/jquery.min.js \
		public/js/lib/jqconsole.min.js \
		public/js/lib/jquery.dataTables.js \
		public/js/lib/jquery.splitter-0.15.0.js \
		public/js/lib/ascii-table.min.js \
		public/js/lib/bootstrap.min.js \
		public/js/lib/bootbox.js \
		public/js/lib/list.js \
		public/js/lib/owl.carousel.js \
		public/js/lib/saveSvgAsPng.js \
		public/js/lib/handlebars-v4.0.2.js \
		public/js/handlebars-templates.js \
		public/js/editor-events.js \
		public/js/event-handlers-desktop.js \
		public/js/helpers.js \
		public/js/editors.js \
		public/js/console.js \
		public/js/plots.js \
		public/js/search.js \
		public/js/templates.js \
		public/js/install-package.js \
		public/js/display-shortcuts.js \
		public/js/file-display.js \
		public/js/focus.js \
		public/js/windows/display-variable.js \
		public/js/windows/about.js \
		public/js/session.js \
		public/js/preferences.js > static/js/desktop-main.js

static/js/ace.min.js : $(ACE_FILES)
	uglifyjs $(shell find public/ace -type f -name '*.js' | grep -v main.js | tr '\n' ' ')	> static/js/ace.min.js

# src/app.js: $(APP_FILES)
# 	uglifyjs $(APP_FILES) > src/app.js
