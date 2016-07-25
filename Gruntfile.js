module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  var path = require('path');
  const os = require("os");

  /**
   * Resolve external project resource as file path
   */
  function resolvePath(project, file) {
    console.log(project,file)
    return path.join(path.dirname(require.resolve(project)), file);
  }
  grunt.loadNpmTasks('grunt-bell');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-shell-spawn');

  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    notify: {
      watch: {
        options: {
          title: 'Task Complete',  // optional
          message: 'build complete', //required
        }
      }
    },
    shell: {
    electron: {
        command: 'electron .',
        options: {
            async: true,
            execOptions: {
                cwd: './'
           }
       }
    }
  },

    babel: {
        options: {
            presets: ['es2015',"stage-0"],
            "plugins": ["transform-async-to-generator"],
            sourceType: "module"
        },
        dist: {

            files: {
              "dist/lib/es6.js":["app/lib/es6/**.js"]

            }
        }
    },
    express: {
    dev: {
      options: {
        script: 'server.js'
      }
    },
    prod: {
      options: {
        script: 'server.js',
        node_env: 'production'
      }
    }
  },
    notify_hooks: {
    options: {
      enabled: true,
      max_jshint_notifications: 1, // maximum number of notifications from jshint output
      title: "BPMN", // defaults to the name in package.json, or will use project directory's name
      success: true, // whether successful grunt executions should be notified automatically
      duration:0.25
    }
  },
    config: {
      sources: 'app',
      dist: 'dist'
    },

    jshint: {
      src: [
        ['<%=config.sources %>']
      ],
      options: {
        jshintrc: true
      }
    },

    browserify: {
      options: {
        browserifyOptions: {
          debug: true,
          insertGlobalVars: []
        },
        transform:  ["babelify"]
      },
      watch: {
        options: {
          watch: true
        },
        files: {
           '<%= config.dist %>/index.js': [ '<%= config.sources %>/**/**/*.js'],

        },
        tasks:["broswerify:app"]
      },
      app: {
        files: {
          '<%= config.dist %>/index.js': [ '<%= config.sources %>/**/**/*.js']
        }
      }
    },
    copy: {
      electron: {
        files: [
          {
            src: '../index.js',
            dest: '<%= config.dist %>/electron.js'
          }
        ]
      },
      diagram_js: {
        files: [
          {
            src: 'diagram-js/assets/diagram-js.css',
            dest: '<%= config.dist %>/css/diagram-js.css'
          }
        ]
      },
      material:{
        files: [
          {
            src: 'node_modules/bootstrap-material-design/dist/js/material.js',
            dest: '<%= config.dist %>/js/material.js'
          },
          {
            src: 'node_modules/bootstrap-material-design/dist/js/ripples.js',
            dest: '<%= config.dist %>/js/ripples.js'
          },
          {expand: true,
            flatten: true,
            cwd: "styles",
            src: "**",
            dest: 'dist/css/'
          },
          {expand: true,
            flatten: true,
            cwd: "scripts",
            src: "**",
            dest: 'dist/scripts/'
          }
        ]
      },
      bpmn_js: {
        files: [
          {
            expand: true,
            cwd: 'bpmn-js/assets',
            src: ['**/*.*', '!**/*.js'],
            dest: '<%= config.dist %>/vendor'
          }
        ]
      },
      app: {
        files: [
          {
            expand: true,
            cwd: 'app/',
            src: ['**/**/*.*'],
            dest: '<%= config.dist %>'
          }
        ]
      }
    },

    less: {
      options: {
        dumpLineNumbers: 'comments',
        paths: [
          'node_modules'
        ]
      },

      styles: {
        files: {
          'dist/css/app.css': 'styles/app.less',
          'dist/css/bootstrap.css':'node_modules/bootstrap/less/bootstrap.less',
          'dist/css/material.css':'node_modules/bootstrap-material-design/less/bootstrap-material-design.less',
          'dist/css/ripples.css':'node_modules/bootstrap-material-design/less/ripples.less'
        }
      }
    },

    watch: {
      express: {
     files:  [ 'server.js' ],
     tasks:  [ 'express:dev' ]
  },
     samples: {
 files: [ 'app/**/*.*' ],
 tasks: [ 'copy:app' ]
      },
      electron: {
     files:  [ 'index.js' ],
     options: {
       spawn: false // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions. Without this option specified express won't be reloaded
     }},


      less: {
        files: [
          'styles/**/*.less',
          'bpmn-js-properties-panel/styles/**/*.less'
        ],
        tasks: [
          'less','reload'
        ],
        options: {
    }
      }


    },
    exec: {
  electron: {
    cmd: function (){
      return `electron .`
    }
  }
},
connect: {
  port:9013,
      livereload: {
        options: {
          livereload: 30038,
          open: true,
          base: [
            '<%= config.dist %>'
          ]
        }
      }
    },
    'electron-packager': {
      build: {
        options:{
          platform  : os.platform(),
          arch      : os.arch(),
          dir       : './app',
          out       : './build',
          icon      : './build/app/recursos/icon',
          name      : 'Bpmn',
          ignore    : 'bower.json',
          version   : '0.36.7', // set version of electron
          overwrite : true
        }
      },
      buildCustom: {
        options: function (name,platform,arch) {
          return {
            platform ,
            arch,
            dir       : './test/app',
            out       : './test/build',
            icon      : './test/app/recursos/icon',
            name,
            ignore    : 'bower.json',
            overwrite : true
          }
        }
      }

    }

  });

  // tasks
  grunt.registerTask('server', [ 'express:dev' ])
  grunt.registerTask('build', [ 'copy', 'less',
     'browserify' ]);

  grunt.registerTask('auto-build', [
    'copy',
    'less',
    'server',
    'browserify:app',
    'start',
    // 'watch',
    'notify_hooks'
    ]);

  grunt.registerTask('hasfailed', function() {
    console.log(grunt.fail.warncount)
  if (grunt.fail.warncount > 0) {
    grunt.log.write('\x07'); // beep!
    return false; // stops the task run
  }




  // This is required if you use any options.
  // otherwise continue the task run as normal
});
grunt.registerTask("pack",function (){
  const builder = require("electron-builder")
const Platform = builder.Platform

// Promise is returned
builder.build({
  targets: Platform.MAC.createTarget(),
  devMetadata: {
    "build": {
  "appId": "BPMN",
  "app-category-type": "your.app.category.type",
  "win": {
    "iconUrl": "(windows-only) https link to icon"
  }
}
  }
})
  .then(() => {
    // handle result
  })
  .catch((error) => {
    // handle error
  })
})

let electron = require('electron-connect').server.create();

grunt.registerTask("start",function (){
  electron.start();
})
grunt.registerTask("reload",function (){
  // electron.restart();
})



  grunt.registerTask('default', [ 'jshint','notify_hooks','server', 'build' ]);
};
