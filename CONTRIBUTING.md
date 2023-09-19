## Generate developer Tailwindcss build:

`bunx tailwindcss@experimental -i tailwind.css -o build.css`

This will produce all classes used by Tailwindcss.


## Generate production Tailwindcss build:

cat tailwind.css custom.css > tailwind.temp.css
bunx tailwindcss@experimental -i tailwind.temp.css -o build.css -m

This will produce classes only used in code (files are specified in `./tailwind.config.js`) and minify the resulting css.
