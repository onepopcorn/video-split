'use strict';
var del        = require('del'),
	gulp       = require('gulp'),
	babel      = require('babelify'),
	sass       = require('gulp-ruby-sass'),
	browserify = require('gulp-browatchify'),
	source     = require('vinyl-source-stream'),
	uglify     = require('uglifyify'),
	sync       = require('browser-sync');

/* Paths */
var paths = {
	source: {
		html: './src/index.html',
		js: './src/js/main.js',
		css: './src/scss/',
		images: ['./src/images/**/*.png','./src/images/**/*.jpg','./src/images/**/*.gif']
	},
	dest : {
		html: './bin',
		js: './bin/js',
		css: './bin/css',
		images: './bin/images'
	}
}

/* Cleaning tasks */
gulp.task('clean-html',function(){
	return del(paths.dest.html + '/*.html');
});

gulp.task('clean-images',function(){
	return del([paths.dest.images + '/**/*.png',paths.dest.images + '/**/*.jpg',paths.dest.images + '/**/*.gif']);
});


/* Build tasks */
gulp.task('html',['clean-html'],function(){
	return gulp.src(paths.source.html)
		   .pipe(gulp.dest(paths.dest.html))
		   .on('end',function(){sync.reload()});
});

gulp.task('js',function(){
	return gulp.src(paths.source.js)
		   .pipe(browserify({experimental:true,debug:false,transforms:[babel,uglify]}))
		   .on('error',function(err){console.log(err)})
		   .pipe(source('bundle.js'))
		   // .pipe(uglify({mangle:false}))
		   .pipe(gulp.dest(paths.dest.js))
		   .on('end',function(){sync.reload()});
});

gulp.task('styles',function(){
	return sass(paths.source.css + "/styles.scss",{
		style:'compressed',
		compass: false})
		.pipe(gulp.dest(paths.dest.css))
		.on('end',function(){sync.reload('styles.css')});
});

gulp.task('images',['clean-images'],function(){
	return gulp.src(paths.source.images)
		   .pipe(gulp.dest(paths.dest.images))
		   .on('end',function(){sync.reload()});
});

/* Watch tasks */
gulp.task('watch',function(){
	gulp.watch('./src/js/**/*.js',['js']);
	gulp.watch(paths.source.images,['images']);
	gulp.watch(paths.source.html,['html']);
	gulp.watch(paths.source.css + '/**/*.scss',['styles']);
});


gulp.task('server',function(){
	sync({
		server:{
			baseDir:'./bin'
		},
		browser: "firefox"
		// proxy:"http://videosplit.test"
	})
});

gulp.task('assets',['images']); // You may add your svg or data related tasks here
gulp.task('compile',['html','js','styles','assets']);
gulp.task('run',['compile','watch']);
gulp.task('default',['run','server']);