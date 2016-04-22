// Plots
function previousPlot() {
  track('plot', 'previous');
  var currentPlot = $("#plots .active");
  if ($("#plots .active").prev().length) {
    var plotid = $("#plots .active").prev().data("plot-id");
    activatePlot(plotid);
  }
}

function nextPlot() {
  track('plot', 'next');
  var currentPlot = $("#plots .active")
  if ($("#plots .active").next().length) {
    var plotid = $("#plots .active").next().data("plot-id");
    activatePlot(plotid);
  }
}

function deletePlot() {
  track('plot', 'delete');
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
  track('plot', 'show');
  if (! $("#plots img.active").length) {
    return;
  }
  if (isDesktop()) {
    var BrowserWindow = remote.require('browser-window');
    var filename = $("#plots img.active").attr("src");
    var params = {toolbar: false, resizable: false, show: true, height: 1000, width: 1000};
    var plotWindow = new BrowserWindow(params);
    plotWindow.loadURL(filename);
  } else {
    var filename = $("#plots img.active").attr("src");
    var newWindow = window.open("","Rodeo Markdown","width=" + $(window).width()*0.6 +",height=" + $(window).height() +",scrollbars=1,resizable=1")
    // read text from textbox placed in parent window
    newWindow.document.open();
    var img = '<img src="' + filename + '" />';
    newWindow.document.write("<html><body>" + img + "</body>");
    newWindow.document.close();
  }
}

function savePlot() {
  track('plot', 'save');
  if (! $("#plots .active").length) {
    return;
  }
  if (isDesktop()) {
    remote.require('dialog').showSaveDialog({
      title: 'Export Plot',
      default_path: ipc.send('wd-get'),
    }, function(destfile) {
      if (! destfile) {
        return
      }

      if (! /\.png$/.test(destfile)) {
        destfile += ".png";
      }

      if ($("#plots img.active").length) {
        // if image
        var img = $("img.active").attr("src").replace("data:image/png;charset=utf-8;base64,", "");
        require('fs').writeFileSync(destfile, img, 'base64');
      } else {
        // if svg
        var svg = document.getElementsByTagName("svg")[0]
        svgAsDataUri(svg, {}, function(uri) {
          img = uri.replace("data:image/svg+xml;base64,", "");
          require('fs').writeFileSync(destfile, img, 'base64');
        });
      }
    });
  } else {
    bootbox.alert("Right-click the plot to save.");
  }
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
    //  TODO: need to handle the sizing here
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
