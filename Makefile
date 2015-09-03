LESS_FILES=$(shell find public/less -name '*.less' -type f)
HBS_FILES=$(shell find public/handlebars-templates -name '*.hbs' -type f)
JS_FILES=$(shell find public/js -type f -name '*.js' | grep -v main.js)
APP_FILES=src/editors.js src/console.js src/script.js src/preferences.js src/menu.js

.PHONEY: all css js

all: css js

css: static/css/styles.css static/css/styles-dark.css static/css/styles-presentation.css static/css/styles-cobalt.css

js: static/js/main.js

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

static/js/main.js : $(JS_FILES)
	uglifyjs $(shell find public/js -type f -name '*.js' | grep -v main.js | tr '\n' ' ')	> static/js/main.js

# src/app.js: $(APP_FILES)
# 	uglifyjs $(APP_FILES) > src/app.js
