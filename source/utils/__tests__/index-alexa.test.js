/*
Mocha tests for the Alexa skill "Hello World" example (https://github.com/alexa/skill-sample-nodejs-hello-world).
Using the Alexa Skill Test Framework (https://github.com/BrianMacIntosh/alexa-skill-test-framework).
Run with 'mocha examples/skill-sample-nodejs-hello-world/helloworld-tests.js'.
*/

// include the testing framework
const alexaTest = require('alexa-skill-test-framework');
const aws = require('aws-sdk');
const AWSMock = require('aws-sdk-mock');
jest.mock("../../../node_modules/aws-sdk");

// initialize the testing framework
alexaTest.initialize(require("../../../index.js"),
	"amzn1.ask.skill.00000000-0000-0000-0000-000000000000",
	"amzn1.ask.account.VOID");

describe("Trivia Skill", function () {
	
	test("Code Compiles", function () {
		var result = "true"
		expect(result).toBe("true")
	});
	
	describe("LaunchIntent", function () {
		aws.config.update({
		    region: "us-east-1",
		    accessKeyId: "bogusaccesskey",
		    secretAccessKey: "bogussecretkey"
		});
		aws.DynamoDB.DocumentClient.prototype.put.mockImplementation((_, cb) => {
			cb(null, null);
		});
		alexaTest.test([
			{
				request: alexaTest.getIntentRequest("LaunchRequest"),
				says: "Welcome to Fun Trivia. You can say play.  What can I help you with?", 
				reprompts: "What can I help you with?", 
				shouldEndSession: false
			}
		]);
	});

	describe("give trivia question and correct answer", function () {
		aws.config.update({
		    region: "us-east-1",
		    accessKeyId: "bogusaccesskey",
		    secretAccessKey: "bogussecretkey"
		});

		aws.DynamoDB.DocumentClient.prototype.get.mockImplementation((params, cb) => {
			console.log("!!!!")
			console.log(params)
			if (params.Key.triviaID == "animal") {
				cb(null, { "Item": {
					"triviaID": "animal",
					"questionKeys": "3"
				}});
			} else {
				cb(null, { "Item": {
					"question": "What is Christine's favorite animal? 1) Cats 2) Dogs 3) Bunnies 4) Horses.", 
					"category": "Animal",
					"answer": "Bunnies",
					"answerNumber": "3",
					"triviaID": "3"
				}});
			}
		});
		aws.DynamoDB.DocumentClient.prototype.put.mockImplementation((_, cb) => {
		  cb(null, null);
		});

		var triviaQuestionIntent= alexaTest.getIntentRequest("GetTriviaQuestion", {"categoryTitle": "Animal"});
		triviaQuestionIntent.request.dialogState = "COMPLETED";
		alexaTest.test([
			{
				request: triviaQuestionIntent,
				says: "What is Christine's favorite animal? 1) Cats 2) Dogs 3) Bunnies 4) Horses.", 
				reprompts: "What is Christine's favorite animal? 1) Cats 2) Dogs 3) Bunnies 4) Horses. Please say one, two, three or four", 
				shouldEndSession: false
			}
		]);
		
		var triviaNumberIntent= alexaTest.getIntentRequest("NumberIntent", {"number": "3", "triviaID": "3"});
		triviaNumberIntent.request.dialogState = "COMPLETED";
 		triviaNumberIntent.session.attributes.triviaID = "3"
		alexaTest.test([
			{
				request: triviaNumberIntent,
				withSessionAttributes: {"triviaID": "3"},
				says: "Correct!", 
				//reprompts: "Please say one, two, three or four", // TODO: add another test to test reprompt when a user responds with 'ice', something that doesn't make sense
				shouldEndSession: true
			}
		]);
	});
	
	describe("give trivia question and incorrect answer", function () {
		aws.config.update({
		    region: "us-east-1",
		    accessKeyId: "bogusaccesskey",
		    secretAccessKey: "bogussecretkey"
		});


		aws.DynamoDB.DocumentClient.prototype.get.mockImplementation((params, cb) => {
			if (params.Key.triviaID == "animal") {
				cb(null, { "Item": {
					"triviaID": "animal",
					"questionKeys": "3"
				}});
			} else {
				cb(null, { "Item": {
					"question": "What is Christine's favorite animal? 1) Cats 2) Dogs 3) Bunnies 4) Horses.", 
					"category": "Animal",
					"answer": "Bunnies",
					"answerNumber": "3",
					"triviaID": "3"
				}});
			}
		});
		aws.DynamoDB.DocumentClient.prototype.put.mockImplementation((_, cb) => {
		  cb(null, null);
		});

		var triviaQuestionIntent= alexaTest.getIntentRequest("GetTriviaQuestion", {"categoryTitle": "Animal"});
		triviaQuestionIntent.request.dialogState = "COMPLETED";
		alexaTest.test([
			{
				request: triviaQuestionIntent,
				says: "What is Christine's favorite animal? 1) Cats 2) Dogs 3) Bunnies 4) Horses.", 
				reprompts: "What is Christine's favorite animal? 1) Cats 2) Dogs 3) Bunnies 4) Horses. Please say one, two, three or four", 
				shouldEndSession: false
			}
		]);
		
		var triviaNumberIntent= alexaTest.getIntentRequest("NumberIntent", {"number": "1", "triviaID": "3"});
		triviaNumberIntent.request.dialogState = "COMPLETED";
 		triviaNumberIntent.session.attributes.triviaID = "3"
		alexaTest.test([
			{
				request: triviaNumberIntent,
				withSessionAttributes: {"triviaID": "3"},
				says: "Sorry, that is incorrect. The correct answer is 'Bunnies'", 
				//reprompts: "Please say one, two, three or four", // TODO: add another test to test reprompt when a user responds with 'ice', something that doesn't make sense
				shouldEndSession: true
			}
		]);
	});
	describe("GetStats", function () {
		aws.config.update({
		    region: "us-east-1",
		    accessKeyId: "bogusaccesskey",
		    secretAccessKey: "bogussecretkey"
		});

		aws.DynamoDB.DocumentClient.prototype.get.mockImplementation((params, cb) => {// Oops, had _ here nd params variable uncommented

			if (params.TableName == "trivia") {
				if (params.Key.triviaID == "animal") {
					cb(null, { "Item": {
						"triviaID": "animal",
						"questionKeys": "3"
					}});
				} else {
					cb(null, { "Item": {
						"question": "What is Christine's favorite animal? 1) Cats 2) Dogs 3) Bunnies 4) Horses.", 
						"category": "Animal",
						"answer": "Bunnies",
						"answerNumber": "3",
						"triviaID": "3"
					}});
				}
			} else {
		  cb(null, { "Item": {"correctAnswers": "6", "numberOfQuestionsAsked": "49"}});
			}
		});
		aws.DynamoDB.DocumentClient.prototype.put.mockImplementation((_, cb) => {
		  cb(null, null);
		});

		var triviaQuestionIntent= alexaTest.getIntentRequest("GetStats");
		triviaQuestionIntent.request.dialogState = "COMPLETED";
		alexaTest.test([
			{
				request: triviaQuestionIntent,
				says: "You have answered 6 out of 49 questions correctly!",
				shouldEndSession: true
			}
		]);
	});
	
	describe("add a question", function () {
		aws.config.update({
		    region: "us-east-1",
		    accessKeyId: "bogusaccesskey",
		    secretAccessKey: "bogussecretkey"
		});

		aws.DynamoDB.DocumentClient.prototype.get.mockImplementation((params, cb) => {// Oops, had _ here nd params variable uncommented

			if (params.TableName == "trivia") {
				if (params.Key.triviaID == "amzn1.ask.account.VOIDfood") {
					cb(null, { "Item": {
						"triviaID": "amzn1.ask.account.VOIDfood",
						"questionKeys": "3"
					}});
				} else {
					cb(null, { "Item": {
						"question": "What is Christine's favorite animal? 1) Cats 2) Dogs 3) Bunnies 4) Horses.", 
						"category": "Animal",
						"answer": "Bunnies",
						"answerNumber": "3",
						"triviaID": "3"
					}});
				}
			} else {
		  cb(null, { "Item": {"correctAnswers": "6", "numberOfQuestionsAsked": "49"}});
			}
		});
		aws.DynamoDB.DocumentClient.prototype.put.mockImplementation((_, cb) => {
		  cb(null, null);
		});

		var triviaQuestionIntent= alexaTest.getIntentRequest("AddQuestion", {
			  "question": "Out of the following, what is a tomato",
			  "category": "food",
			  "correctAnswer": "2",
			  "answers": "Fruit vegetable meat dairy"});
		triviaQuestionIntent.request.dialogState = "COMPLETED";
		alexaTest.test([
			{
				request: triviaQuestionIntent,
				says: "Added your question 'Out of the following, what is a tomato' with category food, answers: Fruit vegetable meat dairy and correct answer 2.", 
				shouldEndSession: true
			}
		]);
		
	});
});
