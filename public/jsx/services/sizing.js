import $ from 'jquery';
import * as store from './store';
import ace from 'ace';

function saveWindowCalibration() {
  const $paneContainer = $('#pane-container'),
    $leftColumn = $paneContainer.find('#left-column'),
    $rightColumn = $paneContainer.find('#right-column'),
    $topRight = $paneContainer.find('#top-right'),
    $topLeft = $paneContainer.find('#top-left'),
    paneVertical = 100 * $leftColumn.width() / $paneContainer.width(),
    paneHorizontalRight = 100 * $topRight.height() / $rightColumn.height(),
    paneHorizontalLeft = 100 * $topLeft.height() / $rightColumn.height();

  store.set('paneVertical', paneVertical + '%');
  store.set('paneHorizontalRight', paneHorizontalRight + '%');
  store.set('paneHorizontalLeft', paneHorizontalLeft + '%');
}

function setBottomLeftHeight() {
  const bottomLeftHeight = $('#bottom-left').height(),
    offset = $('#consoleTab').height() + 1;

  $('#consoleTabContainer').height(bottomLeftHeight - offset);
}

function setTopLeftHeight() {
  const topLeftHeight = $('#top-left').height(),
    offset = $('#editorsTab').height() + 2;

  $('#editors').height(topLeftHeight - offset);
}

function setTopRightHeight() {
  const $topRight = $('#top-right'),
    topRightHeight = $topRight.height(),
    $environment = $('#environment'),
    offset = $topRight.find('ul').height() + 1;

  $environment.height(topRightHeight - offset);
  $('#history').height(topRightHeight - offset);
  $('#vars-container').height($environment.height() - offset);
}

function setBottomRightHeight() {
  const $bottomRight = $('#bottom-right'),
    $packages = $('#packages'),
    $bottomRightTabContent = $('#bottomRightTabContent'),
    tabOffset = $bottomRight.find('.nav-tabs').height() + 1,
    offset = 42 + 30 + 1;

  $bottomRightTabContent.height($bottomRight.height() - tabOffset);
  $('#file-list').height($bottomRightTabContent.height() - $('#working-directory').height());
  $packages.height($bottomRight.height() - tabOffset);
  $('#packages-container').height($packages.height() - offset);
}

function setPlotsHeight() {
  const $bottomRight = $('#bottom-right'),
    bottomRightHeight = $bottomRight.height(),
    $helpContent = $('#help-content'),
    $preferences = $('#preferences'),
    tabOffset = $bottomRight.find('.nav-tabs').height() + 1,
    offset = 42 + 30 + 1 + 25 + 5;

  $('#plot-window').height(bottomRightHeight - tabOffset);
  $('#plots').find('img').css('max-height', bottomRightHeight - offset);
  $('#plots-minimap').css('max-height', bottomRightHeight - offset);
  $helpContent.parent().height(bottomRightHeight - tabOffset);
  $helpContent.height(bottomRightHeight - tabOffset);
  $preferences.height(bottomRightHeight - tabOffset);
  $preferences.parent().height(bottomRightHeight - tabOffset);
  $preferences.height(bottomRightHeight - tabOffset);
}

/**
 * Removes stupid scroll bars on windows/linux
 */
function fixScrollBars() {
  // don't scroll
  $('[style*=height]').css('overflow', 'hidden');

  // things we actually want to scroll
  // top right
  $('#vars-container').css('overflow-y', 'scroll');
  $('#history').css('overflow-y', 'scroll');
  // bottom right
  $('#file-list').css('overflow-y', 'scroll');
  $('#plots-minimap').css('overflow-y', 'scroll');
  $('#packages-container').css('overflow-y', 'scroll');
  $('#help-content').css('overflow-y', 'scroll');
  $('#preferences').css('overflow-y', 'scroll');
}

function triggerEditorResize() {
  $('#editors').find('.editor').each(function (i, el) {
    ace.edit($(el).attr('id')).resize();
  });
}

// on resize w/ gray bars, recalibrate
$(document.documentElement).bind('mouseup.splitter touchend.splitter touchleave.splitter touchcancel.spliter', function () {
  saveWindowCalibration();
  calibratePanes();
});

window.onresize = calibratePanes;

export function calibratePanes() {
  $('#pane-container').height($(window).height() - ($('.navbar').height() || 0));

  setTopLeftHeight();
  setBottomLeftHeight();
  setTopRightHeight();
  setBottomRightHeight();
  setPlotsHeight();
  fixScrollBars();
  triggerEditorResize();
}

export function setupWindows() {
  const $paneContainer = $('#pane-container'),
    $navbar = $('.navbar');

  // resizeable panes

  let paneVertical = store.get('paneVertical') || '50%',
    paneHorizontalRight = store.get('paneHorizontalRight') || '50%',
    paneHorizontalLeft = store.get('paneHorizontalLeft') || '50%';

  $paneContainer.height($(window).height() - $navbar.height());

  $paneContainer.split({
    orientation: 'vertical',
    limit: 100,
    position: paneVertical
  });

  $('#right-column').split({
    orientation: 'horizontal',
    limit: 100,
    position: paneHorizontalRight
  });

  $('#left-column').split({
    orientation: 'horizontal',
    limit: 100,
    position: paneHorizontalLeft
  });
}
