.PHONY: run clean

old-reddit-redirect.zip: *.json img/* *.txt background.js styles.css
	zip -r old-reddit-redirect.zip \
		manifest.json \
		rules.json \
		background.js \
		styles.css \
		img/icon*.png \
		LICENSE.txt \
		-x "*.DS_Store"

run:
	npx web-ext run

clean:
	rm -f *.zip
