function setupWindows() {
  // resizeable panes
  $("#pane-container").height($(window).height() - $(".navbar").height());

  getRC(function(rc) {
    $("#pane-container").split({
      orientation: 'vertical',
      limit: 100,
      position: rc.paneVertical || '50%'
    });

    $("#right-column").split({
      orientation: 'horizontal',
      limit: 100,
      position: rc.paneHorizontalRight || '50%'
    });

    $("#left-column").split({
      orientation: 'horizontal',
      limit: 100,
      position: rc.paneHorizontalLeft || '50%'
    });
  });
}

function saveWindowCalibration() {
  var paneVertical = 100 * $("#pane-container #left-column").width() / $("#pane-container").width();
  var paneHorizontalRight = 100 * $("#pane-container #top-right").height() / $("#pane-container #right-column").height();
  var paneHorizontalLeft = 100 * $("#pane-container #top-left").height() / $("#pane-container #left-column").height();
  updateRC("paneVertical", paneVertical + "%");
  updateRC("paneHorizontalRight", paneHorizontalRight + "%");
  updateRC("paneHorizontalLeft", paneHorizontalLeft + "%");
}

function calibratePanes() {

  $("#pane-container").height($(window).height() - ($(".navbar").height() || 0));
  // Top Left
  var topLeftHeight = $("#top-left").height();
  var offset = $("#top-left #editorsTab").height() + 2;
  $("#top-left #editors").height(topLeftHeight - offset);

  // Bottom Left
  var bottomLeftHeight = $("#bottom-left").height();
  var offset = $("#bottom-left #consoleTab").height() + 1;
  $("#consoleTabContainer").height(bottomLeftHeight - offset);
  // TODO: this is getting called constantly
  // setConsoleWidth($("#console").width());

  // Top Right
  var offset = $("#top-right ul").height() + 1;
  $("#environment").height($("#top-right").height() - offset);
  $("#history").height($("#top-right").height() - offset);
  // $("#vars").height($("#top-right").height()*.7);
  $("#vars-container").height($("#environment").height() - offset);

  // Bottom Right
  var tabOffset = $("#bottom-right .nav-tabs").height() + 1;
  $("#bottomRightTabContent").height($("#bottom-right").height() - tabOffset);
  // files
  $("#file-list").height($("#bottomRightTabContent").height() - $("#working-directory").height());
  // packages
  $("#packages").height($("#bottom-right").height() - tabOffset);
  var offset = 42 + 30 + 1; // $("#packages table").first().height() + $("#packages .row").first().height() + 1;
  $("#packages-container").height($("#packages").height() - offset);

  // plots
  $("#plot-window").height($("#bottom-right").height() - tabOffset);
  var offset = offset + 25 + 5; //13;
  $("#plots img").css("max-height", $("#bottom-right").height() - offset);
  $("#plots-minimap").css("max-height", $("#bottom-right").height() - offset);
  // help
  $("#help-content").parent().height($("#bottom-right").height() - tabOffset);
  $("#help-content").height($("#bottom-right").height() - tabOffset);
  // preferences
  $("#preferences").height($("#bottom-right").height() - tabOffset);
  // $("#preferences .panel-body").height($("#bottom-right").height() - tabOffset);
  $("#preferences").parent().height($("#bottom-right").height() - tabOffset);
  $("#preferences").height($("#bottom-right").height() - tabOffset);

  // scrolling fixes...
  // removes stupid scroll bars on windows/linux
  $("[style*=height]").css("overflow", "hidden");

  // things we actually want to scroll
  // top right
  $("#vars-container").css("overflow-y", "scroll");
  $("#history").css("overflow-y", "scroll");
  // bottom right
  $("#file-list").css("overflow-y", "scroll");
  $("#plots-minimap").css("overflow-y", "scroll");
  $("#packages-container").css("overflow-y", "scroll");
  $("#help-content").css("overflow-y", "scroll");
  $("#preferences").css("overflow-y", "scroll");
}

// on resize w/ gray bars, recalibrate
$(document.documentElement).bind('mouseup.splitter touchend.splitter touchleave.splitter touchcancel.spliter', function(e) {
  saveWindowCalibration();
  calibratePanes();
});

window.onresize = function(evt) {
  calibratePanes();
};
