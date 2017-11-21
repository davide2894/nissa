    //require() tools
var gulp = require("gulp");
var sass = require("gulp-sass");
var useref = require("gulp-useref");
var uglify = require("gulp-uglify");
var gulpIf = require("gulp-if");
var cssnano = require("gulp-cssnano");
var imagemin = require("gulp-imagemin");
var del = require("del");
var runSequence = require("run-sequence");
var cache = require("gulp-cache");
var deploy = require("gulp-gh-pages");
var cssUrl = require("gulp-css-url-adjuster");
var rename = require("gulp-rename");
var browserSync = require("browser-sync").create();
    

//Development tasks
//-------------------
    
//compile SCSS into CSS
gulp.task("sass", function () {
    return gulp.src("app/scss/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("app/css"))
        .pipe(browserSync.reload({
            stream: true
        }));

});

//BrowserSync
gulp.task("browserSync", function () {
    browserSync.init({
        server: {
            baseDir: "app"
        }
    })
});

//load sass and inject it to the browser
//then watch any sass, html, js file
//and at each save inject new html, css, js into browser
gulp.task("watch", ["sass", "browserSync"], function () {
    gulp.watch("app/scss/**/*.scss", ["sass"]);
    gulp.watch("app/*.html", browserSync.reload);
    gulp.watch("app/js/**/*.jss", browserSync.reload);
});

//Optimization tasks
//--------------------

//Useref: minify and concatenate .js .css files
gulp.task("useref", function () {
    return gulp.src("app/*.html")
        .pipe(useref())
        //minifies .js files
        .pipe(gulpIf("*.js", uglify()))
        //minifies .css files
        .pipe(gulp.dest("dist"))
});

gulp.task("cssUrl", function () {
    gulp.src("app/css/styles.css")
        .pipe(cssUrl({
            prepend: "/dist/"
        }))
        .pipe(rename({ suffix: ".min" }))
        .pipe(gulp.dest("dist/css"));
})

//minify images
gulp.task("images", function () {
    return gulp.src("app/images/**/*")
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }]
        }))
        .pipe(gulp.dest("dist/images"));
})

// Clearing caches
gulp.task('cache:clear', function (callback) {
    return cache.clearAll(callback);
})

gulp.task("fonts", function () {
    return gulp.src("app/fonts/**/*")
        .pipe(gulp.dest("dist/fonts"))
})

//delete dist folder
gulp.task("clear", function () {
    return del.sync("dist");
})

//Build sequence
//--------------
gulp.task("default", function (callback) {
    runSequence(["sass", "browserSync", "watch"],
        callback
    )
})

//create production website
gulp.task("build", function (callback) {
    runSequence(["sass", "useref", "images", "fonts"],
        callback
    )
});

gulp.task("deploy", ["build"], function () {
    return gulp.src("dist/**/*")
        .pipe(deploy())
});
