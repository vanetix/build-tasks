/*
 * credited to - http://github.com/particlebanana
 *
 * Task: Hogan
 * Description: Pre-Compile Hogan Mustache templates
 *
 */


// Dependencies
var hogan = require('hogan.js'),
    fs = require('fs');


/*
 * Compile Hogan.js Templates
 */

task.registerBasicTask('hogan', 'Compile templates with hogan.js',
function(data, name) {
  var files = file.expand(data);
  file.write(name,
      'window.Templates = window.Templates || {};\n' +
        task.helper('hogan', files));

  // Fail task if errors were logged.
  if (task.hadErrors()) { return false; }

  // Otherwise, print a success message.
  log.writeln('File "' + name + '" created.');
});


/**
 * A helper task for running Hogan.compile
 * on template files. Based off Hogan's hulk command
 * https://github.com/twitter/hogan.js/blob/master/bin/hulk
 */

task.registerHelper('hogan', function(files, namespace) {
  var src = files ? files.map(function(filepath) {
    var openedFile = task.directive(filepath, file.read);
    if (!openedFile) return;
    var name = filepath.split('/');

    name = name[name.length - 1].replace(/.html$/i, '');
    return namespace ?
      'window.Templates.' + namespace + ' = window.Templates.' + namespace + ' || {};\n' +
      'window.Templates.' + namespace + '.' + name + ' = new Hogan.Template(' +
        hogan.compile(openedFile, { asString: 1 }) + ');'
      :
      'window.Templates.' + name + ' = new Hogan.Template(' + hogan.compile(openedFile, { asString: 1 }) + ');';
  }).filter(function(t) {
    return typeof(t) !== 'undefined' && t.length;
  }).join('\n') : '';

  return src;
});

/**
 * Remove Precompiled Templates from build path
 */

task.registerBasicTask('removeHogan', 'Remove precompiled templates', function(data, name) {
  var files = file.expand(data),
      len = files.length,
      done = this.async();

  for(var i=0; i<len; i++) {
    fs.unlink(files[i], function(err) {
      if(err) {
        log.error(err);
        done(false);
      }

      log.writeln('File "' + name + '" removed.');
      // if this is the last file call done()
      if((i+1) === len) done();
    });
  }
});
