module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    bower_concat: {
      all: {
        dest: 'grunt_dist/bower.js'
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['grunt_dist/bower.js', 'js/**/*.js'],
        dest: 'grunt_dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      dist: {
        files: {
          'grunt_dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-bower-concat');

  grunt.registerTask('default', ['bower_concat', 'concat', 'uglify']);

};
