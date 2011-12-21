var fs = require('fs');

if (process.env['npm_config_loglevel'] != 'silent')
{
  console.log('Thanks for installing Yeti v' + process.env['npm_package_version']);
  console.log('Recently added to HISTORY.md:')
  console.log(fs.readFileSync('HISTORY.md').toString().split('\n').slice(0, 20).join('\n'));
}

