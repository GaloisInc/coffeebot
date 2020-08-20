# Coffeebot Setup

Coffeebot runs as a Google Appscript script. This means you wil need a google (ie gmail) account to run coffeebot. To set up coffeebot you'll need to do 3 things: 

1. Set up a Google Sheet spreadsheet with the fields that Coffeebot expects
2. Copy-paste the script into that spreadsheets script-editor
3. Run the script
4. Optionally, set a timer to run coffeebot automatically

Here's a detailed walkthrough of how to do those things:

## Set up a Google Sheet spreadsheet:

1. First, create a new spreadsheet:
    1. Go to drive.google.com
    2. Click the "New" button in the upper left hand corner
    3. Click the "Google Sheets" option in the drop down

2. Rename the spreadsheet from "Untitled spreadsheet" to whatever you like-- perhaps "Coffeebot"

3. Fill out the cells to match the template below:   

![Example spreadsheet](example_coffeebot_spreadsheet.png "Coffeebot Template")

You can name the fields whatever you wish (ie, you can write "Name" instead of "Hello my name is") but the script expects all of that information to be present in that order so it is important that you don't change the order of any of the columns or delete columns.

Replace the example addresses with your email and the email of a friend so that when you run coffeebot you can confirm that you received the email.

4. Rename the sheet from "Sheet1" to "Signup"
    1. The name of the sheet is on a tab in the lower left corner

Coffeebot expects the sign up sheet to be named "Signup" (spelled exactly that way, starting with a capital letter).

## Add the coffeebot script

1. Click the "Tools" button in the toolbar, near the top of the spreadsheet
2. Select "Script Editor" from the drop down menu. This will open a new window.
3. Rename the script from "Untitled project" to whatever you like, perhaps "Coffeebot Script"
3. Delete the example script, and replace it by copy-pasting the coffeebot script:
    1. Open src/coffeebot.js 
    2. Either highlight & copy the entire script, or click the "Copy file contents" clipboard icon in the upper right
    3. Paste into script editor 
    4. Remove the last few lines, starting with `module.exports = {` through the end of the file. These lines are necessary for our tests to run, but unnecessary for the script. 
4. Save the script (either by hitting cmd+S or by choosing "Save" from the "File" dropdown)

## Run coffeebot 

1. In the script editor page, click the "Run" button in the toolbar.
2. Mouse over "Run function" in the drop down; you will see a long list of functions appear in a secondary drop-down to the right. 

Coffeebot runs in two steps to help make it easier to debug in case anything goes wrong. The first step is generating pairings for participants, and the second step is sending emails based on those pairings. We'll need to run each of those two functions. The two functions we need to run show up at the bottom of the list of all functions.

3. Select `generateNextPairings` from the "Run function" secondary drop-down. It is second-to-last in the list.

4. You will get a notification reading "Authorization required". 

This script will need to read and write the spreadsheets you set up, and send emails from your email account, so you need to explicitly give it permission to do that.

If you feel uncomfortable granting this script those permissions, you could create a new gmail account (they're free, and you can have as many as you like) and set up coffeebot to run on that dedicated gmail account to isolate it from any other data you may have in your google account. If you are a programmer familiar with javascript you could also read the script to verify that it only reads / writes this coffeebot spreadsheet and only sends emails relevant to coffeebot.

5. Hit "Review Permissions", and then hit "Allow".
6. If you look at the "Next Pairings" sheet you should now see that the two users are paired for an upcoming coffeechat.

If there is an even number of people, everyone is paired up in a group of two. If there is an odd number of people, coffeebot creates one group of three in addition to all the pairs.

7. Go back to the script editor, and select `sendEmails` from the "Run function" secondary drop-down. It is last in the list.

8. If you replaced the example email addresses with your email address and a friend's email address, both of you should now have an email in your inbox. It looks like this:

```
Hey Évariste Galois & Ada Lovelace!

You're invited to chat over coffee this week!  

Don't like coffee? [1 of 4 responses inserted, such as: "Me either. Just drink some other liquid!"]

When scheduling a time to chat, please mind everyone's timezones, which are: Pacific, Eastern

What should you talk about? Well that's up to you, but maybe you could talk about: solving polynomials, duels, gardening, algorithms, horse races, scifi, traveling

P.S.
[1 of 7 coffee jokes inserted at random, such as, "Drinking too much espresso can cause a latte problems."]

Happy chatting!
Coffeebot ☕🤖
```

If you want to change what the email says, you can do so by editing the text in the `generateEmail` function of the script.

## (Optional) Set up Coffeebot to run on a timer

If you'd like to run coffeebot automatically at regular intervals, you can set it to run on a timer. Below are instructions to set it to run once a week, which you can adapt for any other time period:

1. Go to the script editor window.
2. Click on the "Current project's trigger" button which looks like a pin with a clock in it. It is to the right of the floppy disk icon, and to the left of the "Run" triangle. This will take you to a new window.
3. In the "Triggers" window, click on the "create a new trigger" button, which should be right under the magnifying glass in the middle of the page. This will pop up a window with a few dropdown menus.
4. Configure the dropdowns:
    1. "function to run" should be `generateNextPairings`
    2. leave "which deployment should run" as is
    3. "select event source" should be "Time-driven". Selecting this option will reveal some additional fields. 
    4. "select type of time based trigger". Set this to however often you want to run coffeebot (ie "week timer").
    5. Configure day of the week & time of day as you like.
        You can set it to run at some day / time in the near future to test the functionality, and then reset it to whichever date and time you truly want to use.
    6. You can leave "failure notification settings" as is, or set it to "Notify me immediately".
    7. Hit "Save" to create the trigger.
5. Hit the "+ Add Trigger" button in the lower right, and repeat step 4, but for the "sendEmails" function. Be sure to schedule the `sendEmails` function to run at a time later than the `generateNextPairings` function.

