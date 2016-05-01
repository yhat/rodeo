LESS_FILES=$(shell find public/less -name '*.less' -type f)
HBS_FILES=$(shell find public/handlebars-templates -name '*.hbs' -type f)
JS_FILES=$(shell find public/js -type f -name '*.js' | grep -v main.js)
JSX_FILES=$(shell find public/jsx -type f -name '*.jsx')
EXTERNAL_FILES=$(shell find public/js/lib -type f -name '*.js' | tr '\n' ' ')
ACE_FILES=$(shell find public/ace -type f -name '*.js' | grep -v ace.min.js)
APP_FILES=src/editors.js src/console.js src/script.js src/preferences.js src/menu.js

.PHONEY: all css js

all: css js jsx

css: static/css/styles.css static/css/styles-dark.css static/css/styles-presentation.css static/css/styles-cobalt.css

js: static/js/server-main.js static/js/desktop-main.js static/js/ace.min.js static/js/external.min.js

static/js/ace.min.js : $(ACE_FILES)
	uglifyjs $(shell find public/ace -type f -name '*.js' | grep -v main.js | tr '\n' ' ')	> static/js/ace.min.js

# src/app.js: $(APP_FILES)
# 	uglifyjs $(APP_FILES) > src/app.js
