import gulp from 'gulp';
import runSequence from 'run-sequence';

gulp.task('build', () => {
    runSequence(
        'styles'
    );
});
