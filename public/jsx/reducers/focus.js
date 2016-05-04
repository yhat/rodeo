
function focusOn(selector) {
  const el = document.querySelector(selector);

  if (el) {
    // todo: how does html deal with this?  Do I need to find a form element?
    // todo: maybe I need to set panes to be focusable?
    el.focus();
  }
}

export default function (state, action) {
  switch (action.type) {
    case 'FOCUS_1': focusOn('.editor-target'); break;
    case 'FOCUS_2': focusOn('.console-pane'); break;
    case 'FOCUS_3': focusOn('.variable-pane'); break;
    case 'FOCUS_4': focusOn('.file-pane'); break;
    default: break;
  }

  // none of these actions modify visible state
  return state;
}