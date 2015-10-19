// basic search for history
$('#pkg-search').on('input', function() {
  var query = $(this).val().toLowerCase();
  if (query=="") {
    $("#packages-rows tr").removeClass("hide");
  } else {
    $("#packages-rows tr").each(function(i, pkg) {
      var packageName = $("td", pkg).first().text().toLowerCase();
      if (packageName.indexOf(query) >= 0) {
        $(this).removeClass("hide");
      } else {
        $(this).addClass("hide");
      }
    });
  }
});

// basic search for packages
$('#history-search').on('input', function() {
  var query = $(this).val().toLowerCase();
  if (query=="") {
    $("#history-trail p").removeClass("hide");
  } else {
    $("#history-trail p").each(function(i, cmd) {
      var cmdText = $(cmd).text().toLowerCase();
      if (cmdText.indexOf(query) >= 0) {
        $(this).removeClass("hide");
      } else {
        $(this).addClass("hide");
      }
    });
  }
});
