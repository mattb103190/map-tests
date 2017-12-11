// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const ChromiumRevision = require('puppeteer/package.json').puppeteer.chromium_revision;
const Downloader = require('puppeteer/utils/ChromiumDownloader');
const revisionInfo = Downloader.revisionInfo(Downloader.currentPlatform(), ChromiumRevision);
process.env.CHROME_BIN = revisionInfo.executablePath;

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular/cli'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-ie-launcher'),
      require('karma-edge-launcher'),
      require('karma-safari-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-junit-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular/cli/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      reports: [ 'html', 'lcovonly' ],
      fixWebpackSourcePaths: true
    },
    angularCli: {
      environment: 'dev'
    },
    junitReporter: {
      outputDir: process.env.CIRCLE_TEST_REPORTS ? process.env.CIRCLE_TEST_REPORTS +'/junit' : '.',
      suite: 'models'
    },
    files: [
      "./src/assets/css/fonts.css",
      "node_modules/bootstrap/dist/css/bootstrap.css"
    ],
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome', 'Firefox'], // ChromeHeadless
    singleRun: false
  });
};
