'use strict';

const gulp = require('gulp');
const gulpCopy = require('gulp-copy');
const replace = require('gulp-replace-task');
const args = require('yargs').argv;
const del = require('del');
const babel = require('gulp-babel');
const ngAnnotate = require('gulp-ng-annotate');

gulp.task('clean', () => del([ `dist/**` ]));

gulp.task('build', [ "clean" ], () => {
  const replaceSettings = require('./config/config.json'); 
  
  if (args.apiUrl) {
      replaceSettings.API_URL = args.apiUrl;
  } 

  const patterns = Object.keys(replaceSettings).map(match => {
    const replacement = replaceSettings[match];

    return { match, replacement };
  });

  const src = gulp
   .src([ 'src/**' ],
     { base: './src' })
    .pipe(replace({
      patterns: patterns
    }))
    .pipe(ngAnnotate())
    .pipe(babel({
        presets: [ 'es2015' ]
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', [ 'build' ]);