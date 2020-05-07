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

function matchedIndices(indices) {
  let currentIndex = indices.length;
  let thirdWheel = indices.length % 2 ? indices.pop() : null;
  const halfLength = indices.length / 2;
  
  const groupA = shuffle(indices.slice(0, halfLength));
  const groupB = shuffle(indices.slice(halfLength));
  const matches = groupA.map((e, i) => [e, groupB[i]]);
  
  if (thirdWheel) {
    matches[0].push(thirdWheel);
  }
  
  return matches;
}

function getMatchData(row) {
  return {
    name: row[0],
    email: row[1],
    timezone: row[2],
    topics: row[3],
  };
}

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
 * Sends emails with data from the current spreadsheet.
 */
function sendEmails() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const startRow = 3;
  const lastRow = sheet.getLastRow();
  const numRows = (lastRow - startRow) + 1;
  const dataRange = sheet.getRange(startRow, 1, numRows, 4);
  const data = dataRange.getValues();
  const indices = (new Array(numRows)).fill().map((e,i) => i);
  
  matchedIndices(indices).map(matches => {
    const emailData = matches.map(k => getMatchData(data[k])).reduce((acc, people) => {
      return {
        names: acc.names.concat(people.name),
        emails: acc.emails.concat(people.email),
        topics: acc.topics.concat(people.topics.split(/\s*,\s*/)),
      };
}, { names: [], emails: [], topics: [] });
    
    const allTopics = uniqify(emailData.topics).join(', ');
    const allNames = emailData.names.join(' and ');
    const allEmails = emailData.emails.join(',');
    const subject = `Coffee Time with ${allNames}!`;
    const message = `
Hey ${allNames}!

You're invited to have coffee together and learn some more about each other.

Some topics to consider: ${allTopics}
`;

    MailApp.sendEmail(allEmails, subject, message);
  });
}
