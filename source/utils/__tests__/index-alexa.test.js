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
		  cb(null, { "Item": {
			  "question": "What is Christine's favorite animal? 1) Cats 2) Dogs 3) Bunnies 4) Horses.", 
			  "category": "Animal",
			  "answerNumber": "3",
			  "triviaID": "3"
		  }});
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
		  cb(null, { "Item": {
			  "question": "What is Christine's favorite animal? 1) Cats 2) Dogs 3) Bunnies 4) Horses.", 
			  "category": "Animal",
			  "answerNumber": "3",
			  "answer": "Bunnies",
			  "triviaID": "3"
		  }});
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
		  cb(null, { "Item": { "question": "What is Christine's favorite animal? 1) Cats 2) Dogs 3) Bunnies 4) Horses.", 
			  "category": "Animal",
			  "answerNumber": "3",
			  "answer": "Bunnies",
			  "triviaID": "3"}});
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
	
	
	describe("AddQuestion", function () {
		aws.config.update({
		    region: "us-east-1",
		    accessKeyId: "bogusaccesskey",
		    secretAccessKey: "bogussecretkey"
		});

		aws.DynamoDB.DocumentClient.prototype.get.mockImplementation((params, cb) => {// Oops, had _ here nd params variable uncommented

			if (params.TableName == "trivia") {
		  cb(null, { "Item": {
			  "question": "Out of the following, what is a tomato? ",
			  "correctAnswer": "3",
			  "answers": " Fruit, vegetable, meat, dairy"}});
			} else {
// 		  cb(null, { "Item": {"correctAnswers": "6", "numberOfQuestionsAsked": "49"}});
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

		aws.DynamoDB.DocumentClient.prototype.get.mockImplementation((params, cb) => {
		  cb(null, null);
		});
		
		aws.DynamoDB.DocumentClient.prototype.put.mockImplementation((_, cb) => {
		  cb(null, null);
		});

		var triviaQuestionIntent= alexaTest.getIntentRequest("AddQuestion", {
			  "question": "Out of the following, what is a tomato?",
			  "correctAnswer": "2",
			  "answers": " Fruit, vegetable, meat, dairy"});
		triviaQuestionIntent.request.dialogState = "COMPLETED";
		alexaTest.test([
			{
				request: triviaQuestionIntent,
				says: "Added your question 'Out of the following, what is a tomato?' with answers Fruit, vegetable, meat, dairy and correct answer 2.", 
				shouldEndSession: true
			}
		]);
		
	});
	
});
  
// const index = require("../../../index"); 
// jest.dontMock("../../../index");

// describe('Test index', function () {

//   it('works', function () {
// 	  var promise = index.handler({
// 	"version": "1.0",
// 	"session": {
// 		"new": true,
// 		"sessionId": "amzn1.echo-api.session.bbccfccb-f9bc-44e9-aa0e-f169e57e60f6",
// 		"application": {
// 			"applicationId": "amzn1.ask.skill.7f8652f9-6c8a-4f18-84eb-0a29b69371d9"
// 		},
// 		"user": {
// 			"userId": "amzn1.ask.account.AHFDILR2KTNEQD3ZGVEHFN7I4NBM542SIDJHEEZ2MUPEZTHOSGLDDU65W2AEXBOFYASBW5AA5U23UWBMQHOPXAL66LXBWPAU4RZT37WMGHHU7DC5DXQLAAZFJ7AX43O7K5R2FVEXJDU47YV5ZF4FM6WHIRI5NM7WK4F5VDZQQFCPEGHDM5BLBZ2O6JAIUO6K4VJ5GHVLLJUVNQY"
// 		}
// 	},
// 	"context": {
// 		"Viewports": [
// 			{
// 				"type": "APL",
// 				"id": "main",
// 				"shape": "RECTANGLE",
// 				"dpi": 213,
// 				"presentationType": "STANDARD",
// 				"canRotate": false,
// 				"configuration": {
// 					"current": {
// 						"mode": "HUB",
// 						"video": {
// 							"codecs": [
// 								"H_264_42",
// 								"H_264_41"
// 							]
// 						},
// 						"size": {
// 							"type": "DISCRETE",
// 							"pixelWidth": 1280,
// 							"pixelHeight": 800
// 						}
// 					}
// 				}
// 			}
// 		],
// 		"Viewport": {
// 			"experiences": [
// 				{
// 					"arcMinuteWidth": 346,
// 					"arcMinuteHeight": 216,
// 					"canRotate": false,
// 					"canResize": false
// 				}
// 			],
// 			"mode": "HUB",
// 			"shape": "RECTANGLE",
// 			"pixelWidth": 1280,
// 			"pixelHeight": 800,
// 			"dpi": 213,
// 			"currentPixelWidth": 1280,
// 			"currentPixelHeight": 800,
// 			"touch": [
// 				"SINGLE"
// 			],
// 			"video": {
// 				"codecs": [
// 					"H_264_42",
// 					"H_264_41"
// 				]
// 			}
// 		},
// 		"Extensions": {
// 			"available": {
// 				"aplext:backstack:10": {}
// 			}
// 		},
// 		"System": {
// 			"application": {
// 				"applicationId": "amzn1.ask.skill.7f8652f9-6c8a-4f18-84eb-0a29b69371d9"
// 			},
// 			"user": {
// 				"userId": "amzn1.ask.account.AHFDILR2KTNEQD3ZGVEHFN7I4NBM542SIDJHEEZ2MUPEZTHOSGLDDU65W2AEXBOFYASBW5AA5U23UWBMQHOPXAL66LXBWPAU4RZT37WMGHHU7DC5DXQLAAZFJ7AX43O7K5R2FVEXJDU47YV5ZF4FM6WHIRI5NM7WK4F5VDZQQFCPEGHDM5BLBZ2O6JAIUO6K4VJ5GHVLLJUVNQY"
// 			},
// 			"device": {
// 				"deviceId": "amzn1.ask.device.AHTX5KBGX3JW44GMZUDA4UTSD7VNXH7MFHREWOIDVYEHM3G45Z7M3RPBW4I4KPTTI5IQRB455JLCKHFPHXUXA5NMERYAZAICIRMKRQKZCIQKBUFDI6AL2D25FAIEUABSC34WRDOQCBUQJR2G336XBXT2Q2VA",
// 				"supportedInterfaces": {}
// 			},
// 			"apiEndpoint": "https://api.amazonalexa.com",
// 			"apiAccessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJhdWQiOiJodHRwczovL2FwaS5hbWF6b25hbGV4YS5jb20iLCJpc3MiOiJBbGV4YVNraWxsS2l0Iiwic3ViIjoiYW16bjEuYXNrLnNraWxsLjdmODY1MmY5LTZjOGEtNGYxOC04NGViLTBhMjliNjkzNzFkOSIsImV4cCI6MTYyNTA5NTU5OSwiaWF0IjoxNjI1MDk1Mjk5LCJuYmYiOjE2MjUwOTUyOTksInByaXZhdGVDbGFpbXMiOnsiY29udGV4dCI6IkFBQUFBQUFBQUFDWVRKS1Z2SHROT3RVMXVvWUdPQ21CSkFFQUFBQUFBQUIvd1pXOThRRWlFU3JvOXZoRW5pVFZpcGlXZS8zNjF6TGJMZDV2Mit2QUpBdGVuNkh6YndrTlBoS0xEM2xNTE9tcE9aNTNoa3VRczZmeW95Q280Y2QyY2hNNmJJTW1hWldWK2FMSWV1eXdmUlJKTHdqRlZ3cWJoeWhnbUVPTHREZXkwK2pkSWNCU0MwNHpKd1E1UXJZamlybERRRG9tbDUwbUg1OGlZa3p3cjA1cXhUZlRGcWRva09qeG5lbzBQbXB2K09CTXB5akxTUmlrbS9OUWlYa2tUdWFoT3p1cnVmNHBsTktiODhzTXY5emwwUG94RzZ3L1VYSzVjcW1YVDZKcXlNR2R5bndJWGMra2FWK1dvdU41M3ZwZkRFMjNFMVJPcHpmT0YyalRKZjlsSUpwN3VUVjQ5eEhDL2RXcG9BaUNLOGFhaE1PNUNjVHQ5aGlCRDlmNDdxUGs4dkpiMG1JdkUzb3pwUFN0dVBjdzh5YTBqSDJPOCtUOG5GTmwyNmNWQkpZMyIsImNvbnNlbnRUb2tlbiI6bnVsbCwiZGV2aWNlSWQiOiJhbXpuMS5hc2suZGV2aWNlLkFIVFg1S0JHWDNKVzQ0R01aVURBNFVUU0Q3Vk5YSDdNRkhSRVdPSURWWUVITTNHNDVaN00zUlBCVzRJNEtQVFRJNUlRUkI0NTVKTENLSEZQSFhVWEE1Tk1FUllBWkFJQ0lSTUtSUUtaQ0lRS0JVRkRJNkFMMkQyNUZBSUVVQUJTQzM0V1JET1FDQlVRSlIyRzMzNlhCWFQyUTJWQSIsInVzZXJJZCI6ImFtem4xLmFzay5hY2NvdW50LkFIRkRJTFIyS1RORVFEM1pHVkVIRk43STROQk01NDJTSURKSEVFWjJNVVBFWlRIT1NHTEREVTY1VzJBRVhCT0ZZQVNCVzVBQTVVMjNVV0JNUUhPUFhBTDY2TFhCV1BBVTRSWlQzN1dNR0hIVTdEQzVEWFFMQUFaRko3QVg0M083SzVSMkZWRVhKRFU0N1lWNVpGNEZNNldISVJJNU5NN1dLNEY1VkRaUVFGQ1BFR0hETTVCTEJaMk82SkFJVU82SzRWSjVHSFZMTEpVVk5RWSJ9fQ.cQeSXfxUOciQcWMxrgKgpHTEhktJSXsFLzO98165P2GGfe7FtMRRGraudER7h5_ibNjyzztrjQib1n2k7OmHwtjQKf6d5pepPqbthd53CBE-M10AYb8ObUscqOqgpMItYQzGH1-DPbKetNBDc5z3VAGu8GSFb75S0OQj_CVLz7hY2SCNh6KTd6d7kfH-RzNi6hxhTLBgxLFA9IKRXzzBgyB0rhepBPUAASRLAezfb9BEsDcl6Mc3Svnwu7j6_pKEdxnhbP_m03PrOysql1aCwoTqnEsUZRAMKxnqR0wgBg4m0f3iKxN7hNTH60kHxkjSpsBnYJDzGKfAcTJN8eVD1w"
// 		}
// 	},
// 	"request": {
// 		"type": "IntentRequest",
// 		"requestId": "amzn1.echo-api.request.373dbe00-68ae-4388-a0eb-76b47bdcbc3e",
// 		"locale": "en-US",
// 		"timestamp": "2021-06-30T23:21:39Z",
// 		"intent": {
// 			"name": "GetTriviaQuestion",
// 			"confirmationStatus": "NONE",
// 			"slots": {
// 				"categoryTitle": {
// 					"name": "categoryTitle",
// 					"value": "Bible Trivia Made Easy",
// 					"resolutions": {
// 						"resolutionsPerAuthority": [
// 							{
// 								"authority": "AlexaEntities",
// 								"status": {
// 									"code": "ER_SUCCESS_MATCH"
// 								},
// 								"values": [
// 									{
// 										"value": {
// 											"name": "Bible Trivia Made Easy",
// 											"id": "https://ld.amazonalexa.com/entities/v1/6UGu15aIX9lFXQl2k7DuL9"
// 										}
// 									},
// 									{
// 										"value": {
// 											"name": "Bible Trivia Challenge",
// 											"id": "https://ld.amazonalexa.com/entities/v1/7wMVeSwgmurF9DI5D8iOW0"
// 										}
// 									},
// 									{
// 										"value": {
// 											"name": "1001 Bible Trivia Questions",
// 											"id": "https://ld.amazonalexa.com/entities/v1/2sCaMiAw8dwCcjblDvdY1v"
// 										}
// 									},
// 									{
// 										"value": {
// 											"name": "2015 Bible Trivia Challenge",
// 											"id": "https://ld.amazonalexa.com/entities/v1/3ipGMnHecfZEKG4ZruAjR4"
// 										}
// 									},
// 									{
// 										"value": {
// 											"name": "1001 Bible Trivia Questions",
// 											"id": "https://ld.amazonalexa.com/entities/v1/8iuLAnxt9BkBoaZimRQa3q"
// 										}
// 									}
// 								]
// 							}
// 						]
// 					},
// 					"confirmationStatus": "NONE",
// 					"source": "USER"
// 				}
// 			}
// 		},
// 		"dialogState": "COMPLETED"
// 	}
// }, "")
// 	var response = await promise
//     expect(response).toEqual({
// 	"body": {
// 		"version": "1.0",
// 		"response": {
// 			"outputSpeech": {
// 				"type": "SSML",
// 				"ssml": "<speak> Who parted the red sea with God's help? 1) Adam 2) Moses 3) Ruth 4) Joseph </speak>"
// 			},
// 			"reprompt": {
// 				"outputSpeech": {
// 					"type": "SSML",
// 					"ssml": "<speak> Christine Trivia </speak>"
// 				}
// 			},
// 			"shouldEndSession": false,
// 			"type": "_DEFAULT_RESPONSE"
// 		},
// 		"sessionAttributes": {
// 			"triviaID": "1"
// 		},
// 		"userAgent": "ask-nodejs/1.0.24 Node/v14.17.0"
// 	}
// 	});
//   });
// });
