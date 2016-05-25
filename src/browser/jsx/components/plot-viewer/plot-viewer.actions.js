
export function removeActivePlot() {
  return {type: 'REMOVE_ACTIVE_PLOT'};
}

export function focusNextPlot() {
  return {type: 'FOCUS_NEXT_PLOT'};
}

export function focusPrevPlot() {
  return {type: 'FOCUS_PREV_PLOT'};
}

export function saveActivePlot() {
  return {type: 'SAVE_ACTIVE_PLOT'};
}

export function openActivePlot() {
  return {type: 'OPEN_ACTIVE_PLOT'};
}

export function focusPlot(id) {
  return {type: 'FOCUS_PLOT', id};
}

export default {
  removeActivePlot,
  focusNextPlot,
  focusPrevPlot,
  saveActivePlot,
  openActivePlot,
  focusPlot
};
