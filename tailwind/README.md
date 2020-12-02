## Install requirements

`npm install tailwindcss@1.9.6 --no-save`


## Generate developer Tailwindcss build:

`npx tailwindcss build tailwind.css > build.css`

This will produce all classes used by Tailwindcss.


## Generate production Tailwindcss build:

	cat tailwind.css custom.css > tailwind.temp.css
	npx tailwindcss build tailwind.temp.css -c tailwind.config.prod.js | npx clean-css-cli > build.css

This will produce classes only used in code (files are specified in `./tailwind.config.prod.js`) and minify the resulting css.
