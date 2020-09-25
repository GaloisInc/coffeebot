const PAIRING_SHEET_NAME = 'Signup';
const NEXT_PAIRINGS_SHEET_NAME = 'Next Pairings';
const RECORD_SHEET_NAME = 'Past Pairings';
const RECORD_SHEET_HEADINGS = ['Pairing Date', 'Paired Emails']
const MAX_PAIRING_TRIES = 20;
const EMAIL_SEPARATOR = ',';

const PAIRING_COLUMNS_MAP = {
  NAME: 0,
  EMAIL: 1,
  TIMEZONE: 2,
  SNOOZE: 3,
  CADENCE: 4,
  TOPICS: 5,
};

/**
 * @description Log error message
 * @param {string} error message to log
 */
function logError(error) {
  Logger.log('ERROR: %s', error);
}

/**
 * @description Get the week of the year (1 offset)
 * @returns {number} 1-53
 * @see https://www.epochconverter.com/weeknumbers
 */
function getWeekOfYear() {
  const target  = new Date();
  const dayNr   = (target.getDay() + 6) % 7;

  target.setDate(target.getDate() - dayNr + 3);

  const firstThursday = target.valueOf();

  target.setMonth(0, 1);

  if (target.getDay() != 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }

  return 1 + Math.ceil((firstThursday - target) / 604800000);
}

/**
 * @description Accessor to get a specific Sheet from our Spreadsheet
 *              if it is unable to find the requested Sheet, it will
 *              create one for us
 * @param {string} name label for sheet needed
 * @returns {Sheet} Sheet requested or newly created Sheet with given name
 */
function getSpreadsheet(name, headings=[]) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    logError(`Unable to find sheet "${name}", creating one`);

    const newSheet = createSheet(spreadsheet, name);

    if (headings.length > 0) {
      newSheet.appendRow(headings);
    }

    return newSheet;
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
 * @returns {string[][]} list of tuples of spreadsheet data
 */
function getSheetValues(sheet, startRow, endRow, startColumn, endColumn) {
  const numRows = (endRow - startRow) + 1;

  if (numRows === 0) return [];

  const dataRange = sheet.getRange(startRow, startColumn, numRows, endColumn);

  return dataRange.getValues();
}

/**
 * @description Utility to serialize given emails for storage
 * @param {string[]} emails 
 * @returns {string} lexically ordered emails joined by configured separator
 */
function serializeEmails(emails) {
  return emails.sort().join(EMAIL_SEPARATOR);
}

/**
 * @description Utility to deserialize emails from storage
 * @param {string} emails lexically ordered emails joined by configured separator
 * @returns {string[]} list of emails in lexicographical order
 */
function deserializeEmails(emails) {
  return emails.split(EMAIL_SEPARATOR).filter(e => e.length > 0).sort();
}

/**
 * @description Generate date for midnight (UTC-0) for today
 * @returns {Date}
 */
function getToday() {
  return new Date(generatePairingDate());
}

/**
 * @description Determine if we should omit this participant from today's pairing
 * @param {Date} today - midnight today (UTC-0)
 * @param {string} snooze - datestring "YYYY/MM/DD" or empty string
 * @param {boolean}
 */
function shouldSnooze(today, snooze) {
  if (snooze) {
    const snoozeDate = new Date(snooze);

    return today.getFullYear() <= snoozeDate.getFullYear() &&
            today.getMonth() <= snoozeDate.getMonth() &&
            today.getDate() <= snoozeDate.getDate();
  }

  return false;
}

/**
 * @description Gets the "Signup" column headings in correct order
 */
function getSignupSheetColumns() {
  return Object.keys(PAIRING_COLUMNS_MAP).sort((a, b) => PAIRING_COLUMNS_MAP[a] - PAIRING_COLUMNS_MAP[b]);
}

/**
 * @description Generates a list of participants, randomly shuffled to use for pairing
 * @returns {Object<string, string>[]} randomized list of key/value dictionaries (@see mapRowDataToPairData) representing participants to pair
 */
