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

task.registerHelper('config', function(settings) {
  var config = '';

  Object.keys(settings).forEach(function(key) {
    if(settings[key].constructor === Object) {
      config += 'window.Config.' + key + ' = {' +
      Object.keys(settings[key]).reduce(function(prev, cur) {
        if(prev !== '') prev += ', ';
        return prev += '"' + cur + '": ' + '"' + settings[key][cur] + '"';
      }, '') + '};\n';
    }
    else if(settings[key].constructor === Array) {
      config += 'window.Config.' + key + ' = [' +
          settings[key].reduce(function(prev, cur) {
            if(prev !== '') prev += ', ';
            return prev += '"' + cur + '"';
          }, '') + '];\n';
    }
    else if(settings[key].constructor === Number) {
      config += 'window.Config.' + key + ' = ' + settings[key] + ';\n';
    }
    else {
      config += 'window.Config.' + key + ' = "' + settings[key] + '";\n';
    }
  });

  return config;
});