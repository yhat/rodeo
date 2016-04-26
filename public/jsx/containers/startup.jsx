/* globals ipc, store, LoadingWidget, PythonSelector, Tour, tourData */
'use strict';

const Startup = window.Startup = React.createClass({
  getInitialState: function () {
    return {
      seenTour: store.get('seenTour'),
      pythonOptions: store.get('pythonOptions'),
      systemFacts: store.get('systemFacts'),
      status: 'loading'
    };
  },
  componentDidMount: function () {
    const state = this.state;

    if (!state.pythonOptions) {
      ipc.send('get_system_facts').then(function (result) {
        store.set('systemFacts', result);
        state.systemFacts = result;
      }).catch(error => console.error(error));
    } else if (state.seenTour) {
      this.close();
    }
  },
  close: () => ipc.send('close_window', 'startupWindow'),
  handleExitTour: function () {
    store.set('seenTour', true);
    this.close();
  },
  handlePythonSelect: function (pythonDefinition) {
    const state = this.state,
      pythonOptions = pythonDefinition.pythonOptions;

    store.set('pythonOptions', pythonOptions);
    state.pythonOptions = pythonOptions;
  },
  render: function () {
    const state = this.state,
      style = {backgroundColor: 'inherit'};
    let content;

    if (!state.pythonOptions) {
      if (!state.systemFacts) {
        content = <LoadingWidget />;
      } else {
        content = (
          <PythonSelector onSelect={this.handlePythonSelect}
            pythonDefinitions={state.systemFacts.availablePythonKernels}
            showDescription
            showVersion
          />
        );
      }
    } else if (!state.seenTour) {
      content = (
        <Tour onExitTour={this.handleExitTour}
          tourData={tourData}
        />
      );
    } else {
      content = (<h1>{'Ready to Rodeo!'}</h1>);
    }

    return (
      <div className="jumbotron"
        style={style}
      >
        {content}
      </div>
    );
  }
});
