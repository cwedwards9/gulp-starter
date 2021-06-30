const { src, dest, series, parallel, watch } = require("gulp");
const browserSync = require('browser-sync').create();
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const imagemin = require("gulp-imagemin");
const stream = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const browserify = require("browserify");
const sourcemaps = require('gulp-sourcemaps');
const babel = require("gulp-babel");

// Initialize local server
function browsersyncServe(cb) {
    browserSync.init({
        server: {
            baseDir: "./dist",
            index: "index.html"
        }
    });
    cb();
}

// Reload page in browser
function browsersyncReload(cb) {
    browserSync.reload();
    cb();
}

// Copy html
function copyHtml() {
    return src("src/*.html")
    .pipe(dest("dist"))
}

// Allow the use of the require modules to bundle dependencies for use in the browser
// Compile js code with Babel
function bundle(){
    return browserify({
        extensions: '.js',
        entries: 'src/js/scripts.js',
        debug: true
    })
    .bundle()
    .pipe(stream('scripts.js'))
    .pipe(buffer())
    .pipe(babel({
        presets: ['env']
    }))
    .pipe(dest('dist/js'))
}

// Compile sass
function compileSass() {
    return src("src/scss/*.scss")
        .pipe(sass().on('error', sass.logError))
        .pipe(dest("src/css"))
}

// Add vendor prefixes with postcss and autoprefixer
function postCssPrefixer() {
    return src("src/css/*.css")
        .pipe(postcss([autoprefixer() ]))
        .pipe(dest("dist/css"))
}

// Minify images
function minifyImg() {
    return src("src/images/*")
        .pipe(imagemin())
        .pipe(dest("dist/imgs"))
}

// Watch task, changes in files executes tasks, reload page in browser
function watchTask() {
    watch("src/*.html", series(copyHtml, browsersyncReload));
    watch(["src/scss/*.scss", "src/js/*.js"],
        series(
            copyHtml,
            parallel(compileSass, bundle),
            postCssPrefixer,
            browsersyncReload
        )
    )
}


// Default gulp task
exports.default = series(
    copyHtml,
    parallel(compileSass, bundle, minifyImg),
    postCssPrefixer,
    browsersyncServe,
    watchTask
)