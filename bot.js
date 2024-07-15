// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

const DentistScheduler = require('./dentistscheduler');
const IntentRecognizer = require('./intentrecognizer');
const { CustomQuestionAnswering } = require('botbuilder-ai');

class DentaBot extends ActivityHandler {
    constructor(configuration, qnaOptions) {
        // call the parent constructor
        super();
        if (!configuration) throw new Error('[QnaMakerBot]: Missing parameter. configuration is required');
        this.QnAMaker = new CustomQuestionAnswering(configuration.QnAConfiguration);

        // create a DentistScheduler connector
        this.DentistScheduler = new DentistScheduler(configuration.SchedulerConfiguration);

        // create a IntentRecognizer connector
        this.IntentRecognizer = new IntentRecognizer(configuration.LuisConfiguration);

        this.onMessage(async (context, next) => {
            const qnaResults = await this.QnAMaker.getAnswers(context);
            // If an answer was received from QnA Maker, send the answer back to the user.
            const luisReponse = await this.IntentRecognizer.executeLuisQuery(context);
            console.log('luisReponse', luisReponse);
            if (luisReponse.prediction.topIntent === 'GetAvailability' &&
                luisReponse.prediction.intents[0].confidence > 0.5 && luisReponse.prediction.entities[0]) {
                const availableSlots = await this.DentistScheduler.getAvailability();
                console.log('availableSlots', availableSlots);
                await context.sendActivity(availableSlots);
                await next();
                return;
            }
            if (luisReponse.prediction.topIntent === 'ScheduleAppointment' &&
                    luisReponse.prediction.intents[0].confidence > 0.5 && luisReponse.prediction.entities[0]) {
                const time = this.IntentRecognizer.getTimeEntity(luisReponse);

                const scheduleTime = await this.DentistScheduler.scheduleAppointment(time);
                console.log('scheduleTime', scheduleTime);

                await context.sendActivity(MessageFactory.text(scheduleTime, scheduleTime));
                await next();
                return;
            }
            if (qnaResults[0]) {
                console.log(qnaResults[0]);
                await context.sendActivity(`${ qnaResults[0].answer }`);
            } else {
                // If no answers were returned from QnA Maker, reply with help.
                await context.sendActivity('I\'m not sure' +
                    'I found an answer to your question' +
                    'You can ask me questions about electric vehicles like "how can I charge my car?"');
            }
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
