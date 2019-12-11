/*
 * Copyright (c) 2019 OpenEye Scientific Software
 * All rights reserved.
 */
const assert = require("assert");

const testCompanyName = "Foo, Inc.";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
const myExtension = require("../../extension");

// Simply helper routine for updating copyright
const updateCopyrightTransform = text =>
  myExtension.updateCopyright(text, testCompanyName);

/* Test data is an array of objects the form:
  {
    input: "value",
    output: "value",
    message: "test description",
    transform: <optional function to mutate input before comparing>,
    tester: <optional function to compare output and transformed input.  Defaults to assert.deepEqual>
  }
*/
const testData = [
  {
    input: "",
    output: {
      newText: myExtension.populateTemplate(
        myExtension.copyrightTemplate,
        null,
        "2019",
        testCompanyName
      ),
      removeInitialLines: false
    },
    transform: updateCopyrightTransform,
    message: "Should add a header"
  },
  {
    input: myExtension.populateTemplate(
      myExtension.copyrightTemplate,
      null,
      "2019",
      testCompanyName
    ),
    output: {
      newText: myExtension.populateTemplate(
        myExtension.copyrightTemplate,
        null,
        "2019",
        testCompanyName
      ),
      removeInitialLines: true
    },
    transform: input => {
      input = input.replace(RegExp(/ /, "g"), "  ");
      return updateCopyrightTransform(input);
    },
    message: "Should not be whitespace sensitive"
  },
  {
    input: myExtension.populateTemplate(
      myExtension.copyrightTemplate,
      null,
      "2018",
      testCompanyName
    ),
    output: {
      newText: myExtension.populateTemplate(
        myExtension.copyrightTemplate,
        "2018",
        "2019",
        testCompanyName
      ),
      removeInitialLines: true
    },
    transform: updateCopyrightTransform,
    message: "Should update a header with a range"
  },
  {
    input: myExtension.populateTemplate(
      myExtension.copyrightTemplate,
      null,
      "2019",
      testCompanyName
    ),
    output: myExtension.populateTemplate(
      myExtension.copyrightTemplate,
      "2019",
      "2019",
      testCompanyName
    ),
    tester: (v1, v2) => {
      assert.deepEqual(v1, v2);
      assert.equal(v1.indexOf("-"), -1, v2);
    },
    message: "Should not generate ranges for same year"
  },
  {
    input: myExtension.populateTemplate(
      myExtension.copyrightTemplate,
      "2018",
      "2019",
      "A slightly different version of my company name"
    ),
    output: {
      newText: myExtension.populateTemplate(
        myExtension.copyrightTemplate,
        "2018",
        "2019",
        testCompanyName
      ),
      removeInitialLines: true
    },
    transform: updateCopyrightTransform,
    message: "Should ignore company name"
  }
];

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  testData.forEach(data => {
    test(data.message, () => {
      let v2 = data.transform ? data.transform(data.input) : data.input;
      let tester = data.tester || assert.deepEqual;
      tester(v2, data.output);
    });
  });
});
