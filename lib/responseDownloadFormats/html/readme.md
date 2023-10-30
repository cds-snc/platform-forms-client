# HTML "Official record" Response Stylesheets

To keep the Official Record document payload light, this transformer includes a custom Tailwindcss config and custom stylesheet. The custom stylesheet contains some duplication from the main site stylesheet, but should be simple enough to maintain.

When making any changes to `className` properties in components, or to the `css/styles.css` file, you will need to update the compiled stylesheet (`styles.ts`). 

To do that, you can run the script `npm run compile`. 

You should then commit the changes along with `css/styles.ts` as that will contain the updated compiled styles.
