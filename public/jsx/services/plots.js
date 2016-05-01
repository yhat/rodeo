import $ from 'jquery';
import track from './track';
import { send } from './ipc';
import guid from './guid';

// Plots
function previousPlot() {
  track('plot', 'previous');
  const $activePlot = $('#plots').find('.active'),
    prevEl = $activePlot.prev();

  if (prevEl.length) {
    activatePlot(prevEl.data('plot-id'));
  }
}

function nextPlot() {
  track('plot', 'next');
  const $activePlot = $('#plots').find('.active'),
    nextEl = $activePlot.prev();

  if (nextEl.length) {
    activatePlot(nextEl.data('plot-id'));
  }
}

function deletePlot() {
  track('plot', 'delete');
  const $plots = $('#plots'),
    $activePlot = $plots.find('.active'),
    currentPlotId = $activePlot.data('plot-id'),
    nextEl = $activePlot.next(),
    prevEl = $activePlot.prev();

  if (nextEl.length) {
    activatePlot(nextEl.data('plot-id'));
  } else if (prevEl.length) {
    activatePlot(prevEl.data('plot-id'));
  }

  $plots.find('[data-plot-id="' + currentPlotId + '"]').remove();
  $('#plots-minimap').find('[data-plot-id="' + currentPlotId + '"]').remove();
}

function activatePlot(plotid) {
  const $plots = $('#plots'),
    $plotsMinimap = $('#plots-minimap');

  $plots.find('.active').removeClass('active').addClass('hide');
  $plotsMinimap.find('.active').removeClass('active');
  $plots.find('[data-plot-id="' + plotid + '"]').removeClass('hide').addClass('active');
  $plotsMinimap.find('[data-plot-id="' + plotid + '"]').addClass('active');
}

function showPlot() {
  track('plot', 'show');
  const $plots = $('#plots'),
    $activeImage = $plots.find('img.active');
  
  if (!$activeImage.length) {
    return;
  }

  var BrowserWindow = remote.require('browser-window');
  var filename = $activeImage.attr("src");
  var params = {toolbar: false, resizable: false, show: true, height: 1000, width: 1000};
  var plotWindow = new BrowserWindow(params);
  plotWindow.loadURL(filename);
}

/**
 * @param {string} str
 * @returns {boolean}
 */
function hasPNGExtension(str) {
  return /\.png$/.test(str);
}

function savePlot() {
  track('plot', 'save');
  const $plots = $('#plots');
  
  if (!$plots.find('.active').length) {
    return;
  }
  
  return send('save_dialog', {
    title: 'Export Plot',
    default_path: store.get('workingDirectory')
  }).then(function (destfile) {
    if (!destfile) {
      return;
    }

    if (!hasPNGExtension(destfile)) {
      destfile += '.png';
    }

    // whatever they think is happening here really isn't...
    //  -- this is in the renderer process, so this is faked
    if ($plots.find('img.active').length) {
      // if image
      let img = $('img.active').attr('src').replace('data:image/png;charset=utf-8;base64,', '');

      require('fs').writeFileSync(destfile, img, 'base64');
    } else {
      // if svg
      let svg = document.getElementsByTagName('svg')[0];

      return svgAsDataUri(svg, {}).then(function(uri) {
        let img = uri.replace('data:image/svg+xml;base64,', '');

        require('fs').writeFileSync(destfile, img, 'base64');
      });
    }
  });
}

function addPlot(result) {
  const plotId = guid(),
    $plots = $('#plots'),
    $activePlot = $plots.find('.active'),
    $plotsMinimap = $('#plots-minimap');
  let newPlot;

  if (result.image) {
    var plotImage = 'data:image/png;charset=utf-8;base64,' + result.image;
    $plotsMinimap.find('.active').removeClass('active');
    $activePlot.removeClass('active').addClass('hide');
    newPlot = $.parseHTML('<img class="active" style="max-height: 100%; max-width: 100%;" />');
    $(newPlot).attr('src', plotImage);
  } else if (result.html) {
    $activePlot.removeClass('active').addClass('hide');
    //  TODO: need to handle the sizing here
    result.html = result.html.replace(/600px/g, '95%');
    newPlot = $.parseHTML('<div class="active">' + result.html + '</div>');
  }
  // else ?  What happens to newPlot?

  $(newPlot).attr('onclick', 'activatePlot($(this).data("plot-id"));');
  $(newPlot).attr('data-plot-id', plotId);
  // add to plotting window and to minimap
  $plots.append($(newPlot).clone());
  $plotsMinimap.prepend($(newPlot).clone());
  $('a[href="#plot-window"]').tab('show');
  calibratePanes();
}
