.PHONY: run clean

old-reddit-redirect.zip: *.json img/* *.txt background.js styles.css options.html options.js options.css modules/*
	zip -r old-reddit-redirect.zip \
		manifest.json \
		rules.json \
		background.js \
		content-script.js \
		storage.js \
		logger.js \
		keyboard-utils.js \
		frontends.js \
		suggestions.js \
		offscreen.html \
		offscreen.js \
		styles.css \
		popup.html \
		popup.js \
		popup.css \
		options.html \
		options.js \
		options.css \
		onboarding.html \
		onboarding.js \
		onboarding.css \
		modules/ \
		img/icon*.png \
		LICENSE.txt \
		-x "*.DS_Store"

run:
	npx web-ext run

clean:
	rm -f *.zip
