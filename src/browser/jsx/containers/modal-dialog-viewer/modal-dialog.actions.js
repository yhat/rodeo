export function add(contentType, title, content) {
  return {type: 'ADD_MODAL_DIALOG', contentType, title, content};
}

export function ok(id, result) {
  return {type: 'OK_MODAL_DIALOG', id, result};
}

export function cancel(id) {
  return {type: 'CANCEL_MODAL_DIALOG', id};
}

export function cancelAll() {
  return {type: 'CANCEL_ALL_MODAL_DIALOGS'};
}

export default {
  add,
  ok,
  cancel,
  cancelAll
};
