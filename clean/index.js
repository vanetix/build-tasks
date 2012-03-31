/*
 * Adapted from
 * https://github.com/tbranyen/build-tasks/blob/master/clean/index.js
 */
var rimraf = require("rimraf");


task.registerBasicTask("clean", "Deletes out all contents in a directory", function(data, name) {
  var files = file.expand(data);

  files.forEach(function(file) {
    task.helper("clean", file);
  });

  return task.hadErrors() ? false : true;
});


task.registerHelper("clean", function(path) {
  log.writeln('Removing: ' + path);
  rimraf.sync(path);
});