minify:
	@./node_modules/.bin/uglifyjs slots.js > slots.min.js
	@echo -n "Development:        " && cat slots.js | wc -c
	@echo -n "Production:         " && cat slots.min.js | wc -c
	@echo -n "Production+gzipped: " && cat slots.min.js | gzip -c -f | wc -c
