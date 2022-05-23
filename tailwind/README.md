## Install requirements

`npm install tailwindcss@3.0.24 --no-save`


## Generate developer Tailwindcss build:

`npx tailwindcss -i tailwind.css -o build.css`

This will produce all classes used by Tailwindcss.


## Generate production Tailwindcss build:

	cat tailwind.css custom.css > tailwind.temp.css
	npx tailwindcss -i tailwind.temp.css -c tailwind.config.prod.js -o build.css -m

This will produce classes only used in code (files are specified in `./tailwind.config.prod.js`) and minify the resulting css.
