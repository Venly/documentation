import gulp from 'gulp';
// Load all gulp plugins automatically
// and attach them to the `plugins` object
// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
import watch from 'gulp-watch';
import grunt from 'grunt';
import npmDist from 'gulp-npm-dist';
import rename from 'gulp-rename';
import sass from 'gulp-sass';
import compass from 'compass-importer';
import runSequence from 'run-sequence';
import del from 'del';

import pkg from './package.json';


const dirs = pkg['configs'].directories;


gulp.task('gulp-assemble', function(done) {
    // GRUNT TASKS
    grunt.initConfig({
        assemble: {
            options: {
                partials: [`${dirs.src}/partials/**/*.hbs`],
                flatten: true,
                assets: `dist/assets`,
            },
            pages: {
                options: {
                    layout: `${dirs.src}/layouts/default.hbs`,
                },
                files: {
                    'dist/': [`${dirs.src}/*.hbs`],
                    'dist/pages/': [`${dirs.src}/pages/**/*.hbs`]
                }
            },
            ascii: {
                options: {
                    layout: `${dirs.src}/layouts/ascii.hbs`,
                },
                files: {
                    'dist/pages/': [`${dirs.src}/pages/ascii/*.hbs`]
                }
            }
        },
        clean: {
            all: [`${dirs.dist}/**/*.html`, `${dirs.dist}/**/*.hbs`]
        }
    });
    grunt.loadNpmTasks('grunt-assemble');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.tasks(
        ['clean', 'assemble'],
        {gruntfile: 'gulpfile.babel.js'},
        function() {
            gulp.start(
                'copy:pageImg'
            );
            done();
        }
    );
});


// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('clean', (done) => {
    del([
        dirs.dist
    ]).then(() => {
        done();
    });
});

gulp.task('sass', function() {
    const themeSrc = `${dirs.src}/assets/_theme`;
    gulp.src(`${themeSrc}/sass/*`)
        .pipe(sass({importer: compass}).on('error', sass.logError))
        .pipe(gulp.dest(`${dirs.dist}/assets/css`));
});

gulp.task('copy', [
    'copy:misc',
    'copy:libs',
]);

gulp.task('copy:pageImg', () => {
    gulp.src([
        // Copy all files
        `${dirs.src}/**/img/*`
    ], {
        // Include hidden files by default
        dot: true,
        base: `${dirs.src}/pages/img`
    }).pipe(gulp.dest(`${dirs.dist}/pages/img`));
});

gulp.task('copy:misc', () => {
    gulp.src([
        // Copy all files
        `${dirs.src}/*.*`,
        `${dirs.src}/assets/js/*`,
        `${dirs.src}/assets/vendors/**/*`,
        `${dirs.src}/assets/img/*`,
    ], {
        // Include hidden files by default
        dot: true,
        base: `${dirs.src}`
    }).pipe(gulp.dest(dirs.dist))
});


// Copy dependencies to ./public/libs/
gulp.task('copy:libs', function() {
    gulp.src(npmDist(), {base: './node_modules/'})
        .pipe(rename(function(path) {
            path.dirname = path.dirname.replace(/\/dist/, '').replace(/\\dist/, '');
        }))
        .pipe(gulp.dest(`${dirs.dist}/assets/vendors`));
});


gulp.task('startWatch', function() {
    gulp.watch(`${dirs.src}/assets/_theme/**/*.s*ss`, ['sass']);
    gulp.watch(`${dirs.src}/assets/**/*.js`, ['copy:misc']);
    gulp.watch(`${dirs.src}/**/*.hbs`, ['gulp-assemble']);
});

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('build', (done) => {
    runSequence(
        ['clean'],
        'sass',
        'copy',
        done
    );
});

gulp.task('default', ['build']);

gulp.task('watch', ['startWatch']);
