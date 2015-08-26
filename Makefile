LESS_FILES=$(shell find public/less -name '*.less' -type f)

.PHONEY: all css 

all: css 

css: static/css/styles.css

static/css/styles.css: $(LESS_FILES)
	lessc public/less/main.less > static/css/styles.css

handlebars: public/handlebars-templates/preferences.hbs
	handlebars public/handlebars-templates/preferences.hbs > static/js/templates/preferences.js
