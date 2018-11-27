Code Mana
=========

A Gist enhancement web app. It allows for inline commenting and alternate syntax highlighting styles.

About
-----

Code Mana is built almost entirely in React. It requires no third party server and talks only with GitHub.
I made this mostly to tinker with React and learn more modern front end techniques.

Scripts
--------

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

Configuration
-------------

If you'd like to use codemana on an internal network or use an enterprise version of GitHub you can change the values in  `./src/Config.js` to your preferences. After you change the configs you should recompile and make sure a server is pointing at the public folder.

TODO
----

 + ~~I'd like to replace the current router with one that works without page refreshes. That will allow me to host this app exclusively on a GitHub page.~~

 + ~~Use Sass instead of hard coded CSS. Then I can move the styling into the app directory and add more compilation and better minification.~~
   - ~~This means moving the syntax highlighting styling out of the head.~~

 + Update prismjs to properly work with requirejs. Right now I can't have prism as an npm dependency because it won't support all the languages I want.

 + More syntax highlighting styles! In particular styles for colorblind folks.
