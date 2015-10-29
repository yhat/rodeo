// For modifier keys you can use shift, ctrl, alt, or meta.

// You can substitute option for alt and command for meta.

// Other special keys are:
//  backspace, tab, enter, return, capslock, esc, escape, space, pageup,
//  pagedown, end, home, left, up, right, down, ins, del, and plus.

Mousetrap.bind(['command+o', 'ctrl+o'], function(e) {
  $('#file-upload-trigger').click();
  return false;
});

Mousetrap.bind(['command+shift+left', 'ctrl+shift+left'], function(e) {
  shiftEditorLeft();
  return false;
});

Mousetrap.bind(['command+shift+right', 'ctrl+shift+right'], function(e) {
  shiftEditorRight();
  return false;
});

Mousetrap.bind(['command+shift+1', 'ctrl+shift+1'], function(e) {
  focusOnEditor();
});

Mousetrap.bind(['command+shift+2', 'ctrl+shift+2'], function(e) {
  focusOnConsole();
});

Mousetrap.bind(['command+shift+3', 'ctrl+shift+3'], function(e) {
  focusOnTopRight();
});

Mousetrap.bind(['command+shift+4', 'ctrl+shift+4'], function(e) {
  focusOnBottomRight();
});

Mousetrap.bind(['ctrl+opt+1'], function(e) {
  runLastCommand();
});

Mousetrap.bind(['ctrl+opt+2'], function(e) {
  run2ndToLastCommand();
});

Mousetrap.bind(['ctrl-option-shift-n'], function(e) {
  $("#add-tab").click();
})
