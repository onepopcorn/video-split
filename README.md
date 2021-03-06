# Video Split Experience

An interactive experience concept using 2 Vimeo's videos in sync with split screen and crossfade music.

## Overview

This project has been made with edge technologies like ECMASCRIPT6 - with [Babel](https://babeljs.io/) - or [Browserify](http://browserify.org/) to handle modules. All tied togheter with [Gulp](http://gulpjs.com/).
To use it just follow installation instructions

## Installation

This project uses [NodeJS](http://nodejs.org), [Gulp](http://gulpjs.com/), [Ruby](http://rubyinstaller.org/) & [SASS](http://sass-lang.com/)

Install node & ruby with the links above. After that install SASS with:

```
gem install sass
```

Finally install Gulp and other dependencies with:

```
npm install
```

When finished use `gulp` to start the development environment. If you just want compile for production use `gulp compile`

## License

This project is under GPL license. Look LICENSE.txt for more details. 
Videos licensed by [Patrick Ickxs](https://vimeo.com/pickxs)

## TO DO

* Change gulp-ruby-sass for PostCSS
* Make a preloader class with text messages enabled
* Make a browser minimum capabilities to allow the experience

## NOTES
Some graphic cards using Chrome's hardware accelerated graphics feature gets poor quality when scaling video. You can found more info about it [here](https://vimeo.com/forums/topic:109071)