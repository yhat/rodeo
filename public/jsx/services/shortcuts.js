import $ from 'jquery';

/**
 * setup the shortcut display modal here. we're using a handlebars
 * template here are a partial (the shortcuts table is really big).
 * this keeps this file a lot cleaner.
 */
export function initShortcutsDisplay() {
  $('#shortcut-display-modal').find('#shortcuts').append(templates.shortcuts());

  $('#shortcut-search').on('input', function () {
    const query = $(this).val().toLowerCase();

    if (query === '') {
      $('#shortcuts').find('tr .hide').removeClass('hide');
    } else {
      $('#shortcut-rows').find('tr').each(function (i, shortcut) {
        let text = [];

        $('td', shortcut).map(function (i, el) {
          text.push($(el).text());
        });

        text = text.join('-').toLowerCase();

        if (text.indexOf(query) > -1) {
          $(this).removeClass('hide');
        } else {
          $(this).addClass('hide');
        }
      });
    }
  });
}
