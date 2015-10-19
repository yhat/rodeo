// Plots
function previousPlot() {
  var currentPlot = $("#plots .active");
  if ($("#plots .active").prev().length) {
    var plotid = $("#plots .active").prev().data("plot-id");
    activatePlot(plotid);
  }
}

function nextPlot() {
  var currentPlot = $("#plots .active")
  if ($("#plots .active").next().length) {
    var plotid = $("#plots .active").next().data("plot-id");
    activatePlot(plotid);
  }
}

function deletePlot() {
  var currentplotid = $("#plots .active").data("plot-id");
  var plotid;
  if ($("#plots .active").next().length) {
    plotid = $("#plots .active").next().data("plot-id");
    activatePlot(plotid);
  } else if ($("#plots .active").prev().length) {
    plotid = $("#plots .active").prev().data("plot-id");
    activatePlot(plotid);
  }
  $("#plots [data-plot-id='" + currentplotid + "']").remove();
  $("#plots-minimap [data-plot-id='" + currentplotid + "']").remove();
}

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
  if (! $("#plots .active").length) {
    return;
  }
  bootbox.alert("Right-click the plot to save.");
  // remote.require('dialog').showSaveDialog({
  //   title:'Export Plot',
  //   default_path: USER_WD,
  // }, function(destfile) {
  //   if (! destfile) {
  //     return
  //   }
  //
  //   if ($("#plots img.active").length) {
  //     // if image
  //     var img = $("img.active").attr("src").replace("data:image/png;charset=utf-8;base64,", "");
  //     require('fs').writeFileSync(destfile, img, 'base64');
  //   } else {
  //     // if svg
  //     var svg = document.getElementsByTagName("svg")[0]
  //     svgAsDataUri(svg, {}, function(uri) {
  //       img = uri.replace("data:image/svg+xml;base64,", "");
  //       require('fs').writeFileSync(destfile, img, 'base64');
  //     });
  //   }
  // });
}

function addPlot(result) {
  var plotid = guid();
  if (result.image) {
    var plotImage = "data:image/png;charset=utf-8;base64," + result.image;
    $("#plots-minimap .active").removeClass("active");
    $("#plots .active").removeClass("active").addClass("hide");
    var newplot = $.parseHTML('<img class="active" style="max-height: 100%; max-width: 100%;" />');
    $(newplot).attr("src", plotImage);
  } else if (result.html) {
    $("#plots .active").removeClass("active").addClass("hide");
    // TODO: need to handle the sizing here
    result.html = result.html.replace(/600px/g, "95%");
    var newplot = $.parseHTML('<div class="active">' + result.html + "</div>");
  }
  $(newplot).attr("onclick", "activatePlot($(this).data('plot-id'));")
  $(newplot).attr("data-plot-id", plotid);
  // add to plotting window and to minimap
  $("#plots").append($(newplot).clone());
  $("#plots-minimap").prepend($(newplot).clone());
  $('a[href="#plot-window"]').tab("show");
  calibratePanes();
}
