var fs = require('fs');

function activatePlot(plotid) {
  $("#plots .active").removeClass("active").addClass("hide");
  $("#plots-minimap .active").removeClass("active");
  $("#plots [data-plot-id='" + plotid + "']").removeClass("hide").addClass("active");
  $("#plots-minimap [data-plot-id='" + plotid + "']").addClass("active");
}

function showPlot() {
  if (! $("#plots img.active").length) {
    return;
  }
  var filename = $("#plots img.active").attr("src");
  var params = {toolbar: false, resizable: false, show: true, height: 1000, width: 1000};
  var plotWindow = new BrowserWindow(params);
  plotWindow.loadUrl(filename);
}

function savePlot() {
  if (! $("img.active").length) {
    return;
  }
  remote.require('dialog').showSaveDialog({
    title:'Export Plot',
    default_path: USER_WD,
  }, function(destfile) {
    if (! destfile) {
      return
    }
    // get rid of inline business
    var img = $("img.active").attr("src").replace("data:image/png;charset=utf-8;base64,", "");
    fs.writeFile(destfile, img, 'base64', function(err) {
      if (err) {
        return console.error(err);
      }
    });
  });
}

function addPlot(result) {
  if (result.image) {
    var plotImage = "data:image/png;charset=utf-8;base64," + result.image;
    $("#plots-minimap .active").removeClass("active");
    $("#plots .active").removeClass("active").addClass("hide");
    var newplot = $.parseHTML('<img class="active" style="max-height: 100%; max-width: 100%;" />');
    var plotid = uuid.v4().toString();
    $(newplot).attr("data-plot-id", plotid);
    $(newplot).attr("src", plotImage);
    $(newplot).attr("onclick", "activatePlot($(this).data('plot-id'));")
    // TODO: maybe if minimap is getting too long we can trim it
    $("#plots").append($(newplot).clone());
    // TODO: maybe if minimap is getting too long we can trim it
    $("#plots-minimap").prepend($(newplot).clone());
    $('a[href="#plot-window"]').tab("show");
    calibratePanes();
  } else if (result.html) {
    $("#plots .active").removeClass("active").addClass("hide");
    // var html = $(result.html, "svg").attr("width", "100%").attr("height", "100%").html();
    // TODO: need to handle the sizing here
    result.html = result.html.replace(/600px/g, "95%");
    // result.html = $("svg", result.html).outerHTML();
    $("#result.htmls").append('<div class="active">' + result.html + "</div>");
    $('a[href="#plot-window"]').tab("show");
    calibratePanes();
  }
}