function getPairingData() {
  const sheet = getSpreadsheet(PAIRING_SHEET_NAME, getSignupSheetColumns());
  const startRow = 2;
  const lastRow = sheet.getLastRow();
  const participants = getSheetValues(sheet, startRow, lastRow, 1, Object.keys(PAIRING_COLUMNS_MAP).length).map(mapRowDataToPairData);
  const weekOfYear = getWeekOfYear();
  const today = getToday();
  const cadencedParticipants = participants.filter(p => weekOfYear % p.cadence === 0).filter(p => !shouldSnooze(today, p.snooze));

  return shuffle(cadencedParticipants);
}

/**
 * @description Pulls previous pairing information to help minimize repeat pairings
 * @returns {Set<string>} a Set of lexically ordered, comma-separated email addresses of previous pairings
 */
function getPreviousPairingEmails() {
  const sheet = getSpreadsheet(RECORD_SHEET_NAME, RECORD_SHEET_HEADINGS);
  const startRow = 2;
  const lastRow = sheet.getLastRow();

  return getSheetValues(sheet, startRow, lastRow, 1, 2).reduce((acc, row) => {
    acc.add(row[1]);
    return acc;
  }, new Set());
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
  const seen = new Set();
  
  return list.reduce((acc, el) => {
    if (seen.has(el)) {
      return acc;
    } else {
      seen.add(el);
      return acc.concat(el);
    }
  }, []);
}

/**
 * @description Converts tuple representation of participants to key/value dictionary
 * @param {string[]} row tuple representing user to match
 * @param {string} row.0 name
 * @param {string} row.1 email
 * @param {string} row.2 timezone
 * @param {string} row.3 topics
 * @returns {Object<string, string|number>} key/value representation of tuple
 */
function mapRowDataToPairData(row) {
  return {
    cadence: row[PAIRING_COLUMNS_MAP.CADENCE] || 1,
    email: row[PAIRING_COLUMNS_MAP.EMAIL],
    name: row[PAIRING_COLUMNS_MAP.NAME],
    snooze: row[PAIRING_COLUMNS_MAP.SNOOZE] || '',
    timezone: row[PAIRING_COLUMNS_MAP.TIMEZONE] || 'UNKNOWN',
    topics: row[PAIRING_COLUMNS_MAP.TOPICS] || '',
  };
}

/**
 * @description Strives to create a unique, random pairing of 2-3 people
 * @param {Set<string>} prevPairings tuple of emails of previously paired people (@see getPreviousPairingEmails)
 * @param {Object<string, string>[]} participants list of key/value dictionaries of people to pair (@see mapRowDataToPairData)
 * @returns {string[][]} list of tuples of email addresses to use in pairing
 */
function randomUniquePairing(prevPairings, participants) {
  if (participants.length === 0) return [];
  if (participants.length <= 3)  return [participants.map(p => p.email)];

  const findPotentialPair = (poolOfPossiblePairs, userToPair) => {
    const pairCandidateIndex = Math.floor(Math.random() * poolOfPossiblePairs.length);
    const pairCandidate = poolOfPossiblePairs[pairCandidateIndex];
    const potentialPair = [userToPair.email, pairCandidate.email];
    const serializedPairingEmails = serializeEmails(potentialPair);

    return [pairCandidateIndex, potentialPair, serializedPairingEmails];
  }

  const userToPair = participants[0];
  const poolOfPossiblePairs = participants.slice(1);

  let [pairCandidateIndex, potentialPair, serializedPairingEmails] = findPotentialPair(poolOfPossiblePairs, userToPair);
  let numTries = 0;

  while (numTries++ < MAX_PAIRING_TRIES) {
    if (!prevPairings.has(serializedPairingEmails)) break;

    [pairCandidateIndex, potentialPair, serializedPairingEmails] = findPotentialPair(poolOfPossiblePairs, userToPair);
  }

  if (prevPairings.has(serializedPairingEmails)) {
    logError(`Unable to find a novel pairing for ${serializedPairingEmails}`);
  }

  const rest = poolOfPossiblePairs.slice(0, pairCandidateIndex).concat(poolOfPossiblePairs.slice(pairCandidateIndex + 1));

  return [potentialPair].concat(randomUniquePairing(prevPairings, rest));
}

