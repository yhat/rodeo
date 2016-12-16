function add(contentType) {
  return {type: 'ADD_MODAL_DIALOG', payload: {contentType}, meta: {sender: 'self', track: true}};
}

function ok(id, result) {
  return {type: 'OK_MODAL_DIALOG', payload: {id, result}, meta: {sender: 'self'}};
}

function cancel(id) {
  return {type: 'CANCEL_MODAL_DIALOG', payload: {id}, meta: {sender: 'self'}};
}

function cancelAll() {
  return {type: 'CANCEL_ALL_MODAL_DIALOGS', meta: {sender: 'self'}};
}

export default {
  add,
  ok,
  cancel,
  cancelAll
};
