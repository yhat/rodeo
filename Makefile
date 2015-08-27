LESS_FILES=$(shell find public/less -name '*.less' -type f)
HBS_FILES=$(shell find public/handlebars-templates -name '*.hbs' -type f)
JS_FILES=$(shell find public/js -type f -name '*.js' | grep -v main.js)

.PHONEY: all css js

all: css js 

css: styles.css styles-dark.css styles-presentation.css styles-cobalt.css

js: static/js/main.js

handlebars: public/js/handlebars-templates.js

styles.css: $(LESS_FILES)
	lessc public/less/styles.less > static/css/styles.css

styles-cobalt.css: $(LESS_FILES)
	lessc public/less/styles-cobalt.less > static/css/styles-cobalt.css

styles-presentation.css: $(LESS_FILES)
	lessc public/less/styles-presentation.less > static/css/styles-presentation.css

styles-dark.css: $(LESS_FILES)
	lessc public/less/styles-dark.less > static/css/styles-dark.css

public/js/handlebars-templates.js: $(HBS_FILES)
	handlebars public/handlebars-templates/* > public/js/handlebars-templates.js

static/js/main.js : $(JS_FILES)
	uglifyjs $(shell find public/js -type f -name '*.js' | grep -v main.js | tr '\n' ' ') > static/js/main.js