/**
 * @description Joke generator
 * @returns {string} list of coffe jokes
 */
function joke() {
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
 * @returns {string[]} list of witty retorts
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

  return `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
}

/**
 * @description Tracks pairings by storing them in Sheet
 * @param {string[]} emails list of emails of participants that were paired
 */
function recordPairing(emails) {
  const recordSheet = getSpreadsheet(RECORD_SHEET_NAME);
  const dateOfPairing = generatePairingDate();

  recordSheet.appendRow([dateOfPairing, emails]);
}

/**
 * @description Generates email message to invite participants to join in coffeetime with a colleague
 * @param {string} allNames 
 * @param {string} allTimezones 
 * @param {string} allTopics 
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
 * @param {string[][]} nextPairingEmails list of tuples of emails representing next group of participants to pair for coffee
 */
function recordNextPairings(nextPairingEmails) {
  const nextPairingSheet = getSpreadsheet(NEXT_PAIRINGS_SHEET_NAME);

  nextPairingSheet.clearContents();

  nextPairingEmails.forEach(emails => {
    nextPairingSheet.appendRow([serializeEmails(emails)]);
  });
}

/**
 * @description Fetch the pairings selected for next coffeetime
 * @returns {string[][]} List of tuples of emails addresses
 */
function getNextPairingMatchupEmails() {
  const sheet = getSpreadsheet(NEXT_PAIRINGS_SHEET_NAME);
  const startRow = 1;
  const lastRow = sheet.getLastRow();

  return getSheetValues(sheet, startRow, lastRow, 1, 1).reduce((acc, row) => {
    return acc.concat([deserializeEmails(row[0])]);
  }, []); 
}

/**
 * @description Perform pairing of participants, record pairings, and send out emails
 * @param {Object<string, string>[]} pairingData @see getPairingData
 * @param {string[]} matchups @see getPreviousPairings
 */
function coffeePairingActivate(pairingData, matchups) {
  const emailData = matchups.map(email => {
    const index = pairingData.findIndex(participant => participant.email === email);
    return pairingData[index];
  }).reduce((acc, participant) => {
    return {
      names: acc.names.concat(participant.name),
      emails: acc.emails.concat(participant.email),
      timezones: acc.timezones.concat(participant.timezone),
      topics: acc.topics.concat(participant.topics.split(/\s*,\s*/)),
    };
  }, { names: [], timezones: [], emails: [], topics: [] });
    
  const allTopics = uniqify(emailData.topics).join(', ');
  const allNames = emailData.names.join(' & ');
  const allTimezones = uniqify(emailData.timezones).join(', ');
  const allEmails = serializeEmails(emailData.emails);
  const subject = `Coffee Time with ${allNames}!`;
  const message = generateEmail(allNames, allTimezones, allTopics);

  recordPairing(allEmails);

  MailApp.sendEmail(allEmails, subject, message, { name: 'Coffeebot' });
}

/**
 * @description Creates initial "Signup" sheet
 */
function generateInitialSignupSheet() {
  getSpreadsheet(PAIRING_SHEET_NAME, getSignupSheetColumns());
}

/**
 * @description Seeds the coffeetime pairings for upcoming coffeetime,
 *              storing them in the "Next Pairings" Sheet
 */
function generateNextPairings() {
    const pairingData = getPairingData();
    const prevPairingEmails = getPreviousPairingEmails();
    const nextPairings = randomUniquePairing(prevPairingEmails, pairingData);

    recordNextPairings(nextPairings);
}

/**
 * @description Sends emails with data from the current spreadsheet.
 */
function sendEmails() {
  try {
    const pairingData = getPairingData();
    const nextPairingMatchupEmails = getNextPairingMatchupEmails();

    nextPairingMatchupEmails.map(emails => coffeePairingActivate(pairingData, emails));
  } catch (e) {
    logError(e.message);
  }
}

module.exports = {
  deserializeEmails,
  generateInitialSignupSheet,
  generateNextPairings,
  getToday,
  mapRowDataToPairData,
  randomUniquePairing,
  sendEmails,
  serializeEmails,
  shouldSnooze,
  uniqify,
};
