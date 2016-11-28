/**
 * @module
 */

import Eventify from 'eventify';

const observer = {};

Eventify.enable(observer);

/**
 * Triggers when something in the window resizes, possibly requiring others to resize around them.
 *
 * Other things that resize should trigger this observer event as well
 */
function triggerOnResize() {
  window.addEventListener('focus', () =>  observer.trigger('resize'));
  window.addEventListener('resize', () => observer.trigger('resize'));
}

triggerOnResize();

export default observer;
