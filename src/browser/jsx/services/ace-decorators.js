export function apply(instance) {
  /**
   * @type EditSession
   */
  const editSession = instance.getSession();

  editSession.on('changeFold', function () {
    // editSession.addDynamicMarker(Object marker, Boolean inFront)
    // addMarker(Range range, String clazz, Function | String type, Boolean inFront)  Number
    // removeMarker(Number markerId)

    // addGutterDecoration(Number row, String className)
    // removeGutterDecoration(Number row, String className)
  });

  instance.on('paste', function (e) {
    console.log('paste', e);
    // change text before it is copied in
  });
}
