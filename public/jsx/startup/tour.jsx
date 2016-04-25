/* globals ipc */

var Tour = window.Tour = React.createClass({
  exitTour: function () {
    ipc.send('exit-tour');
  },
  render: function () {
    let data, tourItems;

    data = [
      {
        title: 'Welcome to Rodeo!',
        subtitle: 'An IDE for Data Science',
        img: 'img/rodeo-logo.png',
        img2: null
      },
      {
        title: 'Autocomplete Your Code',
        subtitle: 'Use <kbd>tab</kbd> to autocomplete code from within the editor and the console.',
        img: 'img/tour/first/autocomplete.png',
        img2: null
      },
      {
        title: 'Plot and Analyze',
        subtitle: 'View plots without leaving Rodeo. Plots can be exported to your computer or saved for later.',
        img: 'img/tour/first/plots.png',
        img2: null
      },
      {
        img2: 'img/tour/first/viewer2.png',
        subtitle: 'Inspect your data using the <strong>Environment</strong> tab.',
        img: 'img/tour/first/viewer.png',
        title: 'View Datasets'
      },
      {
        title: 'Customize Your Rodeo Preferences',
        subtitle: 'Check out the <strong>Preferences</strong> tab to configure your Rodeo. Adjust the font size, change your syntax highlighting theme, setup your default working directory, and more!',
        img: 'img/tour/first/preferences.png',
        img2: null
      },
      {
        title: 'Bring your vim or emacs keyboard to Rodeo',
        subtitle: 'Use your favorite <strong>vim or emacs</strong> shortcuts. To setup vim/emacs, visit <strong>Preferences > Editor</strong>.',
        img: 'img/tour/first/vim-and-emacs-1.png',
        img2: null
      },
      {
        img2: 'img/tour/first/vim-and-emacs-2.png',
        subtitle: 'Create a <code>.rodeoprofile</code> to automatically load common libraries, functions, or datasets. Click <strong>CONFIGURE</strong> in the <strong>Preferences > General > Default Variables</strong> to access your <code>.rodeoprofile</code>.',
        img: 'img/tour/first/rodeo-profile.png',
        title: 'Setup Your Default Environment'
      },
      {
        title: 'Pick from One of Rodeo\'s Themes',
        subtitle: 'Select the theme that speaks to you.',
        img: 'img/tour/first/themes.png',
        img2: null
      },
      {
        title: 'Loaded with Shortcuts',
        subtitle: 'Shortcuts for everyting! Try <kbd>&#8984;</kbd> + <kbd>enter</kbd> to run code in the editor. Can\'t find a shortcut? No worries, visit <strong>Help > View Shortcuts</strong> to see them all!',
        img: 'img/tour/first/keyboard-shortcuts.png',
        img2: null
      },
      {
        title: 'Find Files Quickly',
        subtitle: 'Looking for a particular file? Try <kbd>&#8984;</kbd> + <kbd>t</kbd> to search your working directory.',
        img: 'img/tour/first/find-files.png',
        img2: null
      },
      {
        title: 'Let\'s Rodeo!',
        subtitle: 'Ok looks like you\'re ready to go! For more help visit <a onclick=\'shell.openExternal(\'http://yhat.github.io/rodeo-docs/docs/\');\'>the docs</a> or email <a>info@yhathq.com</a>.',
        img: 'img/tour/first/rodeo-celebration.png',
        img2: null
      }
    ];
    tourItems = data.map(function (item) {
      return (
        <TourItem
          img={item.img}
          img2={item.img2}
          subtitle={item.subtitle}
          title={item.title}
        />
      );
    });

    setTimeout(function () {
      $('#tour').owlCarousel({singleItem: true});
    }, 50);

    return (
      <div className="text-center">
        <div id="tour">
          {tourItems}
        </div>
        <br />
        <button className="btn btn-primary"
          onClick={this.exitTour}>
          {'Enough of this tour, let\'s start Rodeo!'}
        </button>
      </div>
    );
  }
});