/**
 * Performance grouping
 */

let events = [];

function action(action) {

}

function mark(componentInstance, eventName, props) {
  events.push([componentInstance.constructor.displayName, eventName, props]);
}

function report() {
  const tempEvents = events;

  events = [];

  console.groupCollapsed('performance');
  for (let i = 0; i < tempEvents.length; i++) {
    console.log.apply(console, tempEvents[i]);
  }
  console.groupEnd();
}

export default {
  mark,
  report
};
