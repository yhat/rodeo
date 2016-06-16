import ace from 'ace';

function applyLogging(instance) {
  /**
   * @type EditSession
   */
  const editSession = instance.getSession(),
    selection = editSession.getSelection();

  /**
   * @typedef {object} AcePosition
   * @property {number} column
   * @property {number} row
   */

  /**
   * @param event
   * @param {'insert'} event.action
   * @param {AcePosition} event.end
   * @param {AcePosition} event.start
   * @param {[string]} event.lines
   */
  editSession.on('change', function (event, session) {
    console.log('change', event, session);
  });

  editSession.on('changeAnnotation', function () {
    console.log('changeAnnotation', arguments);
  });

  editSession.on('changeBackMarker', function (event, session) {
    // NOTE: the event can be undefined, it seems
    console.log('changeBackMarker', event, session);
  });

  editSession.on('changeFrontMarker', function () {
    console.log('changeAnnotation', arguments);
  });

  editSession.on('changeBreakpoint', function () {
    console.log('changeBreakpoint', arguments);
  });

  editSession.on('changeFold', function () {
    console.log('changeFold', arguments);
  });

  editSession.on('changeMode', function () {
    console.log('changeMode', arguments);
  });

  editSession.on('tokenizerUpdate', function () {
    console.log('tokenizerUpdate', arguments);
  });

  editSession.on('changeFold', function () {
    // editSession.addDynamicMarker(Object marker, Boolean inFront)
    // addMarker(Range range, String clazz, Function | String type, Boolean inFront)  Number
    // removeMarker(Number markerId)

    // addGutterDecoration(Number row, String className)
    // removeGutterDecoration(Number row, String className)
  });

  /**
   * @param {object} event
   * @param {'changeCursor'} event.type
   */
  selection.on('changeCursor', function (event, session) {
    console.log('changeCursor', event, session);
  });

  /**
   * @param {object} event
   * @param {'changeSelection'} event.type
   */
  selection.on('changeSelection', function (event, selection) {
    console.log('changeSelection', event, selection);
  });

  instance.on('paste', function (e) {
    console.log('paste', e);
  });
}

function applyLineRunner(instance) {
  /** @type EditSession */
  const editSession = instance.getSession(),
    Range = ace.require('ace/range').Range;

  editSession.addDynamicMarker({
    className: 'line-runner-decorator',

    /**
     * @param {[string]} html
     * @param {object} markerLayer
     * @param {EditSession} session
     * @param {*} config
     * @see https://github.com/ajaxorg/ace/blob/master/lib/ace/layer/marker.js
     */
    update: function (html, markerLayer, session, config) {
      /** @type {AcePosition} */
      const cursor = session.getSelection().getCursor();

      markerLayer.drawFullLineMarker(html, new Range(Math.max(cursor.row - 1, 0), Math.max(cursor.column - 1, 0), cursor.row, cursor.column), this.className, config);
    }
  }, false);
}

export default {
  applyLogging,
  applyLineRunner
};
