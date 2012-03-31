var fs = require('fs'),
    path = require('path');


task.registerBasicTask('modules', 'Compile modules modules/build/', function(data, name) {
  var modules,
      moduleDir = path.resolve(data),
      cacheDir = path.join(moduleDir, 'tmp-build/'),
      buildDir = path.resolve(config('buildDir') + '/modules');

  //Requires config('buildDir')
  config.requires('buildDir');

  /*
   * Iterate over every module directory with the exception of
   * tmp-build
   */
  modules = fs.readdirSync(moduleDir).map(function(folder) {
    return path.join(moduleDir, folder);
  }).filter(function(thing) {
    return fs.statSync(thing).isDirectory() &&
            path.basename(thing) != 'tmp-build';
  });

  /*
   * Build each module
   */
  modules.forEach(function(module) {
    task.helper('modules', module);
  });

  //Error check on module builds
  if(task.hadErrors()) {
    return false;
  }

  /*
   * Concat style/source/templates to build_dir/modules/ *.js/style.css/templates.js
   */
  var sources = file.expand(cacheDir + '/*.js'),
      templates = file.expand(cacheDir + '/*.hogan'),
      styles = file.expand(cacheDir + '/*.css');

  /*
   * Build js source files into one file and attach to window.modules
   */
  var jsSource = 'window.modules = window.modules || {};\n\n';
  jsSource += sources.map(function(thing) {
    return 'window.modules.' + path.basename(thing, '.js') +
              ' = ' + file.read(thing);
  }).join('\n').replace(/\n$/, '');
  file.write(buildDir + '/module-main.js', jsSource);

  /*
   * Build templates into one files and attach to window.Templates
   */
  var templateSource = 'window.Templates = window.Templates || {};\n\n';
  templateSource += templates.map(function(thing) {
    return file.read(thing);
  }).join('\n').replace(/\n$/, '');
  file.write(buildDir + '/module-templates.js', templateSource);

  /*
   * Concat css to [buildDir]/module-styles.css
   */
  file.write(buildDir + '/module-styles.css', task.helper('concat', styles));

  //Clean up cacheDir
  task.helper('clean-modules');
  //Return from task
  return task.hadErrors() ? false : true;
});


/*
 * Helper that compiles the specified module
 */
task.registerHelper('modules', function(modulePath) {
  var source = path.join(modulePath, 'main.coffee'),
      style = path.join(modulePath, 'style.css'),
      templates = file.expand(modulePath + '/templates/*.html'),
      cacheDir = path.join(modulePath, '../tmp-build'),
      moduleName = path.basename(modulePath);

  /*
   * Build source scripts
   */
  if(path.existsSync(source)) {
    //Compile coffee-script
    source = task.helper('coffee', [ source ], cacheDir)[0];

    //Ensure coffee-script compiled
    if(!source) {
      log.error('Coffeescript did not compile for - ' + modulePath);
      return false;
    }

    //Rename the compiled file to [moduleName].js
    fs.renameSync(source, path.join(path.dirname(source), moduleName) + '.js');
  }
  else {
    source = path.join(modulePath, 'main.js');

    if(path.existsSync(source)) {
      //Copy js
      file.copy(source, path.join(cacheDir, 'main.js'));

      //Rename the compiled file to [moduleName].js
      fs.renameSync(path.join(cacheDir, 'main.js'), path.join(cacheDir, moduleName) + '.js');
    }
    else {
      log.error('No sources found in - ' + modulePath);
    }
  }

  /*
   * Build templates
   */
  if(templates && templates.length) {
    //Compile templates
    file.write(path.join(cacheDir, moduleName) + '.hogan', task.helper('hogan', templates, moduleName));
  }

  /*
   * Build CSS
   */
  if(path.existsSync(style)) {
    file.write(path.join(cacheDir, moduleName) + '.css', task.helper('mincss', [ style ]));
  }

  return true;
});


/*
 * Cleans up the build directory under the modules
 * directory.
 * Requires the clean task to the present, and modules
 */
task.registerHelper('clean-modules', function() {
  var dir = path.resolve(config('modules').folder + '/tmp-build');

  if(!dir) {
    log.error('clean-modules directory is undefined, this could be bad.');
  }
  else {
    task.helper('clean', dir);
  }
});