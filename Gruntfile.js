module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    bower_concat: {
      all: {
        dest: 'bower_components/.dist/bower.js'
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['<%= bower_concat.all.dest %>', 'js/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      dist: {
        options: {
          sourceMap: true
        },
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    pages: {
      options: {
        bundleExec: true,
        config: '_config.yml',
        src: '.',
        dest: '.jekyll'
      },
      build: {}
    },
    connect: {
      server: {
        options: {
          port: 4000,
          hostname: '*',
          base: '<%= pages.options.dest %>'
        }
      }
    },
    watch: {
      options: {
        spawn: false
      },
      bower_concat: {
        files: ['bower_components/**/*.js'],
        tasks: ['bower_concat']
      },
      concat_uglify: {
        files: ['<%= concat.dist.src %>'],
        tasks: ['concat', 'uglify']
      },
      jekyll: {
        files: ['layouts/**/*', 'index.html'],
        tasks: ['pages:build']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-jekyll-pages');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['bower_concat', 'concat', 'uglify', 'pages']);
  grunt.registerTask('serve', ['connect', 'watch']);
  grunt.registerTask('default', ['build']);
};
