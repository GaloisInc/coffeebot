# Coffeebot

:coffee: :robot:

Introducing :coffee: :robot: Coffeebot :robot: :coffee:, a bot for randomly pairing up willing participants for a weekly coffee chat!

## :coffee: How's it work? :coffee:

Everyone who would like to participate can sign up using a GoogleSheet. You configure Coffeebot to run weekly (or run manually each week), pairing people up and sending each participant an email letting them know who they have been scheduled to chat with, along with an optional recommendation of topics to chat about. Participants can then find a time that week to schedule a hangout for a half hour coffee chat. 

## Run your own coffeebot!

Follow the instructions in [setup](./setup.md) to set up your own coffeebot instance. No programming knowledge or experience necessary!

**Explanation of the Sheets**

Coffeebot is pretty simple. It uses a Google Spreadsheet for tracking all the data consumed/produced. There are three sheets of note:

* **Signup** - the sheet where people interested in participating enter their name, email, timezone, and a brief list of topics they like to talk about
* **Next Pairings** - the sheet with a randomly selected set of paired people that will be used in the next Coffee Time
* **Past Pairings** - the sheet that tracks all previous pairings to help avoid repeat pairings as much as possible

**Running CoffeeBot**
Running coffeebot is a two-stage process:

1. Generate the next set of pairings to use by invoking the `generateNextPairings` function
2. Send out emails for the latest set of pairings by invoking the `sendEmails` function

**Making Changes**

See [DEVELOPING](./DEVELOPING.md) for information on extending/customizing Coffeebot.

We are not currently accepting PRs or supporting filed issues at this time. However, feel free to fork this repo and modify it to suit your needs.
