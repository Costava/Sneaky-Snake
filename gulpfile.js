var gulp = require('gulp');
var runSequence = require('run-sequence');

var del = require('del');

var browserify = require('browserify');
var transform = require('vinyl-transform');

var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// Default Task
gulp.task('default', function(callback) {
	runSequence(
		['build-clean'],
		['move-html', 'move-css', 'move-images', 'move-stuff', 'browserify-bundle'],
		callback
	);
});

// Clears the distribution folder before running the other tasks
gulp.task('build-clean', function(done) {
	del(['./dist'], done);
});

gulp.task('move-html', function() {
	gulp.src(['./src/index.html'])
		.pipe(gulp.dest('./dist'));
});

gulp.task('move-css', function() {
	gulp.src(['./src/styles/style.css'])
		.pipe(gulp.dest('./dist/styles'));
});

gulp.task('move-images', function() {
	gulp.src(['./src/img/**/*'])
		.pipe(gulp.dest('./dist/img'));
});

gulp.task('move-stuff', function() {
	gulp.src(['./src/manifest.webapp'])
		.pipe(gulp.dest('./dist'));
});

gulp.task('browserify-bundle', function() {
	// transform regular node stream to gulp (buffered vinyl) stream
	var browserified = transform(function(filename) {
		var b = browserify(filename);
		return b.bundle();
	});

	return gulp.src('./src/scripts/main.js')
		.pipe(browserified)
		.pipe(uglify())
		.pipe(rename({
			basename: 'bundle'
		}))
		.pipe(gulp.dest('./dist/js'));
})
