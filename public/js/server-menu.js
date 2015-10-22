
var RodeoMenu = {
  name: "Rodeo",
  items: [
    { text: "About", href: "about" },
    { text: "Open", shortcut: "⌘ + opt + o", onclick: "$('#file-upload-trigger').click();" },
    { text: "Preferences", shortcut: "⌘ + ,", onclick: "showPreferences();" },
    { text: "Default Variables", onclick: "showRodeoProfile();" },
  ]
};

$("#psuedo-file-menu").append(
  menu_item_template(RodeoMenu)
);

var FileMenu = {
  name: "File",
  items: [
    { text: "File", shortcut: "ctrl + shift + n", onclick: "$('#add-tab').click();" },
    { text: "Open", shortcut: "⌘ + opt + o", onclick: "$('#file-upload-trigger').click();" },
    { isDivider: true },
    { text: "Save", shortcut: "⌘ + s", onclick: "saveActiveEditor();" },
    { text: "Save As", shortcut: "", onclick: "saveActiveEditor(true);" },
    { isDivider: true },
    { text: "Close", shortcut: "⌘ + opt + w", onclick: "closeActiveFile();" },
    { text: "Find File", shortcut: "⌘ + opt + t", onclick: "findFile();" }
  ]
};

$("#psuedo-file-menu").append(
  menu_item_template(FileMenu)
);

var ViewMenu = {
  name: "View",
  items: [
    { text: "Change Editor" },
    { text: "└ Move One Left", shortcut: "⌘ + opt + left", onclick: "shiftEditorLeft();"},
    { text: "└ Move One Right", shortcut: "⌘ + opt + right", onclick: "shiftEditorRight();"},
    { isDivider: true },
    { text: "Focus" },
    { text: "└ Editor", shortcut: "⌘ + 1", onclick: "focusOnEditor();"},
    { text: "└ Console", shortcut: "⌘ + 2", onclick: "focusOnConsole();"},
    { text: "└ Variables & History", shortcut: "⌘ + 3", onclick: "focusOnTopRight();"},
    { text: "└ Files, Plots, Packages, ...", shortcut: "⌘ + 4", onclick: "focusOnBottomRight();"}
  ]
};

$("#psuedo-file-menu").append(
  menu_item_template(ViewMenu)
);

var SessionMenu = {
  name: "Session",
  items: [
    { text: "Restart Session", onclick: "restartSession();" },
    { text: "Set Working Directory", onclick: "setWorkingDirectory();" },
    { text: "Last Command", shortcut: "⌘ + shift + 1", onclick: "runLastCommand();" },
    { text: "2nd to Last Command", shortcut: "⌘ + shift + 2", onclick: "run2ndToLastCommand();" }
  ]
};

$("#psuedo-file-menu").append(
  menu_item_template(SessionMenu)
);




var HelpMenu = {
  name: "Help",
  items: [
    { text: "View Shortcuts", onclick: "$('#shortcut-display-modal').modal('show');" },
    { text: "Docs", href: "http://yhat.github.io/rodeo-docs/" },
    { text: "Tour", onclick: "$('#tour-modal').modal('show');" }
  ]
};

$("#psuedo-file-menu").append(
  menu_item_template(HelpMenu)
);
