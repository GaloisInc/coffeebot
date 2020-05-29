const PAIRING_SHEET_NAME = 'Signup';
const NEXT_PAIRINGS_SHEET_NAME = 'Next Pairings';
const RECORD_SHEET_NAME = 'Past Pairings';
const MAX_PAIRING_TRIES = 3;

/**
 * @description Log error message
 * @param {string} error message to log
 */
function logError(error) {
  Logger.log('ERROR: %s', error);
}

/**
 * @description Accessor to get a specific Sheet from our Spreadsheet
 *              if it is unable to find the requested Sheet, it will
 *              create one for us
 * @param {string} name label for sheet needed
 * @returns {Sheet} Sheet requested or newly created Sheet with given name
 */
function getSpreadsheet(name) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    logError(`Unable to find sheet "${name}", creating one`);

    return createSheet(spreadsheet, name);
  }

  return sheet;
}

/**
 * @description Create a new Sheet with given label
 * @param {Spreadsheet} spreadsheet Spreadsheet we are adding a Sheet to
 * @param {string} name label to assign to created Sheet
 * @returns {Sheet} newly created Sheet
 */
function createSheet(spreadsheet, name) {
  const sheet = spreadsheet.insertSheet();

  sheet.setName(name);

  return sheet;
}

/**
 * @description Fetch data from a given Sheet across a given range
 * @param {Sheet} sheet Sheet containing data we need
 * @param {number} startRow index of starting row for data
 * @param {number} endRow index of ending row
 * @param {number} startColumn index of starting column
 * @param {number} endColumn index of ending column
 * @returns {[][]} list of tuples of spreadsheet data
 */
function getSheetValues(sheet, startRow, endRow, startColumn, endColumn) {
  const numRows = (endRow - startRow) + 1;

  if (numRows === 0) return [];

  const dataRange = sheet.getRange(startRow, startColumn, numRows, endColumn);

  return dataRange.getValues();
}

/**
 * @description Generates a list of galwegians, randomly shuffled to use for pairing
 * @returns {Object<string, string>[]} randomized list of key/value dictionaries representing galwegians
 */
function getPairingData() {
  const sheet = getSpreadsheet(PAIRING_SHEET_NAME);
  const startRow = 3;
  const lastRow = sheet.getLastRow();
  const galwegians = getSheetValues(sheet, startRow, lastRow, 1, 4).map(getMatchData);

  return shuffle(galwegians);
}

/**
 * @description Pulls previous pairing information to help minimize repeat pairings
 * @returns {string[]} list of strings of previous paired email addresses
 */
function getPreviousPairings() {
  const sheet = getSpreadsheet(RECORD_SHEET_NAME);
  const startRow = 2;
  const lastRow = sheet.getLastRow();

  return getSheetValues(sheet, startRow, lastRow, 1, 2).reduce((acc, row) => {
    return acc.concat([row[1].split(',').sort()]);
    }, []);
}

/**
 * @description Randomly shuffle given list
 * @param {T[]} arr list of items to shuffle
 * @returns {T[]} input list in randomized ordering
 */
function shuffle(arr) {
  const shuffled = arr.slice();

  for (let i = shuffled.length-1; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }

  return shuffled;
}

/**
 * @description Deduplicates list members
 * @param {T[]} list list of items that should be unique
 * @returns {T[]} deduplicated list of T
 */
function uniqify(list) {
  const seen = {};
  
  return list.reduce((acc, el) => {
    if (seen[el]) {
      return acc;
    } else {
      seen[el] = true;
      return acc.concat(el);
    }
  }, []);
}

/**
 * @description Converts tuple representation of galwegian to key/value dictionary
 * @param {string[]} row tuple representing user to match
 * @param {string} row.0 name
 * @param {string} row.1 email
 * @param {string} row.2 timezone
 * @param {string} row.3 topics
 * @returns {Object<string, string>} key/value representation of tuple
 */
function getMatchData(row) {
  return {
    name: row[0],
    email: row[1],
    timezone: row[2] || 'UNKNOWN',
    topics: row[3] || '',
  };
}

/**
 * @description Strives to create a unique, random pairing of 2-3 galwegians
 * @param {string[]} prevPairings tuple of emails of previously paired galwegians (@see getPreviousPairings)
 * @param {Object<string, string>[]} galwegians list of key/value dictionaries of Galwegians to pair (@see getMatchData)
 * @returns {[string, string][]} list of tuples of email addresses to use in pairing
 */
function randomUniquePairing(prevPairings, galwegians) {
  if (galwegians.length <= 3) return [galwegians.map(g => g.email).sort()];

  const findPotentialPair = (poolOfPossiblePairs, userToPair) => {
    const pairCandidateIndex = Math.floor(Math.random() * poolOfPossiblePairs.length);
    const pairCandidate = poolOfPossiblePairs[pairCandidateIndex];
    const potentialPair = [userToPair.email, pairCandidate.email].sort();

    return [pairCandidateIndex, potentialPair];
  }

  const userToPair = galwegians.slice(0, 1)[0];
  const poolOfPossiblePairs = galwegians.slice(1);

  let [pairCandidateIndex, potentialPair] = findPotentialPair(poolOfPossiblePairs, userToPair);
  let numTries = 0;

  while (numTries++ < MAX_PAIRING_TRIES) {
    if (!prevPairings[potentialPair.toString()]) break;

    [pairCandidateIndex, potentialPair] = findPotentialPair(poolOfPossiblePairs, userToPair);
  }

  if (prevPairings[potentialPair.toString()]) {
    logError(`Unable to find a novel pairing for ${potentialPair.toString()}`);
  }

  const rest = poolOfPossiblePairs.slice(0, pairCandidateIndex).concat(poolOfPossiblePairs.slice(pairCandidateIndex + 1));

  return [potentialPair].concat(randomUniquePairing(prevPairings, rest));
}

