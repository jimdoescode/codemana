Code Mana
=========

A Gist enhancement tool. It allows for inline commenting and alternate syntax highlighting.

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
$ npm run watch
```
This will set up a watch so that if you make any javascript changes in the components directory they will be recompiled
into a single javascript file and dropped into the `./js` directory. This is ideal for developing new features. The compiled
js is not compressed so it can be easily debugged.

```sh
$ npm run build-dev
```
Compiles a single javascript file and drops it into the `./js` directory. This file is not compressed so you can debug issues.

```sh
$ npm run build-prod
```
This is the same as `build-dev` only it compresses and uglifies the compiled javascript so that it has a smaller footprint
in production settings.

```sh
$ npm run server
```
This attempts to run a local PHP server to host the single index.html file. You could easily change this to use node or
whatever server you want. I chose PHP because I didn't want to install node and I already had PHP on some of my test servers.

```sh
$ npm run clean-js
```
Deletes whatever script file is in the `./js` directory.