const { LuisRecognizer } = require('botbuilder-ai');
const { ConversationAnalysisClient } = require('@azure/ai-language-conversations');
const { AzureKeyCredential } = require('@azure/core-auth');

class IntentRecognizer {
    constructor(config) {
        const luisIsConfigured = config && config.endpointKey && config.endpoint; if (luisIsConfigured) {
            const recognizerOptions = {
                apiVersion: 'v3'
            };

            this.recognizer = new LuisRecognizer(config, recognizerOptions);
        }
        this.recognizer = new ConversationAnalysisClient(
            config.endpoint, new AzureKeyCredential(config.endpointKey));
        this.body = {
            kind: 'Conversation',
            analysisInput: {
                conversationItem: {
                    id: 'id__7863',
                    participantId: 'id__7863',
                    text: ''
                }
            },
            parameters: {
                projectName: 'uda-luis',
                deploymentName: 'uda-luis-deploy'
            }
        };
    }

    get isConfigured() {
        return (this.recognizer !== undefined);
    }

    /**
     * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
     * @param {TurnContext} context
     */
    async executeLuisQuery(context) {
        this.body.analysisInput.conversationItem.text = context.activity.text;
        const { result } = await this.recognizer.analyzeConversation(this.body);

        console.log('prediction', result.prediction);

        return result;
    }

    getTimeEntity(result) {
        console.log('result', result);

        const datetimeEntity = result.entities.datetime;
        if (!datetimeEntity || !datetimeEntity[0]) return undefined;

        const timex = datetimeEntity[0].timex;
        if (!timex || !timex[0]) return undefined;

        const datetime = timex[0];
        return datetime;
    }
}

module.exports = IntentRecognizer;
