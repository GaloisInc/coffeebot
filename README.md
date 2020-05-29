Ted Hille and I are delighted to introduce: :coffee: :robot: Coffeebot :robot: :coffee:, a bot for randomly pairing up willing participants for a weekly coffee chat! 

:coffee: **How's it work?** :coffee:
Coffeebot is opt-in. Everyone who would like to participate can sign up using [this spreadsheet](https://docs.google.com/spreadsheets/d/1veuNRLwbFSkc-OQctHRoN0Z9X7NDvkuMLyJw1X5-bYw/edit?usp=sharing). Coffeebot will run early Monday morning, pairing people up and sending each participant an email letting them know who they have been scheduled to chat with, along with an optional recommendation of topics to chat about. Participants can then find a time that week to schedule a hangout for a 5-30 minute coffee chat. You can bill coffeechat time to Community. 
We're going to run coffeebot as a two week experiment and then run a Q4 to gauge ongoing interest and collect feedback-- if you would like to participate for the next two weeks please sign up!

**Explanation of the Sheets**

Coffeebot is pretty simple. It uses a Google Spreadsheet for tracking all the data consumed/produced. There are three sheets of note:

* **Signup** - the sheet where Galwegians interested in participating enter their name, email, timezone, and a brief list of topics they like to talk about
* **Next Pairings** - the sheet with a randomly selected set of paired Galwegians that will be used in the next Coffee Time
* **Past Pairings** - the sheet that tracks all previous pairings to help avoid repeat pairings as much as possible

**Running CoffeeBot**
Running coffeebot is a two-stage process:

1. Generate the next set of pairings to use by invoking the `generateNextPairings` function
2. Send out emails for the latest set of pairings by invoking the `sendEmails` function

**Making Changes**

If you wish to contribute a feature, clone this repos and edit the `coffeebot.js` file. To test your changes, use the [development copy of the spreadsheet](https://docs.google.com/spreadsheets/d/18fWdgmJVGZw-dJMSSb7sKf67JU-wxSOahQVAZ0cRPd4/edit#gid=0), opening the `Tools`->`Script Editor` and pasting your work in there (or just edit in that pane and when done, copy your changes into this repos). Once you are comfortable with your changes issue an MR and, when it is merged to master, copy your code into the [master spreadsheet](https://docs.google.com/spreadsheets/d/1veuNRLwbFSkc-OQctHRoN0Z9X7NDvkuMLyJw1X5-bYw/edit?ts=5eb1c995#gid=0).
