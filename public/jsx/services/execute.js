import $ from 'jquery';
import templates from 'templates';
import { send } from './ipc';
import * as consolePane from './console-pane';
import track from './track';

const quitCommands = [
  'reset',
  '%reset',
  '%%reset',
  'quit',
  'quit()',
  'exit',
  'exit()'
];

/**
 * @param {string} input
 */
function addInputToHistory(input) {
  const $historyTrail = $('#history-trail'),
    html = templates['history-row']({ n: 1 + $historyTrail.children().length, command: input });

  $historyTrail.append(html);
}

/**
 * @param {string} content
 */
function printHelpContent(content) {
  $('#help-content').text(content);
  $('a[href="#help"]').tab('show');
}

function scrollDown() {
  const $historyTrail = $('#history-trail'),
    $cont = $historyTrail.parent();

  $cont[0].scrollTop = $cont[0].scrollHeight;
}

/**
 * @param {boolean} [isEnabled=true]
 */
function enableInterruptButton(isEnabled) {
  const $interruptButton = $('#btn-interrupt');

  if (isEnabled !== false) {
    $interruptButton.removeClass('hide');
  } else {
    $interruptButton.addClass('hide');
  }
}

/**
 * @param {{command: string, output: string, error: string}} result
 * @returns {{command: string, output: string, error: string}}
 */
function handleCommandResults(result) {
  if (/^help[(]/.test(result.command) && result.output) {
    printHelpContent(result.output);
    return;
  }

  if (result.status === 'input' && result.stream) {
    consolePane.setPromptText(result.stream || '');
  } else if (result.status !== 'complete' && result.stream) {
    consolePane.write(result.stream || '');
  }

  if (result.error) {
    track('command', 'error');
    enableInterruptButton(false);
    consolePane.write(result.error + '\n', 'jqconsole-error');
  }

  if (result.status === 'complete') {
    enableInterruptButton(false);
    consolePane.write('\n');
    refreshVariables();
  }

  return result;
}

/**
 * @param {Error} error
 */
function handleHandlerError(error) {
  console.error(error);
}

/**
 *
 * @param {Event} e
 * @returns {boolean}
 */
function handleRunButton(e) {
  e.preventDefault();
  const editor = getActiveEditor();
  let code = editor.getSelectedText();

  // if nothing was selected, then we'll run the entire file
  if (! code) {
    code = editor.session.getValue();
  }

  consolePane.write('>>> ' + code + '\n', 'jqconsole-old-input');
  sendCommand(code).catch(handleHandlerError);
  return false;
}

function handleRunMarkdown() {
  track('command', 'markdown');

  const editor = getActiveEditor();
  let code = editor.getSelectedText();

  if (!code) {
    code = editor.session.getValue();
  }

  send('md', { doc: code }).then(function (results) {
    return renderMarkdown(templates['markdown-output']({
      renderedMarkdown: results,
      desktop: true
    }));
  }).catch(handleHandlerError);
}

// attach
$('#run-button').click(handleRunButton);
$('#run-markdown').click(handleRunMarkdown);

export function executeCommand(command, autocomplete) {
  const data = {
    command,
    autocomplete,
    stream: false
  };

  return send('command', data).then(handleCommandResults);
}

/**
 * @param {string} input
 * @returns {Promise}
 */
export function sendCommand(input) {
  if (input) {
    addInputToHistory(input);
  }

  if (input === 'push it to the limit') {
    $('#time-traveler').click();
    return;
  }

  if (/^\?/.test(input)) {
    input = 'help(' + input.slice(1) + ')';
  } else if (/(.+)\?{2}$/.test(input)) {
    input = 'help(' + /(.+)\?{2}$/.exec(input)[1] + ')';
  } else if (/(.+)\?$/.test(input)) {
    input = 'help(' + /(.+)\?$/.exec(input)[1] + ')';
  } else if (quitCommands.indexOf(input) > -1) {
    // do quit stuff...

    // todo: why do we want to allow this?  Such a weird feature.  Killing the kernel would make more sense.
    return send('quit');
  }

  scrollDown();
  enableInterruptButton();

  return send('command', {
    command: input,
    autocomplete: false,
    stream: true
  }).then(handleCommandResults);
}
