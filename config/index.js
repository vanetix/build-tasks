/*
 * Task: Config
 * Description: Attach config settings to a window object
 *
 */

/*
 * Write config settings to script in HTML and attach
 * to a global window object
 */

var fs = require('fs'),
    path = require('path');

task.registerBasicTask('config', 'Attach config settings to window object',
function(data, name) {

  var filePath = path.resolve(data),
      configFile = file.read(filePath),
      settings = JSON.parse(configFile);

  file.write(name,
    'window.Config = window.Config || {};\n'+
    task.helper('config', settings));


  // Fail task if errors were logged.
  if (task.hadErrors()) { return false; }

  // Otherwise, print a success message.
  log.writeln('File "' + name + '" created.');
});

/**
 * A helper task for looping through config settings and
 * building a string to be written to a file
 */

task.registerHelper('config', function(settings, namespace) {
  var config = '';

  for (var key in settings) {
    var obj = settings[key];
    config += 'window.Config.' + key + '=' + '"'+ obj + '";\n';
  }

  return config;
});
