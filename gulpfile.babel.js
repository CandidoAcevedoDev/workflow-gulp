// Configuracion bascia para correr babel.
import gulp, { src } from 'gulp';
import babel from 'gulp-babel'
import terser from 'gulp-terser';
import concat from 'gulp-concat';

// PUG
import pug from 'gulp-pug';

// Sass
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';
const purgecss = require('gulp-purgecss')

//Cache bust - Limpiar el cache de la web
import cacheBust from 'gulp-cache-bust'

//Optimizar imagenes
import imageMin from 'gulp-imagemin';

//Browser sync
import {init as server, stream, reload} from 'browser-sync';

//guk Plumber por si algo falla no se caiga la aplicacion
import plumber from 'gulp-plumber';

// Variables and constantes
const cssPlugins = [cssnano(), autoprefixer()];
const production = false;

gulp.task('views', () => {
    return gulp
        .src('./src/views/*.pug')
        .pipe(pug({
            pretty: production ? false : true
        }))
        .pipe(cacheBust({
            type: 'timestamp'
        }))
        .pipe(gulp.dest('./public'))
});

gulp.task('sass', () => {
    return gulp
        .src('./src/scss/styles.scss')
        .pipe(plumber())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(concat('styles-min.css'))
        .pipe(postcss(cssPlugins))
        .pipe(gulp.dest('./public/css'))
        .pipe(stream())
})

gulp.task('babel', () => {
    return gulp
        .src('./src/js/*.js')
        .pipe(plumber())
        .pipe(concat('scripts-min.js'))
        .pipe(babel())
        .pipe(terser())
        .pipe(gulp.dest('./public/js'))
});

gulp.task('purgecss', () => {
    return gulp.src('./public/css/styles.css')
        .pipe(plumber())
        .pipe(purgecss({
            content: ['./public/*.html']
        }))
        .pipe(gulp.dest('./public/css'))
})

gulp.task('imgmin', () => {
    return gulp
        .src('./src/images/*')
        .pipe(plumber())
        .pipe(imageMin([
            imageMin.gifsicle({ interlaced: true }),
            imageMin.mozjpeg({ quality: 30, progressive: true }),
            imageMin.optipng({ optimizationLevel: 1 })
        ]))
        .pipe(gulp.dest('./public/images'))
})

gulp.task('default', () => {
    server({
        server: './public'
    })
    gulp.watch('./src/views/**/*.pug', gulp.series('views')).on('change', reload);
    gulp.watch('./src/scss/**/*.scss', gulp.series('sass'));
    gulp.watch('./src/js/*.js', gulp.series('babel')).on('change', reload);
})