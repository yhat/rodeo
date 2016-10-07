function openActivePlot() {
  return {type: 'OPEN_ACTIVE_PLOT'};
}

function focus(plot) {
  return {type: 'FOCUS_PLOT', plot};
}

function remove(plot) {
  return {type: 'REMOVE_PLOT', plot};
}

export default {
  focus,
  remove,
  openActivePlot
};
