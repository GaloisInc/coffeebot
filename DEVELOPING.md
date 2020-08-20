# Working on Coffeebot

If you want to do any development on Coffeebot, there are only a few things you should know about. Coffeebot uses [Webpack](https://webpack.js.org/) to allow us to use [CommonJS](http://www.commonjs.org/specs/modules/1.0/) modules so we can both test our code and generate a GoogleSheet-friendly script.

## Running Tests

There are a small set of tests for code not specific to GoogleSheets which you can run by running:

```sh
npm test
```

If all goes well, you should see something like:

```sh
 PASS  tests/index.test.js
  Coffeebot
    serializeEmails
      ✓ should always sort lexicographically (1 ms)
      ✓ should handle an empty list
    deserializeEmails
      ✓ should always sort lexicographically (1 ms)
      ✓ should be able to deserialize an empty string
    uniqify
      ✓ should de-duplicate a given list of strings
      ✓ should de-duplicate a given list of numbers
      ✓ should handle empty list (1 ms)
    mapRowDataToPairData
      ✓ should correctly build an object out of valid row data
      ✓ should map to expected defaults
    randomUniquePairing
      ✓ should handle no-data case (1 ms)
      ✓ should just pair particpants if no previous pairing data
      ✓ should avoid previous pairing (1 ms)
    shouldSnooze
      ✓ should not snooze if no snooze date
      ✓ should not snooze if snooze date was in a previous year
      ✓ should not snooze if snooze date was in a previous month (1 ms)
      ✓ should not snooze if snooze date is before today
      ✓ should snooze if snooze is for today
      ✓ should snooze if snooze if for tomorrow

Test Suites: 1 passed, 1 total
Tests:       18 passed, 18 total
Snapshots:   0 total
Time:        1.376 s
Ran all test suites.
```

## Building a GoogleSheet Script

In order to build a version of Coffeebot to embed in a GoogleSheet, you should simply run:

```sh
npm run build
```

This will output `dist/main.js` which will be a minified version of the code.

### Building Human-friendly Version

The above script generates a minified version of the code. If you would like to have a version that you can actually read and set breakpoints for within the GoogleSheet ScriptTools, then run the following:

```sh
npm run build:dev
```

This will output `dist/main.js` which will be a human-friendly version of the code.

### Installing the Script

Open the GoogleSheet you created for coffeebot (or see [setup](./setup.md) if you have not yet set that up) and then open the `Tools`->`Script Editor` and paste your work in there. 

## Making Changes

If you want to make changes to the code, you can also have [Webpack](https://webpack.js.org/) watch for changes and build new versions of the code for you by running the following command:

```sh
npm run watch
```

After you save and edit, it will output `dist/main.js` in a human-friendly format that you can then paste into the GoogleSheet ScriptTool.