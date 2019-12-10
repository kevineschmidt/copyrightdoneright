/*
 *   Copyright (c) 2019 OpenEye Scientific Software, Inc
 *   All rights reserved.
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const startYearPattern = "{startyear}-";
const endYearPattern = "{endyear}";
const companyNamePattern = "{companyname}";
const yearPattern = "[0-9][0-9][0-9][0-9]";
const yearCapture = `(${yearPattern})`;
const optionalStartYearCapture = `(${yearPattern}-)?`;
const companyName = "OpenEye Scientific Software";
const template = `/*
 * Copyright (c) ${startYearPattern}${endYearPattern} ${companyNamePattern}
 * All rights reserved.
 */
`;
const templateLineCt = template.split("\n").length;
const matcher = new RegExp(
  template
    .replace(RegExp("\\/", "g"), "\\/")
    .replace(RegExp("\\(", "g"), "\\(")
    .replace(RegExp("\\)", "g"), "\\)")
    .replace(RegExp("\\*", "g"), "\\*")
    .replace(startYearPattern, optionalStartYearCapture)
    .replace(endYearPattern, yearCapture)
    .replace(companyNamePattern, companyName)
);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function range(start, end) {
  return new Array(end - start).fill(undefined).map((val, idx) => {
    return idx + start;
  });
}
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "copyrightdoneright" is now active!'
  );
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  vscode.workspace.onWillSaveTextDocument(evt => {
    let doc = evt.document;
    if (doc.languageId === "javascript") {
      let textEditor = vscode.window.activeTextEditor;
      let startingBlock = range(0, templateLineCt)
        .map(lineNo => {
          return doc.lineAt(lineNo).text || "";
        })
        .join("\n");
      let res = matcher.exec(startingBlock);
      let curYear = new Date().getFullYear().toString();
      let removeOldLines = false;
      let startYear;
      if (res) {
        // The start year is EITHER the first match (range) or the second (singular)
        startYear = res[1] ? res[1].slice(0, res[1].length - 1) : res[2];
        removeOldLines = true;
      } else {
        startYear = curYear;
      }

      textEditor.edit(editBuilder => {
        if (removeOldLines)
          editBuilder.delete(new vscode.Range(0, 0, templateLineCt - 1, 0));
        if (curYear === startYear) {
          startYear = "";
        } else startYear = startYear + "-";

        let newText = template
          .replace(endYearPattern, curYear)
          .replace(companyNamePattern, companyName)
          .replace(startYearPattern, startYear);

        editBuilder.insert(new vscode.Position(0, 0), newText);
      });
    }
  });

  let disposable = vscode.commands.registerCommand(
    "extension.helloWorld",
    function() {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World!");
    }
  );

  context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
