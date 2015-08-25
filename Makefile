LESS_FILES=$(shell find public/less -name '*.less' -type f)

.PHONEY: all css handlebars

all: css handlebars

css: static/css/styles.css

static/css/styles.css: $(LESS_FILES)
	lessc less/main.less > static/css/styles.css

handlebars: static/js/templates/preferences.js
	handlebars public/handlebars-templates/preferences.hbs > static/js/templates/preferences.js
