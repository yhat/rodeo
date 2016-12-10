function add(contentType) {
  return {type: 'ADD_MODAL_DIALOG', payload: {contentType}};
}

function ok(id, result) {
  return {type: 'OK_MODAL_DIALOG', payload: {id, result}};
}

function cancel(id) {
  return {type: 'CANCEL_MODAL_DIALOG', payload: {id}};
}

function cancelAll() {
  return {type: 'CANCEL_ALL_MODAL_DIALOGS'};
}

export default {
  add,
  ok,
  cancel,
  cancelAll
};
