import React from 'react';
import SplitPane from '../components/split-pane.jsx';
import TabbedPane from '../components/tabbed-pane/tabbed-pane.jsx';
import FileViewer from '../components/file-viewer.jsx';
import PlotViewer from '../components/plot-viewer.jsx';
import PackageViewer from '../components/package-viewer.jsx';
import HelpViewer from '../components/help-viewer.jsx';
import PreferenceViewer from '../components/preference-viewer.jsx';
import EnvironmentViewer from '../components/environment-viewer.jsx';
import HistoryViewer from '../components/history-viewer.jsx';
import JupyterClientViewer from '../components/jupyter-client-viewer.jsx';
import TabbedPaneItem from '../components/tabbed-pane/tabbed-pane-item.jsx';
import AcePane from '../components/ace-pane/ace-pane.jsx';
import './main.less';

export default React.createClass({
  displayName: 'Main',
  getInitialState: function () {
    return {
      acePanes: [
        {
          language: 'python'
        }
      ]
    };
  },
  handleAddAcePane: function () {
    this.setState({
      acePanes: this.state.acePanes.concat([{ language: 'python' }])
    });
  },
  render: function () {
    const acePanes = this.state.acePanes.map(function (item, i) {
      return (
        <TabbedPaneItem
          icon="file-code-o"
          isCloseable
          key={i}
          label="New File"
        >
          <AcePane filename={item.filename} fontSize={item.fontSize} language={item.language} />
        </TabbedPaneItem>
      );
    });

    return (
      <SplitPane direction="left-right">
        <SplitPane direction="top-bottom">
          <TabbedPane>
            {acePanes}
            <a onClick={this.handleAddAcePane}><span className="fa fa-plus-square-o"/></a>
          </TabbedPane>
          <TabbedPane>
            <TabbedPaneItem
              icon="terminal"
              label="Console"
            ><JupyterClientViewer /></TabbedPaneItem>
          </TabbedPane>
        </SplitPane>
        <SplitPane direction="top-bottom">
          <TabbedPane>

            <TabbedPaneItem
              icon="table"
              label="Environment"
            ><EnvironmentViewer /></TabbedPaneItem>

            <TabbedPaneItem
              icon="history"
              label="History"
            ><HistoryViewer /></TabbedPaneItem>

          </TabbedPane>
          <TabbedPane>

            <TabbedPaneItem
              icon="file-text-o"
              label="Files"
            ><FileViewer /></TabbedPaneItem>

            <TabbedPaneItem
              icon="bar-chart"
              label="Plots"
            ><PlotViewer /></TabbedPaneItem>

            <TabbedPaneItem
              icon="archive"
              label="Packages"
            ><PackageViewer /></TabbedPaneItem>

            <TabbedPaneItem
              icon="life-ring"
              label="Help"
            ><HelpViewer /></TabbedPaneItem>

            <TabbedPaneItem
              icon="cogs"
              label="Preferences"
            ><PreferenceViewer /></TabbedPaneItem>

          </TabbedPane>
        </SplitPane>
      </SplitPane>
    );
  }
});