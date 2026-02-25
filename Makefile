.PHONY: run clean

old-reddit-enhanced.zip: manifest.json rules.json src/ modules/ img/ LICENSE.txt
	zip -r old-reddit-enhanced.zip \
		manifest.json \
		rules.json \
		src/ \
		modules/ \
		img/icon*.png \
		LICENSE.txt \
		-x "*.DS_Store"

run:
	npx web-ext run

clean:
	rm -f *.zip
