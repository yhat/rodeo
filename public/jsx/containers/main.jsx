import React from 'react';
import SplitPane from '../components/split-pane.jsx';
import TabbedPane from '../components/tabbed-pane.jsx';
import FileViewer from '../components/file-viewer.jsx';
import PlotViewer from '../components/plot-viewer.jsx';
import PackageViewer from '../components/package-viewer.jsx';
import HelpViewer from '../components/help-viewer.jsx';
import PreferenceViewer from '../components/preference-viewer.jsx';
import EnvironmentViewer from '../components/environment-viewer.jsx';
import HistoryViewer from '../components/history-viewer.jsx';
import JupyterClientViewer from '../components/jupyter-client-viewer.jsx';
import TabbedPaneItem from '../components/tabbed-pane-item.jsx';

export default React.createClass({
  displayName: 'Main',
  render: function () {
    return (
      <SplitPane direction="left-right">
        <SplitPane direction="top-bottom">
          <TabbedPane />
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