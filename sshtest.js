var Client = require('ssh2').Client;

var conn = new Client();
conn.on('keyboard-interactive', function(name, instructions, instructionsLang, prompts, finish) {
  finish(['texas1845']);
}).on('error', function(err) {
  console.log(err);
}).on('ready', function() {
  console.log('Client :: ready');
}).connect({
  host: 'localhost',
  port: 22,
  username: 'glamp',
  tryKeyboard: true
});
