import ace from 'ace';
import $ from 'jquery';


export function focusOnEditor() {
  const id = $('#editors').find('.active .editor').attr('id');

  ace.edit(id).focus();
}

// Don't use this, use consolePane.focus()
// export function focusOnConsole() {
//   jqconsole.Focus();
// }

export function focusOnTopRight() {
  const $topRightNav = $('#top-right').find('.nav');
  let next = $topRightNav.find('.active').next();

  if (!$(next).length) {
    next = $topRightNav.find('li').first();
  }

  $('a', next).click();
}

export function focusOnBottomRight() {
  const $bottomRightNav = $('#bottom-right').find('.nav');
  let next = $bottomRightNav.find('.active').next();

  if (!$(next).length) {
    next = $bottomRightNav.find('li').first();
  }

  $('a', next).click();
}
