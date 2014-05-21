module.exports = function(grunt) {

	grunt.initConfig({
		// contcatenation
		concat: {
			// javascript
			js: {
				src: [
					'src/**/*.js'
				],
				dest: 'dist/scripts.js',
			}
		},
		watch: {
			js: {
				files: ['<%= concat.js.src %>'],
				tasks: ['concat:js']
			}
		}
	});

	// loading modules
	// grunt.loadNpmTasks('grunt-contrib-concat');
	// grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadTasks(__dirname + '/../../../../node_modules/grunt-contrib-concat/tasks');
	grunt.loadTasks(__dirname + '/../../../../node_modules/grunt-contrib-watch/tasks');

	// grunt.registerTask('default', ['concat', 'less']);
	grunt.registerTask('default', ['concat', 'watch']);

}