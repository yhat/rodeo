export function showAboutRodeo() {
  return {type: 'ADD_MODAL_DIALOG', contentType: 'ABOUT_RODEO'};
}

export function showAboutStickers() {
  return {type: 'ADD_MODAL_DIALOG', contentType: 'ABOUT_STICKERS'};
}

export function showPreferences() {
  return {type: 'ADD_MODAL_DIALOG', contentType: 'PREFERENCES'};
}

export function showAcknowledgements() {
  return {type: 'ADD_MODAL_DIALOG', contentType: 'ACKNOWLEDGEMENTS'};
}

export function showNotification(content) {
  return {type: 'ADD_MODAL_DIALOG', contentType: 'MARKED', title: 'Notification', content};
}

export default {
  showAboutRodeo,
  showAboutStickers,
  showAcknowledgements,
  showPreferences,
  showNotification
};