/**
 * @description Joke generator
 * @returns {string} A joke
 */
function joke(){
  return [
    "Barista: How do you take your coffee?\n Me: Very, very seriously.",
    "Q: Where do birds go for coffee?\nA: To the NESTcafe",
    "Q: What's the opposite of coffee?\nA: Sneezy.",
    "Q: What do you call it when you walk into a cafe you’re sure you’ve been to before?\nA: Déjà brew",
    "Q: Why should you be wary of 5-cent espresso?\nA: It’s a cheap shot.",
    "Q: Why did the espresso keep checking his watch?\nA: Because he was pressed for time.",
    "Drinking too much espresso can cause a latte problems.",
  ];
}

/**
 * @description Alternative to coffee generator
 * @returns {string} A witty retort
 */
function wellThen() {
  return [
    "Don't tell that to coffeebot :( Just keep it to yourself okay?",
    "Don't let coffeebot tell you how to lead your life, you just follow your heart, okay?",
    "Me either. Just drink some other liquid!",
    "Don't worry, no one can tell what you're drinking over hangouts!"
  ];
}

/**
 * @description generates a string for current date
 * @returns {string} "YYYY-MM-DD"
 */
function generatePairingDate() {
  const today = new Date();

  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

/**
 * @description Tracks pairings by storing them in Sheet
 * @param {string[]} emails list of emails of galwegians that were paired
 */
function recordPairing(emails) {
  const recordSheet = getSpreadsheet(RECORD_SHEET_NAME);
  const dateOfPairing = generatePairingDate();

  recordSheet.appendRow([dateOfPairing, emails]);
}

/**
 * @description Generates email message to invite galwegians to join in coffeetime with a colleague
 * @param {string[]} allNames 
 * @param {string[]} allTimezones 
 * @param {string[]} allTopics 
 * @returns {string} email message
 */
function generateEmail(allNames, allTimezones, allTopics) {
  return `
Hey ${allNames}!

You're invited to chat over coffee this week!  

Don't like coffee? ${wellThen()[Math.floor(Math.random()*wellThen().length)]}

When scheduling a time to chat, please mind everyone's timezones, which are: ${allTimezones}

What should you talk about? Well that's up to you, but maybe you could talk about: ${allTopics}

P.S.
${joke()[Math.floor(Math.random()*joke().length)]}

Happy chatting!
Coffeebot ☕🤖
`;
}

/**
 * @description Records the generated pairings for use in upcoming coffeetime
 */
function recordNextPairings(nextPairings) {
  const nextPairingSheet = getSpreadsheet(NEXT_PAIRINGS_SHEET_NAME);

  nextPairingSheet.clearContents();

  nextPairings.forEach(pairing => {
    nextPairingSheet.appendRow([pairing.join(',')]);
  });
}

/**
 * @description Fetch the pairings selected for next coffeetime
 * @returns {string[][]} List of tuples of emails addresses
 */
function getNextPairings() {
  const sheet = getSpreadsheet(NEXT_PAIRINGS_SHEET_NAME);
  const startRow = 1;
  const lastRow = sheet.getLastRow();

  return getSheetValues(sheet, startRow, lastRow, 1, 1).reduce((acc, row) => {
    return acc.concat([row[0].split(',').sort()]);
    }, []); 
}

/**
 * @description Perform pairing of galwegians, record pairings, and send out emails
 * @param {Object<string, string>[]} pairingData @see getPairingData
 * @param {string[]} matches @see getPreviousPairings
 */
function coffeePairingActivate(pairingData, matches) {
  const emailData = matches.map(email => {
    const index = pairingData.findIndex(p => p.email === email);
    return pairingData[index];
  }).reduce((acc, people) => {
    return {
      names: acc.names.concat(people.name),
      emails: acc.emails.concat(people.email),
      timezones: acc.timezones.concat(people.timezone),
      topics: acc.topics.concat(people.topics.split(/\s*,\s*/)),
    };
  }, { names: [], timezones: [], emails: [], topics: [] });
    
  const allTopics = uniqify(emailData.topics).join(', ');
  const allNames = emailData.names.join(' & ');
  const allEmails = emailData.emails.join(',');
  const allTimezones = uniqify(emailData.timezones).join(', ');
  const subject = `Coffee Time with ${allNames}!`;
  const message = generateEmail(allNames, allTimezones, allTopics);

  recordPairing(allEmails);

  MailApp.sendEmail(allEmails, subject, message, {name: "Coffeebot"});
}

/**
 * @description Seeds the coffeetime pairings for upcoming coffeetime,
 *              storing them in the "Next Pairings" Sheet
 */
function generateNextPairings() {
    const pairingData = getPairingData();
    const prevPairings = getPreviousPairings();
    const nextPairings = randomUniquePairing(prevPairings, pairingData);

    recordNextPairings(nextPairings);
}

/**
 * @description Sends emails with data from the current spreadsheet.
 */
function sendEmails() {
  try {
    const pairingData = getPairingData();
    const nextPairings = getNextPairings();

    nextPairings.map(matches => coffeePairingActivate(pairingData, matches));
  } catch (e) {
    logError(e.message);
  }
}
