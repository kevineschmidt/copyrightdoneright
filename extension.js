/*
 * Copyright (c) 2019 OpenEye Scientific Software
 * All rights reserved.
 */
/*
 *   Copyright (c) 2019 OpenEye Scientific Software, Inc
 *   All rights reserved.
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const pkg = require("./package.json");
const vscode = require("vscode");
const startYearPattern = "{startyear}-";
const endYearPattern = "{endyear}";
const companyNamePattern = "{companyname}";
const companyPattern = "([a-z A-Z,.]+)";
const yearPattern = "[0-9][0-9][0-9][0-9]";
const yearCapture = `(${yearPattern})`;
const optionalStartYearCapture = `(${yearPattern}-)?`;

const copyrightTemplate = `/*
 * Copyright (c) ${startYearPattern}${endYearPattern} ${companyNamePattern}
 * All rights reserved.
 */
`;
const copyrightTemplateLineCt = copyrightTemplate.split("\n").length;

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

function populateTemplate(template, startYear, endYear, companyName) {
  startYear =
    startYear === null || startYear === endYear ? "" : startYear + "-";

  return template
    .replace(startYearPattern, startYear)
    .replace(endYearPattern, endYear)
    .replace(companyNamePattern, companyName);
}

function updateCopyright(initialLines, companyName) {
  const matcher = new RegExp(
    copyrightTemplate
      .replace(RegExp("\\/", "g"), "\\/") // Escape /
      .replace(RegExp("\\(", "g"), "\\(") // Escape ()
      .replace(RegExp("\\)", "g"), "\\)") // Escape )
      .replace(RegExp("\\*", "g"), "\\*") // Escape *
      .replace(RegExp(/ /, "g"), " +") // Whitespace insensitive
      .replace(startYearPattern, optionalStartYearCapture)
      .replace(endYearPattern, yearCapture)
      .replace(companyNamePattern, companyPattern)
  );
  let res = matcher.exec(initialLines);
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

  return {
    newText: populateTemplate(
      copyrightTemplate,
      startYear,
      curYear,
      companyName
    ),
    removeInitialLines: removeOldLines
  };
}
function activate() {
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
      let cfg = vscode.workspace.getConfiguration(pkg.name);
      let companyName = cfg.get("companyname") || "Company Name";
      let textEditor = vscode.window.activeTextEditor;
      let startingBlock = range(0, copyrightTemplateLineCt)
        .map(lineNo => {
          return doc.lineAt(lineNo).text || "";
        })
        .join("\n");

      let ret = updateCopyright(startingBlock, companyName);
      if (ret) {
        textEditor.edit(editBuilder => {
          if (ret.removeInitialLines)
            editBuilder.delete(
              new vscode.Range(0, 0, copyrightTemplateLineCt - 1, 0)
            );

          editBuilder.insert(new vscode.Position(0, 0), ret.newText);
        });
      }
    }
  });
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
  updateCopyright,
  copyrightTemplate,
  populateTemplate
};
