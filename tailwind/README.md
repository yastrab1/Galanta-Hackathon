## Install requirements

`npm install tailwindcss@1.9.6 --no-save`


## Generate developer Tailwindcss build:

`npx tailwindcss-cli build tailwindStyles.css > tailwind.css`

This will produce all classes used by Tailwindcss.


## Generate production Tailwindcss build:

`npx tailwindcss-cli build tailwindStyles.css -c tailwind.config.prod.js | npx clean-css-cli > tailwind.css`

This will produce classes only used in code(files are specified in `./tailwind.config.prod.js`) and minify the resulting css.
