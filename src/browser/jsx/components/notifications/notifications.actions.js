export function add(contentType, title, content) {
  return {type: 'ADD_NOTIFICATION', contentType, title, content};
}

export function close(notification) {
  return {type: 'CLOSE_NOTIFICATION', notification};
}

export function closeAll() {
  return {type: 'CLOSE_ALL_NOTIFICATIONS'};
}

export default {
  add,
  close,
  closeAll
};
