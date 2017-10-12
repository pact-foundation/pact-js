// Karma configuration
// Generated on Thu Nov 20 2014 14:51:15 GMT+1100 (AEDT)

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai', 'pact'],

    // list of files / patterns to load in the browser
    files: [
      // if you are using this example to setup your own project load pact from the node_modules directory
      '../../dist/pact-web.js',
      // Example Using NPM package
      // 'node_modules/pact-web/pact-web.js',
      'client.js',
      'client-spec.js'
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {},

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // Pact Providers
    pact: {
      port: 1234,
      consumer: 'Karma Mocha',
      provider: 'Hello'
    },

    // web server port
    port: 9876,

    plugins: [
      'karma-*',
      '@pact-foundation/karma-pact',
    ],

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS_without_security'],

    customLaunchers: {
      PhantomJS_without_security: {
        base: 'PhantomJS',
        flags: ['--web-security=no']
      }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  })
}
