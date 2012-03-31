/*
 * Adapted from
 * https://gist.github.com/1820595
 */
var path = require('path');


task.registerBasicTask("coffee", "Compile coffee files to js", function(data, name) {

  var files = file.expand(data);

  task.helper('coffee', files, path.resolve(path.dirname(data)));
});


/*
 * Compile each file from the files array
 */
task.registerHelper('coffee', function(files, dest_dir) {
  var coffee = require('coffee-script'),
      jsFiles = [];

  //Long chain to do all the things
  files.filter(function(file) {
    return file.match(/\.coffee$/) ? true : false;
  }).forEach(function(script) {

    //Compile and write each file to the dest dir or log error
    try {
      var compiled = coffee.compile(file.read(script)),
          dest = path.join(dest_dir, path.basename(script, '.coffee') + '.js');

      jsFiles.push(dest);
      file.write(dest, compiled);
    }
    catch (e) {
      log.error('Compilation error: ' + e.message);
    }

  });

  return jsFiles;
});