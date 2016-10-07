Code Mana
=========

A Gist enhancement web app. It allows for inline commenting and alternate syntax highlighting styles.

About
-----

Code Mana is built almost entirely in React. It requires no third party server and talks only with GitHub.
I made this mostly to tinker with React and learn more modern front end techniques.

Building
--------

First you need to pull in all the dependencies using npm.

```sh
$ npm install
```

After you have everything installed you can run the script commands provided in package.json

```sh
$ npm run watch-js
```
This will set up a watch so that if you make any javascript changes in the `./components` directory they will be recompiled
into a single javascript file which is dropped into the `./public/js` directory. This is ideal for developing new features. The compiled
js is not compressed so it can be easily debugged.

```sh
$ npm run build-dev-js
```
Compiles a single javascript file and drops it into the `./public/js` directory. This file is not compressed so you can debug issues.

```sh
$ npm run build-prod-js
```
This is the same as `build-dev-js` only it compresses and uglifies the compiled javascript so that it has a smaller footprint
in production settings.

```sh
$ npm run build-dev-css
```
This command compiles the SCSS files into a single CSS file and put it in `./public/css`

```sh
$ npm run start
```
This runs a local PHP server (http://localhost:8000/) to host the app files.

```sh
$ npm run clean
```
Deletes the script file in the `./public/js` directory and deletes the css files in the `./public/css` directory.

TODO
----

 + ~~I'd like to replace the current router with one that works without page refreshes. That will allow me to host this app exclusively on a GitHub page.~~

 + ~~Use Sass instead of hard coded CSS. Then I can move the styling into the app directory and add more compilation and better minification.~~
   - ~~This means moving the syntax highlighting styling out of the head.~~

 + Update prismjs to properly work with requirejs. Right now I can't have prism as an npm dependency because it won't support all the languages I want.

 + More syntax highlighting styles! In particular styles for colorblind folks.
