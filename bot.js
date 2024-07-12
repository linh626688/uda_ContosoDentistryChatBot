// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

const { QnAMaker } = require('botbuilder-ai');
// const DentistScheduler = require('./dentistscheduler');
// const IntentRecognizer = require('./intentrecognizer');

class DentaBot extends ActivityHandler {
    constructor(configuration, qnaOptions) {
        // call the parent constructor
        super();
        console.log('QnAConfiguration', configuration);
        if (!configuration) throw new Error('[QnaMakerBot]: Missing parameter. configuration is required');
        this.QnAMaker = new QnAMaker(configuration.QnAConfiguration, qnaOptions);

        // create a DentistScheduler connector

        // create a IntentRecognizer connector

        this.onMessage(async (context, next) => {
            // Send user input to QnA Maker
            const qnaResults = await this.QnAMaker.getAnswers(context);
            // If an answer was received from QnA Maker, send the answer back to the user.
            console.log('qnaResults', qnaResults);
            if (qnaResults[0]) {
                console.log(qnaResults[0]);
                await context.sendActivity(`${ qnaResults[0].answer }`);
            } else {
                // If no answers were returned from QnA Maker, reply with help.
                await context.sendActivity('I\'m not sure' +
                    'I found an answer to your question' +
                    'You can ask me questions about electric vehicles like "how can I charge my car?"');
            }
            // send user input to QnA Maker and collect the response in a variable
            // don't forget to use the 'await' keyword

            // send user input to IntentRecognizer and collect the response in a variable
            // don't forget 'await'

            // determine which service to respond with based on the results from LUIS //

            // if(top intent is intentA and confidence greater than 50){
            //  doSomething();
            //  await context.sendActivity();
            //  await next();
            //  return;
            // }
            // else {...}

            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Welcom to Dental Office Assistant!, May can I help you';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // by calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.DentaBot = DentaBot;
