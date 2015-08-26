LESS_FILES=$(shell find public/less -name '*.less' -type f)
HBS_FILES=$(shell find public/handlebars-templates -name '*.hbs' -type f)
JS_FILES=$(shell find public/js -type f -name '*.js' | grep -v main.js)

.PHONEY: all css js

all: css js

css: static/css/styles.css

js: static/js/main.js

handlebars: static/js/handlebars-templates.js

static/css/styles.css: $(LESS_FILES)
	lessc public/less/main.less > static/css/styles.css

static/js/handlebars-templates.js: $(HBS_FILES)
	handlebars public/handlebars-templates/* > static/js/handlebars-templates.js

static/js/main.js : $(JS_FILES)
	uglifyjs $(shell find public/js -type f -name '*.js' | grep -v main.js | tr '\n' ' ') > static/js/main.js
