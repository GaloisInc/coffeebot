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


function joke(){
  return ["Barista: How do you take your coffee?\n Me: Very, very seriously.",
          "Q: Where do birds go for coffee?\nA: To the NESTcafe",
          "Q: What's the opposite of coffee?\nA: Sneezy.",
          "Q: What do you call it when you walk into a cafe you’re sure you’ve been to before?\nA: Déjà brew",
          "Q: Why should you be wary of 5-cent espresso?\nA: It’s a cheap shot.",
          "Q: Why did the espresso keep checking his watch?\nA: Because he was pressed for time.",
          "Drinking too much espresso can cause a latte problems.",
        ]
}

function well_then() {
return ["Don't tell that to coffeebot :( Just keep it to yourself okay?",
        "Don't let coffeebot tell you how to lead your life, you just follow your heart, okay?",
        "Me either. Just drink some other liquid!",
        "Don't worry, no one can tell what you're drinking over hangouts!"
      ]
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
        timezones: acc.timezones.concat(people.timezone),
        topics: acc.topics.concat(people.topics.split(/\s*,\s*/)),
      };
}, { names: [], timezones: [], emails: [], topics: [] });
    
    const allTopics = uniqify(emailData.topics).join(', ');
    const allNames = emailData.names.join(' & ');
    const allEmails = emailData.emails.join(',');
    const allTimezones = emailData.timezones.join(', ');
    const subject = `Coffee Time with ${allNames}!`;
    const message = `
Hey ${allNames}!

You're invited to chat over coffee this week!  

Don't like coffee? ${well_then()[Math.floor(Math.random()*well_then().length)]}

${emailData.names[0]}, could you please take the lead on finding a time that works for everyone?

Please mind everyone's timezones, which are: ${allTimezones}

What should you talk about? Well that's up to you, but maybe you could talk about: ${allTopics}

P.S.
${joke()[Math.floor(Math.random()*joke().length)]}

Happy chatting!
Coffeebot ☕🤖
`;

MailApp.sendEmail(allEmails, subject, message, {name: "Coffeebot"});
  });
}
