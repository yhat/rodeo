// setup the shortcut display modal here. we're using a handlebars
// template here are a partial (the shortcuts table is really big).
// this keeps this file a lot cleaner.
$("#shortcut-display-modal #shortcuts").append(shortcuts_template())

$("#shortcut-search").on('input', function() {
  var query = $(this).val().toLowerCase();
  if (query=="") {
    $("#shortcuts tr .hide").removeClass("hide");
  } else {
    $("#shortcut-rows tr").each(function(i, shortcut) {
      var text = [];
      $("td", shortcut).map(function(i, el) {
        text.push($(el).text());
      });
      text = text.join("-").toLowerCase();
      if (text.indexOf(query) > -1) {
        $(this).removeClass("hide");
      } else {
        $(this).addClass("hide");
      }
    });
  }
});
