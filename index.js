/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * Description:
Do you ever wonder what you have in your fridge, freezer, or cabinets, but don't want to dig around?
Do you ever wonder how long those leftovers have been in the fridge?

Track your food with this skill, and I will let you know from the comfort of your couch!

Here are some examples of what you can say:
- Add {milk} to {fridge} {top shelf/bottom drawer/top drawer/second drawer/side door/other}
- Do I have {milk}?
- Move {milk} to {fridge} {top shelf}
- Undo addition (will remove the most recent food addition)
- Suggest food
- Suggest recipe/supper/breakfast/a meal
- list food
- list food from the fridge
- Remove/I ate/I drank {milk} (can also say from fridge top shelf)
- Add {milk} to {fridge} {top shelf} to use by {use by date}
- Mark {mustard} as condiment

If you say "Alexa, open food tracker", I will also remind you of what I can do.
If you say, "Alexa, ask food tracker for help"
**/

'use strict';
const Alexa = require('alexa-sdk');
const awsSDK = require('aws-sdk');
const promisify = require('es6-promisify');
const request = require('request');
const list = require('./list.json');
const large = require('./large.json');
const open = require('./open.json');

const APP_ID = "amzn1.adg.product.7570f523-b395-4322-a533-a1668a5f862a";  // TODO replace with your app ID (OPTIONAL).
const table = 'triviaUsers';
const docClient = new awsSDK.DynamoDB.DocumentClient();

// convert callback style functions to promises
const dbScan = promisify(docClient.scan, docClient);
const dbGet = promisify(docClient.get, docClient);
const dbPut = promisify(docClient.put, docClient);
const dbDelete = promisify(docClient.delete, docClient);


const handlers = {
    'LaunchRequest': function () {
		// "open food tracker"
		// Certification Requirement to state name of skill
	    const speechOutput = this.t('WELCOME') + " " + this.t('HELP_REPROMPT');
        const reprompt = this.t('HELP_REPROMPT');
		if (supportsAPL.call(this, null)) {
			this.response.speak(speechOutput);
			this.response.listen(reprompt);
			open['dataSources']['bodyTemplate6Data']['textContent']['primaryText']['text'] = "Welcome to Daily Bread"
			this.response._addDirective({
				type: 'Alexa.Presentation.APL.RenderDocument',
				version: '1.0',
				document: open['document'],
				datasources: open['dataSources']
			})
			this.emit(':responseReady');
		} else {
			this.emit(':ask', speechOutput, reprompt);
		}
    },

    'GiveLink': function () {

		// checkIfUserExists.call(this, userId)
		//   .then(function (existingData) {
			  const { userId, accessToken } = this.event.session.user;
			if (!accessToken) {
				//this.alexaSkill().showAccountLinkingCard();
				//card type: LinkAccount
				this.emit(':tellWithLinkAccountCard', 'Please go to your Alexa app and link your Account so I can send you daily emails.');
			} else {
				// getData.call(this, accessToken).then(function(data){
				let url =
				'https://api.amazon.com/user/profile?access_token=' + accessToken;// this.getAccessToken();//this.event.context.System.apiEndpoint+"/v2/accounts/~current/settings/Profile.email";
				const options = {
					url: url,
					method: 'GET',
					headers: {
						'Accept': 'application/json',
						Authorization: "Bearer " + this.event.context.System.apiAccessToken
					}
				};
				request(options, (error, response, body) => {
					if (!error && response.statusCode === 200) {

						let data = JSON.parse(body); // Store the data we got from the API request
						//console.log(data)
						//TODO:  make a method that returns data, takes in accessToken. In every single method, change
						// userId to a var and replace with data.user_id if accessToken exists.

						/*
						* Depending on your scope you have access to the following data:
						* data.user_id : "amzn1.account.XXXXYYYYZZZ"
						* data.email : "email@jovo.tech"
						* data.name : "Kaan Kilic"
						* data.postal_code : "12345"
						*/
						//this.tell(data.name + ', ' + data.email); // Output: Kaan Kilic, email@jovo.tech

            var dynamoParams = {
        		  TableName: "dailyBreadUsers",
        		  Item: {
                userID: data.user_id,
                email: data.email,
                name: data.name,
                postal_code: data.postal_code,
          			updated: Date.now()
        		  }
        		};
						dbPut(dynamoParams).then(function(existingData) {
						// const checkIfUserExistsParams = {
						// 	TableName: table,
						// 	Key: {
						// 		userID: userId
						// 	}
						// };
						//console.log("Will delete "+userId)
						//dbDelete(checkIfUserExistsParams);
						var urlToAccess = "https://s3.amazonaws.com/food-tracker/index.html";
						var email = data.email;//'randa164@d.umn.edu';
						console.log(email)//or just data with permissions url
            var params = {
              TableName: "dailyBreadVerses",
              Key: {
                date: "2019-11-10"//+" "+userId
              }
            };
            dbGet(params).then(function(item) {
						// Create sendEmail params
						var params = {
						  Destination: {
							CcAddresses: [
							],
							ToAddresses: [
							  email
							]
						  },
						  Message: {
							Body: {
							  Html: {
							   Charset: "UTF-8",
							   Data: "<b>Thank you for signing up for Daily Bread emails!</b><br><br>Feel free to ask me any questions by replying to this email.<br>God Bless!<br>Here are a couple of verses to inspire you:"+
                 "<br>Acts 17:11: \"... in that they received the word with all readiness of mind, and searched the scriptures daily ...\" (KJV)"+
                 "<br>James 2:17: \"Even so faith, if it hath not works, is dead...\" (KJV)"+
                 "<br>Luke 6:31: And as ye would that men should do to you, do ye also to them likewise. (KJV)"+
                 "<br><a href=https://www.biblegateway.com/passage/?search=Luke+6%3A31&version=NIV;KJV>https://www.biblegateway.com/passage/?search=Luke+6%3A31&version=NIV;KJV</a>"+
                 "<br><br>With Love, Christine<br><br><p>"+"</p>"+//email//urlToAccess//"HTML_FORMAT_BODY"
                 ".<br><img src=https://daily-bread.s3.amazonaws.com/icon_108_A2Z.png alt='Daily Bread Logo'></img>"+
                 "<p><i>If you ever wish to unsubscribe for any reason, you can respond to this email and I will remove you, or you can remove yourself by saying to Alexa: 'Alexa, ask daily bread to deregister'.<i></p>"
							  },
							  Text: {
							   Charset: "UTF-8",
							   Data: "Thank you for signing up for Daily Bread emails! Feel free to ask me any questions by replying to this email. God Bless! With Love, Christine Be the change you want to see in the world :)  "+item.Item.verses+" "+//email//urlToAccess//"HTML_FORMAT_BODY"
                 "If you ever wish to unsubscribe for any reason, you can respond to this email and I will remove you, or you can remove yourself by saying to Alexa: 'Alexa, ask daily bread to deregister'."
							  }
							 },
							 Subject: {
							  Charset: 'UTF-8',
							  Data: 'Daily Bread: Thank you!'
							 }
							},
						  Source: 'Christine.DailyBreadVerses@gmail.com', /* required */
						  ReplyToAddresses: [
							  'Christine.DailyBreadVerses@gmail.com',
						  ],
						};

  						// Create the promise and SES service object
  						var sendPromise = new awsSDK.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

  						// Handle promise's fulfilled/rejected states
  						 sendPromise.then(
  						  function(data) {
  							// console.log(data.MessageId);
  							// Add the auth to the table
  							this.emit(':tell', "Thanks for signing up for daily bread emails! I've sent you an email! If you do not see it, check your spam (and mark as not spam). And, if you still don't see it, please ensure your email associated with your Amazon account is a valid email address.");
  							}.bind(this)).catch(
  							function(err) {
  							 console.error(err, err.stack);
  							// this.emit(':ask', this.t('SORRY'));
  							this.emit(':tell', "There was a problem sending you an email. Please check your account or try again later.");
  							}.bind(this));
              }.bind(this))
						}.bind(this)).catch(
							function(err) {
							console.error(err, err.stack);
							this.emit(':ask', this.t('SORRY'));
						  }.bind(this));
					} else {
						console.log(error);
						console.log(response);
						this.emit(':ask', this.t('SORRY'));
					}
				})
				// }.bind(this)).catch(
							// function(err) {
							// console.error(err, err.stack);
							// this.emit(':ask', this.t('SORRY'));
						  // }.bind(this));
			}
  	// 	}.bind(this)).catch(err => {
		// 	console.error(err);
		// 	this.emit(':ask', this.t('SORRY'));
		// });
    },

    'GiveLinkForAll': function () {

            // let data = JSON.parse(body); // Store the data we got from the API request
            //console.log(data)
            //TODO:  make a method that returns data, takes in accessToken. In every single method, change
            // userId to a var and replace with data.user_id if accessToken exists.

            /*
            * Depending on your scope you have access to the following data:
            * data.user_id : "amzn1.account.XXXXYYYYZZZ"
            * data.email : "email@jovo.tech"
            * data.name : "Kaan Kilic"
            * data.postal_code : "12345"
            */
            //this.tell(data.name + ', ' + data.email); // Output: Kaan Kilic, email@jovo.tech

            var dynamoParams = {
              TableName: "dailyBreadUsers"
            };
            dbScan(dynamoParams).then(function(allData) {

            var urlToAccess = "https://s3.amazonaws.com/daily-bread/index.html";

            const today = new Date(Date.now());
            const year = 1900 + today.getYear();
            var month = today.getMonth() + 1;
	if (month < 10) {
		month = "0" + month;
	}
            var day = today.getDate();
            if (day < 10) {
              day = "0" + day;
            }
            const title = year +"-"+month+'-'+day;
            var params = {
              TableName: "dailyBreadVerses",
              Key: {
                date: title
              }
            };
            console.log(title)
            dbGet(params).then(function(item) {

              var emails = [];
              console.log(allData);

              for (let data in allData.Items) {
                console.log(allData.Items[data]);
                var email = allData.Items[data].email;
                // Create sendEmail params
                var audioClip = ""
                if (item.Item.audioUrl) {
                  audioClip = "<br>Audio clip: <a href="+item.Item.audioUrl+">Listen to this verse</a>";
                }
                var videoClip = ""
                if (item.Item.videoUrl) {
                  videoClip = "<br>Video clip with reading: <a href="+item.Item.videoUrl+">Listen & read along to this verse</a>";
                }
                var verses = item.Item.verses;
                verses = verses.replace(/\n/g, "<br />");
                var params = {
                  Destination: {
                  CcAddresses: [
                  ],
                  ToAddresses: [
                    email
                  ]
                  },
                  Message: {
                  Body: {
                    Html: {
                     Charset: "UTF-8",
                     Data: "<p>"+verses+"</p>Read other translations: <a href="+item.Item.url+">"+item.Item.url+"</a>"+audioClip+videoClip+"<br><br> Date: "+item.Item.date+"<br><p>Love, Christine</p>"+
                     ".<br>Acts 17:11: \"... in that they received the word with all readiness of mind, and searched the scriptures daily ...\" (KJV)<br>"+
                     "<img src=https://daily-bread.s3.amazonaws.com/icon_108_A2Z.png alt='Daily Bread Logo'></img>"+
                     "<p><i>If you ever wish to unsubscribe for any reason, you can respond to this email and I will remove you, or you can remove yourself by saying to Alexa: 'Alexa, ask daily bread to deregister'. You can always sign up later again by saying: 'Alexa, ask daily bread to sign up for emails'</i></p>"
                     //email//urlToAccess//"HTML_FORMAT_BODY"
                    },
                    Text: {
                     Charset: "UTF-8",
                     Data: ""+item.Item.verses+" "+item.Item.url+" Date: "+item.Item.date+" Love, Christine "+
                     "Acts 17:11: \"... in that they received the word with all readiness of mind, and searched the scriptures daily ...\" (KJV) "+
                     "If you ever wish to unsubscribe for any reason, you can respond to this email and I will remove you when I check my email, or you can remove yourself by saying to Alexa: 'Alexa, ask daily bread to deregister'. You can always sign up later again by saying: 'Alexa, ask daily bread to sign up for emails'"
                    }
                   },
                   Subject: {
                    Charset: 'UTF-8',
                    Data: 'Daily Bread: '+item.Item.title
                   }
                  },
                  Source: 'Christine.DailyBreadVerses@gmail.com', /* required */
                  ReplyToAddresses: [
                    'Christine.DailyBreadVerses@gmail.com',
                  ],
                };

                //params.Destination.BccAddresses = emails;

                  // Create the promise and SES service object
                  var sendPromise = new awsSDK.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

                  // Handle promise's fulfilled/rejected states
                   sendPromise.then(
                    function(data) {
                    console.log("Successfully sent emails");
                    // Add the auth to the table
                    this.emit(':tell', "I've sent everyone an email!");
                    }.bind(this)).catch(
                    function(err) {
                     console.error(err, err.stack);
                 emails.push(allData.Items[data].email);
                    this.emit(':tell', "There was a problem sending everyone an email.");
                    }.bind(this));
              }
              console.log("failure emails:")
              console.log(emails)

              }.bind(this));

            }.bind(this)).catch(
              function(err) {
              console.error(err, err.stack);
              this.emit(':ask', this.t('SORRY'));
              }.bind(this));
    },
    'GiveLinkForDate': function () {
		var filledSlots = this.event.request.intent;
    const name = filledSlots.slots.date.value; // milk
    console.log("GiveLinkForDate")
console.log(this)
        const { userId, accessToken } = this.event.session.user;
        /// Check if user has subscription
        ///
        console.log(this.event.context.System.apiAccessToken)
        if (this.event.context.System.apiAccessToken) {

      if (!accessToken) {
        this.emit(':tellWithLinkAccountCard', 'Please link your Account so I can send you emails.');
      } else {
        let url =
        'https://api.amazon.com/user/profile?access_token=' + accessToken;
        const options = {
          url: url,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            Authorization: "Bearer " + this.event.context.System.apiAccessToken
          }
        };
        request(options, (error, response, body) => {
          if (!error && response.statusCode === 200) {

            let data = JSON.parse(body); // Store the data we got from the API request
            // userId = data.user_id
            //console.log(data)

            const options2 = {
              uri: 'https://api.amazonalexa.com/v1/users/~current/skills/~current/inSkillProducts',
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Accept-Language': this.event.request.locale,
                Authorization: "bearer " + this.event.context.System.apiAccessToken
              }
            };
            request(options2, (error2, response2, body2) => {
              if (!error2 && response2.statusCode === 200) {
                let data2 = JSON.parse(body2);

                let product = data2.inSkillProducts[0];
                console.log(product)
                if (product.entitled == "ENTITLED") {
                  //TODO:  make a method that returns data, takes in accessToken. In every single method, change
                  // userId to a var and replace with data.user_id if accessToken exists.

                  /*
                  * Depending on your scope you have access to the following data:
                  * data.user_id : "amzn1.account.XXXXYYYYZZZ"
                  * data.email : "email@jovo.tech"
                  * data.name : "Kaan Kilic"
                  * data.postal_code : "12345"
                  */
                  //this.tell(data.name + ', ' + data.email); // Output: Kaan Kilic, email@jovo.tech

                  // var dynamoParams = {
                  //   TableName: "dailyBreadUsers",
                  //   Item: {
                  //     date: data.user_id,
                  //     userID: data.user_id,
                  //     email: data.email,
                  //     name: data.name,
                  //     // postal_code: data.postal_code,
                  //     updated: Date.now()
                  //   }
                  // };
                  // dbPut(dynamoParams).then(function(existingData) {
                  var urlToAccess = "https://s3.amazonaws.com/food-tracker/index.html";
                  var email = data.email;//'randa164@d.umn.edu';
                  console.log(email)//or just data with permissions url
                  var params = {
                    TableName: "dailyBreadVerses",
                    Key: {
                      date: name// "2019-11-11"
                    }
                  };
                  dbGet(params).then(function(item) {
                    if (item.Item) {
                  // Create sendEmail params
                  var audioClip = ""
                  if (item.Item.audioUrl) {
                    audioClip = "<br>Audio clip: <a href="+item.Item.audioUrl+">Listen to this verse</a>";
                  }
                  var videoClip = ""
                  if (item.Item.videoUrl) {
                    videoClip = "<br>Video clip with reading: <a href="+item.Item.videoUrl+">Listen & read along to this verse</a>";
                  }
                  var verses = item.Item.verses;
                  verses = verses.replace(/\n/g, "<br />");
                  var params = {
                    Destination: {
                    CcAddresses: [
                    ],
                    ToAddresses: [
                      email
                    ],//, BCC instead?
                    // BccAddresses: [
                    //   email
                    // ]//, BCC instead? it's just to one person tho.
                    },
                    Message: {
                    Body: {
                      Html: {
                       Charset: "UTF-8",
                       Data: "<p>"+verses+"</p>Read other translations: <a href="+item.Item.url+">"+item.Item.url+"</a>"+audioClip+videoClip+"<br><br>Date: "+item.Item.date+"<br><p>Love, Christine</p>"+
                       ".<br>Acts 17:11: \"... in that they received the word with all readiness of mind, and searched the scriptures daily ...\" (KJV)<br>"+
                       "<img src=https://daily-bread.s3.amazonaws.com/icon_108_A2Z.png alt='Daily Bread Logo'></img>"//email//urlToAccess//"HTML_FORMAT_BODY"
                      },
                      Text: {
                       Charset: "UTF-8",
                       Data: item.Item.verses+" "+item.Item.url+" Date: "+item.Item.date+"Love, Christine "+//"TEXT_FORMAT_BODY"
                       "Acts 17:11: \"... in that they received the word with all readiness of mind, and searched the scriptures daily ...\" (KJV)"
                      }
                     },
                     Subject: {
                      Charset: 'UTF-8',
                      Data: 'Daily Bread: '+item.Item.title
                     }
                    },
                    Source: 'Christine.DailyBreadVerses@gmail.com', /* required */
                    ReplyToAddresses: [
                      'Christine.DailyBreadVerses@gmail.com',
                    ],
                  };

                    // Create the promise and SES service object
                    var sendPromise = new awsSDK.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

                    // Handle promise's fulfilled/rejected states
                     sendPromise.then(
                      function(data) {
                      // console.log(data.MessageId);
                      // Add the auth to the table
                      this.emit(':tell', "I've sent you an email with "+ item.Item.title);
                      }.bind(this)).catch(
                      function(err) {
                       console.error(err, err.stack);
                      // this.emit(':ask', this.t('SORRY'));
                      this.emit(':tell', "There was a problem sending you an email. Please check your account or try again later.");
                      }.bind(this));
                    } else {
                      this.emit(':ask', "There are no verses for "+name+". What can I help you with?");

                    }
                    }.bind(this))
                  // }.bind(this)).catch(
                  //   function(err) {
                  //   console.error(err, err.stack);
                  //   this.emit(':ask', this.t('SORRY'));
                  //   }.bind(this));
                } else {
                  // not ENTITLED

                            this.event.session.attributes.recipeSub = product
                            this.event.session.attributes.filledSlots = filledSlots
                /** !!! */
                            this.emit(':ask', "Although signing up for daily emails is free. To send emails for any date, you need to subscribe. With "+product.name+". "+product.summary+". Would you like to hear more?");
                }
                } // else error
                })

          } else {
            console.log(error);
            console.log(response);
            this.emit(':ask', this.t('SORRY'));
          }
        })
      }

    } else {
      //no api access token
        console.log("no api access token");
        this.emit(':ask', this.t('SORRY'));
    }
    },
    'AddFood': function () {
  		var filledSlots = delegateSlotCollection.call(this);
		var { userId, accessToken } = this.event.session.user;
		if (!accessToken) {
			console.log("no token")
			//this.emit(':ask', 'Please link your Account so I can email you the web link.');
			addFoodForUser.call(this, filledSlots, userId);
		} else {
			console.log("token")
			const options = {
				url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					Authorization: "Bearer " + this.event.context.System.apiAccessToken
				}
			};
			request(options, (error, response, body) => {//TODO: request error
				if (!error && response.statusCode === 200) {
					let data = JSON.parse(body); // Store the data we got from the API request
					console.log(data)
					userId = data.user_id
					addFoodForUser.call(this, filledSlots, userId);

				}
			})
		}
		console.log(this.event)
    },

    'UpdateFood': function () {
		var filledSlots = delegateSlotCollection.call(this);

		var { userId, accessToken } = this.event.session.user;
		if (!accessToken) {
			console.log("no token")
			//this.emit(':ask', 'Please link your Account so I can email you the web link.');
			updateFoodForUser.call(this, filledSlots, userId);
		} else {
			console.log("token")
			const options = {
				url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					Authorization: "Bearer " + this.event.context.System.apiAccessToken
				}
			};
			request(options, (error, response, body) => {//TODO: request error
				if (!error && response.statusCode === 200) {
					let data = JSON.parse(body); // Store the data we got from the API request
					console.log(data)
					userId = data.user_id
					updateFoodForUser.call(this, filledSlots, userId);

				}
			})
		}
    },

    'MarkAsCondiment': function () {
		var filledSlots = delegateSlotCollection.call(this);

		var { userId, accessToken } = this.event.session.user;
		if (!accessToken) {
			console.log("no token")
			//this.emit(':ask', 'Please link your Account so I can email you the web link.');
			updateFoodAsCondimentForUser.call(this, filledSlots, userId);
		} else {
			console.log("token")
			const options = {
				url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					Authorization: "Bearer " + this.event.context.System.apiAccessToken
				}
			};
			request(options, (error, response, body) => {//TODO: request error
				if (!error && response.statusCode === 200){
					let data = JSON.parse(body); // Store the data we got from the API request
					console.log(data)
					userId = data.user_id
					updateFoodAsCondimentForUser.call(this, filledSlots, userId);

				}
			})
		}
    },

    'RemoveRecentAddition': function () {

		var filledSlots = delegateSlotCollection.call(this);

		var { userId, accessToken } = this.event.session.user;
		if (!accessToken) {
			console.log("no token")
			//this.emit(':ask', 'Please link your Account so I can email you the web link.');
			removeRecentAddition.call(this, filledSlots, userId);
		} else {
			console.log("token")
			const options = {
				url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					Authorization: "Bearer " + this.event.context.System.apiAccessToken
				}
			};
			request(options, (error, response, body) => {//TODO: request error
				if (!error && response.statusCode === 200){
					let data = JSON.parse(body); // Store the data we got from the API request
					//console.log(data)
					userId = data.user_id
					removeRecentAddition.call(this, filledSlots, userId);

				}
			})
		}
	},

	'RemoveFood': function () {
		var filledSlots = delegateSlotCollection.call(this);

		var { userId, accessToken } = this.event.session.user;
		if (!accessToken) {
			console.log("no token")
			//this.emit(':ask', 'Please link your Account so I can email you the web link.');
			removeFoodForUser.call(this, filledSlots, userId);
		} else {
			console.log("token")
			const options = {
				url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					Authorization: "Bearer " + this.event.context.System.apiAccessToken
				}
			};
			request(options, (error, response, body) => {//TODO: request error
				if (!error && response.statusCode === 200){
					let data = JSON.parse(body); // Store the data we got from the API request
					console.log(data)
					userId = data.user_id
					removeFoodForUser.call(this, filledSlots, userId);

				}
			})
		}
	},

	'GetFoodSuggestion': function () {
		var filledSlots = delegateSlotCollection.call(this);

		var { userId, accessToken } = this.event.session.user;
		if (!accessToken) {
			console.log("no token")
			//this.emit(':ask', 'Please link your Account so I can email you the web link.');
			getFoodSuggestionForUser.call(this, filledSlots, userId);
		} else {
			console.log("token")
			const options = {
				url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					Authorization: "Bearer " + this.event.context.System.apiAccessToken
				}
			};
			request(options, (error, response, body) => {//TODO: request error
				if (!error && response.statusCode === 200){
					let data = JSON.parse(body); // Store the data we got from the API request
					//console.log(data)
					userId = data.user_id
					getFoodSuggestionForUser.call(this, filledSlots, userId);
				}
			})
		}
	},
	'GetMealSuggestion': function () {
		var filledSlots = delegateSlotCollection.call(this);

		var { userId, accessToken } = this.event.session.user;
		if (!accessToken) {
			console.log("no token")
			//this.emit(':ask', 'Please link your Account so I can email you the web link.');
			getMealSuggestionForUser.call(this, filledSlots, userId);
		} else {
			console.log("token")
			const options = {
				url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					Authorization: "Bearer " + this.event.context.System.apiAccessToken
				}
			};
			request(options, (error, response, body) => {//TODO: request error
				if (!error && response.statusCode === 200){
					let data = JSON.parse(body); // Store the data we got from the API request
					//console.log(data)
					userId = data.user_id
					getMealSuggestionForUser.call(this, filledSlots, userId);
				}
			})
		}
	},
	'ListOldFood': function () {
		var filledSlots = delegateSlotCollection.call(this);

		var { userId, accessToken } = this.event.session.user;
		if (!accessToken) {
			console.log("no token")
			//this.emit(':ask', 'Please link your Account so I can email you the web link.');
			listOldFoodForUser.call(this, filledSlots, userId);
		} else {
			console.log("token")
			const options = {
				url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					Authorization: "Bearer " + this.event.context.System.apiAccessToken
				}
			};
			request(options, (error, response, body) => {//TODO: request error
				if (!error && response.statusCode === 200){
					let data = JSON.parse(body); // Store the data we got from the API request
					//console.log(data)
					userId = data.user_id
					listOldFoodForUser.call(this, filledSlots, userId);
				}
			})
		}

    },
//
	'ListWeeklyVerses': function () {
		var filledSlots = delegateSlotCollection.call(this);

		var { userId, accessToken } = this.event.session.user;
		if (!accessToken) {
			console.log("no token")
			//this.emit(':ask', 'Please link your Account so I can email you the web link.');
			listWeeklyVerses.call(this);
		} else {
			console.log("token")
			const options = {
				url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					Authorization: "Bearer " + this.event.context.System.apiAccessToken
				}
			};
			request(options, (error, response, body) => {//TODO: request error
				if (!error && response.statusCode === 200){
					let data = JSON.parse(body); // Store the data we got from the API request
					//console.log(data)
					userId = data.user_id
					listWeeklyVerses.call(this);
				}
			})
		}
    },
	'ListAllFood': function () {
		var filledSlots = delegateSlotCollection.call(this);

		var { userId, accessToken } = this.event.session.user;
		if (!accessToken) {
			console.log("no token")
			//this.emit(':ask', 'Please link your Account so I can email you the web link.');
			listAllFoodForUser.call(this, filledSlots, userId);
		} else {
			console.log("token")
			const options = {
				url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					Authorization: "Bearer " + this.event.context.System.apiAccessToken
				}
			};
			request(options, (error, response, body) => {//TODO: request error
				if (!error && response.statusCode === 200){
					let data = JSON.parse(body); // Store the data we got from the API request
					//console.log(data)
					userId = data.user_id
					listAllFoodForUser.call(this, filledSlots, userId);
				}
			})
		}
    },
	'GetTriviaQuestion': function () {
		var filledSlots = delegateSlotCollection.call(this);

		var { userId, accessToken } = this.event.session.user;
		if (!accessToken) {
			console.log("no token")
			//this.emit(':ask', 'Please link your Account so I can email you the web link.');
			getTriviaForUser.call(this, filledSlots, userId);
		} else {
			console.log("token")
			const options = {
				url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					Authorization: "Bearer " + this.event.context.System.apiAccessToken
				}
			};
			request(options, (error, response, body) => {//TODO: request error
				if (!error && response.statusCode === 200){
					let data = JSON.parse(body); // Store the data we got from the API request
					//console.log(data)
					userId = data.user_id
					getTriviaForUser.call(this, filledSlots, userId);
				}
			})
		}
    },

	'GetRecipe': function () {
		var filledSlots = delegateSlotCollection.call(this);

		var { userId, accessToken } = this.event.session.user;
		if (!accessToken) {
			console.log("no token")
			//this.emit(':ask', 'Please link your Account so I can email you the web link.');
			getRecipeForUser.call(this, filledSlots, userId);
		} else {
			console.log("token")
			const options = {
				url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					Authorization: "Bearer " + this.event.context.System.apiAccessToken
				}
			};
			request(options, (error, response, body) => {//TODO: request error
				if (!error && response.statusCode === 200){
					let data = JSON.parse(body); // Store the data we got from the API request
					//console.log(data)
					userId = data.user_id
					getRecipeForUser.call(this, filledSlots, userId);
				}
			})
		}
    },

	'AddRecipe': function (testInput) {
		console.log(testInput);
		if (testInput){
			console.log("has input")
			console.log(testInput.responseBuilder)
		}
		var filledSlots = delegateSlotCollection.call(this);

		var { userId, accessToken } = this.event.session.user;
		if (!accessToken) {
			console.log("no token")
			this.emit(':tellWithLinkAccountCard', 'Please link your Account so you can add your own recipes.');
			// addRecipeForUser.call(this, filledSlots, userId);
		} else {
			console.log("token")
			console.log(this.event.context.System)
			console.log(this.event.context.System)
			if(this.event.context.System.apiAccessToken){
			const options = {
				url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					Authorization: "Bearer " + this.event.context.System.apiAccessToken
				}
			};
			request(options, (error, response, body) => {//TODO: request error
				if (!error && response.statusCode === 200){
					let data = JSON.parse(body); // Store the data we got from the API request
					console.log(data)
					userId = data.user_id

					const options2 = {
						uri: 'https://api.amazonalexa.com/v1/users/~current/skills/~current/inSkillProducts',
						method: 'GET',
						headers: {
							'Accept': 'application/json',
							'Accept-Language': this.event.request.locale,
							Authorization: "bearer " + this.event.context.System.apiAccessToken
						}
					};
					request(options2, (error, response, body) => {
						if (!error && response.statusCode === 200){
							let data = JSON.parse(body);
							console.log(data)
							let recipeSub = data.inSkillProducts[0];
							console.log(recipeSub)
							if (recipeSub.entitled == "ENTITLED") {
								addRecipeForUser.call(this, filledSlots, userId);
							} else {
								var recipes = getRecipes()
								console.log(recipes)
								var mealsMax = 19;
								recipes.then(recipes => {
									for (let item of recipes.Items) {
										if (item.userId == userId) {// if this isn't a specific user's recipe, or if the recipe is their recipe
											mealsMax = mealsMax -1;
											if (mealsMax == -1) {
												break;
											}
										}
									}
									if (mealsMax == -1) {// check if have recipe subscription, then add recipe, else, suggest to get subscription.
										console.log("needs subscription")
										if (recipeSub.purchasable == "PURCHASABLE") {
											this.event.session.attributes.recipeSub = recipeSub
											this.event.session.attributes.filledSlots = filledSlots
					/** !!! */
											this.emit(':ask', "It looks like you have 20 recipes. You cannot add another until you subscribe. With "+recipeSub.name+". "+recipeSub.summary+". Would you like to hear more?")

										} else {
											this.emit(':tell', "Sorry, you cannot purchase the subscription so you cannot add more recipes.")
										}
									} else {
										console.log("doesn't need subscription")
										addRecipeForUser.call(this, filledSlots, userId, mealsMax);
									}
								})
							}
						} else {
							console.log("error "+ error)
							console.log(response)
							this.emit(':tell', "Something went wrong in loading the purchase history. Error code " + response.statusCode );
						}
					})

				}
			})
					} else {
						var givenAccess = ["amzn1.account.AEEZ5CW6CKEAB253BRDJTP6LJG7Q"]// give access to my mom to add via website
						if (givenAccess.includes(userId)) {
							addRecipeForUser.call(this, filledSlots, userId);//give a pass currently
						} else {
							/**
							TODO: fix this.
							filledSlots.slots.recipeTitle.value
							*/
							getRecipeForUser.call(this, filledSlots, userId);
							this.emit(':tell', "Sorry for the inconvenience, you must first add your new recipes using Alexa. After that, you can edit it here as much as you like, so you only need to list one ingredient through voice. Example: 'Alexa, ask food tracker to add a recipe called ice cream with milk'. Thank you!")
						}
					}
    		}
	},

	'RemoveRecipe': function () {
		var filledSlots = "";//delegateSlotCollection.call(this);

		var { userId, accessToken } = this.event.session.user;
		if (!accessToken) {
			console.log("no token")
			//this.emit(':ask', 'Please link your Account so I can email you the web link.');
			removeRecipeForUser.call(this, filledSlots, userId);
		} else {
			console.log("token")
			const options = {
				url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					Authorization: "Bearer " + this.event.context.System.apiAccessToken
				}
			};
			request(options, (error, response, body) => {//TODO: request error
				if (!error && response.statusCode === 200){
					let data = JSON.parse(body); // Store the data we got from the API request
					//console.log(data)
					userId = data.user_id
					removeRecipeForUser.call(this, filledSlots, userId);
				}
			})
		}
	},

	'ListRecipes': function () {//!!
		var filledSlots = delegateSlotCollection.call(this);

		var { userId, accessToken } = this.event.session.user;
		if (!accessToken) {
			console.log("no token")
			//this.emit(':ask', 'Please link your Account so I can email you the web link.');
			listRecipesForUser.call(this, filledSlots, userId);
		} else {
			console.log("token")
			const options = {
				url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					Authorization: "Bearer " + this.event.context.System.apiAccessToken
				}
			};
			request(options, (error, response, body) => {//TODO: request error
				if (!error && response.statusCode === 200){
					let data = JSON.parse(body); // Store the data we got from the API request
					//console.log(data)
					userId = data.user_id
					listRecipesForUser.call(this, filledSlots, userId);
				}
			})
		}
	},
    'AMAZON.PauseIntent': function () {
      /**
      {
  "version": "1.0",
  "sessionAttributes": {},
  "response": {
    "outputSpeech": {},
    "card": {},
    "reprompt": {},
    "shouldEndSession": true,
    "directives": [
      {
        "type": "AudioPlayer.Play",
      **/
      // this.emit(':tell', "ok.");
      var filledSlots = delegateSlotCollection.call(this);
      console.log(filledSlots);
  		this.response.speak();
      this.response._addDirective({
        type: 'AudioPlayer.Stop'
      })
      console.log(this.response);
      this.emit(':responseReady');
    },
    'AMAZON.ResumeIntent': function () {
      this.emit(':tell', "ok.");
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'PlaybackStarted':  function () {
      console.log("started playback")
      this.emit(':responseReady');
  	},
    'PlaybackFinished':  function () {
      console.log("done")
      this.emit(':responseReady');
  	},
    'PlaybackNearlyFinished':  function () {
      console.log("nearly finished")
      this.emit(':responseReady');
  	},
    'System.ExceptionEncountered': function () {
      console.log("exception happened")
      console.log(this.event.request);
      console.log(this.event.request.error);
    },
  	'SessionEndedRequest': function () {
  		this.emit(':tell', this.t('STOP_MESSAGE'));
  	},
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.FallbackIntent': function () {
      this.emit(':ask', this.t('HELP_REPROMPT'));
    },
    'AMAZON.NoIntent': function () {
      this.emit(':ask', this.t('HELP_REPROMPT'));
    },
	'Connections.Response': function () {
		console.log('connections.response')
		console.log(this.event)
		var purchaseResult = this.event.request.payload.purchaseResult
		console.log(purchaseResult)
		if (this.event.request.name != "Cancel") {

			if (purchaseResult == "ACCEPTED") {

						var { userId, accessToken } = this.event.session.user;
						if (!accessToken) {
							console.log("no token")
							//this.emit(':ask', 'Please link your Account so I can email you the web link.');

									checkIfUserExists.call(this, userId)
										  .then(data => {
											const existingItem = data.Item;
											console.log(existingItem);

										if (!existingItem.date) {
											this.emit(':ask', "Say 'email me november 11 2019 verses' to begin.");
										} else {
											var filledSlots = { name: 'GiveLinkForDate',
											confirmationStatus: 'NONE',
											slots:
											{ date:
											{ name: 'date',
											 value: existingItem.date,
											confirmationStatus: 'NONE',
											source: 'USER' } } }

											var dynamoParams = {
												TableName: "dailyBreadUsers"
											}
                      var date = existingItem.date;
											if (existingItem) {
												existingItem.userID = userId;
												delete existingItem.date
												dynamoParams.Item = existingItem;
											}

											// tell which you already have, and what added, number added
											// putParamsAndMessage.call(this, dynamoParams, "You added "+names.join(" and ")+" to the "+location+" "+(granularLocation||"") + (alreadyExisting.length ? alreadyExists:""), ":tellWithCard", this.t('TRIVIA_INFO_TITLE'));
											dbPut(dynamoParams).then(function() {
												//this.emit(":tell", "I've added your recipe called "+title);
												emailVerses.call(this, existingItem.email, date);
											}.bind(this)).catch(err => {
												console.error(err);
												//this.emit(':ask', "There was a problem adding your recipe.");
												emailVerses.call(this, existingItem.email, date);
											});
										}

										}).catch(err => {
											console.error(err);
											this.emit(':tellWithLinkAccountCard', "Please go to your Alexa app and link your account in order to get emails sent to you.");
										});
						} else {
							console.log("token")
							const options = {
								url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
								method: 'GET',
								headers: {
									'Accept': 'application/json',
									Authorization: "Bearer " + this.event.context.System.apiAccessToken
								}
							};
							request(options, (error, response, body) => { //TODO: request error
								if (!error && response.statusCode === 200){
									let data = JSON.parse(body); // Store the data we got from the API request
									//console.log(data)
									userId = data.user_id
                  var email = data.email
                  console.log(userId)
									checkIfUserExists.call(this, userId)
										  .then(data => {
											const existingItem = data.Item;

										if (!existingItem || !existingItem.date) {
											this.emit(':ask', "Say 'email me november 11 2019 verses' to begin.");
										} else {
											var filledSlots = { name: 'GiveLinkForDate',
											confirmationStatus: 'NONE',
											slots:
											{ recipeIngredients:
											{ name: 'date',
											 value: existingItem.date,//
											confirmationStatus: 'NONE',
											source: 'USER' } } }

											var dynamoParams = {
												TableName: "dailyBreadUsers"
											}
                      console.log(existingItem)
                      var date = existingItem.date;
											// if (existingItem) {
												existingItem.userID = userId;
												delete existingItem.date
												dynamoParams.Item = existingItem;
											// }

											// tell which you already have, and what added, number added
											// putParamsAndMessage.call(this, dynamoParams, "You added "+names.join(" and ")+" to the "+location+" "+(granularLocation||"") + (alreadyExisting.length ? alreadyExists:""), ":tellWithCard", this.t('TRIVIA_INFO_TITLE'));
											dbPut(dynamoParams).then(function() {
												//this.emit(":tell", "I've added your recipe called "+title);
												emailVerses.call(this, email, date);
											}.bind(this)).catch(err => {
												console.error(err);
												//this.emit(':ask', "There was a problem adding your recipe.");
												emailVerses.call(this, email, date);
											});

										}

										}).catch(err => {
											console.error(err);
                      console.log(userId+" not found")
											this.emit(':tellWithLinkAccountCard', "User not found. Please go to your Alexa app and link your account in order to get emails sent to you.");
										});
								}
							})
						}

			} else if (purchaseResult == "ALREADY_PURCHASED") {
				this.emit(':ask', "Say 'email me november 11 2019 verses' to begin.");
			} else {//if (purchaseResult == "DECLINED" || purchaseResult == "ERROR") {
				console.log("Purchase result is declined or error occurred: "+purchaseResult)
				this.emit(':ask', this.t('HELP_REPROMPT'));
			}
		} else {
			console.log("Requested to cancel.")
			this.emit(':ask', this.t('HELP_REPROMPT'));
		}
	},
	'AMAZON.YesIntent': function() {
		console.log("subIntent")
		if (this.event.session.attributes.recipeSub) {
			console.log(this.event.session.attributes.recipeSub)
			console.log(this.event.session.attributes.filledSlots)//need to save the slots
			var { userId, accessToken } = this.event.session.user;
			if (!accessToken) {

				var filledSlots = this.event.session.attributes.filledSlots;
				const name = filledSlots.slots.date.value; // eggs benedict
				// const suppliedIngredients = filledSlots.slots.recipeIngredients.value;// eggs and bread and butter

				this.handler.response = {
					'version': '1.0',
					'response': {
					  'directives': [
						  {
							  'type': 'Connections.SendRequest',
							  'name': 'Buy',
							  'payload': {
										 'InSkillProduct': {
											 'productId': this.event.session.attributes.recipeSub.productId
										 }
							   },
							  'token': 'correlationToken'
						  }
					  ],
					  'shouldEndSession': true
					}
				};

				checkIfUserExists.call(this, userId)
				  .then(function (existingData) {
					var dynamoParams = {
						TableName: table
					  }
					var existingItem = existingData.Item;
					if (existingItem) {
						existingItem.userID = userId;
						existingItem.date = name
						// existingItem.savedRecipeIngredients = suppliedIngredients
						dynamoParams.Item = existingItem;
					}

					// tell which you already have, and what added, number added
					//putParamsAndMessage.call(this, dynamoParams, "You added "+names.join(" and ")+" to the "+location+" "+(granularLocation||"") + (alreadyExisting.length ? alreadyExists:""), ":tellWithCard", this.t('TRIVIA_INFO_TITLE'));
					dbPut(dynamoParams).then(function() {
						//this.emit(":tell", "I've added your recipe called "+title);
						this.emit(":responseReady");
					}.bind(this)).catch(err => {
						console.error(err);
						//this.emit(':ask', "There was a problem adding your recipe.");
						this.emit(":responseReady");
					});

				}.bind(this)).catch(err => {
					console.error(err);
					//this.emit(':ask',  "There was a problem adding your recipe.");
					this.emit(":responseReady");
				});


			} else {
				// TODO: test all.
				console.log("token")
				const options = {
					url: 'https://api.amazon.com/user/profile?access_token=' + accessToken,
					method: 'GET',
					headers: {
						'Accept': 'application/json',
						Authorization: "Bearer " + this.event.context.System.apiAccessToken
					}
				};
				request(options, (error, response, body) => {//TODO: request error
					if (!error && response.statusCode === 200){
						let data = JSON.parse(body); // Store the data we got from the API request
						//console.log(data)
						userId = data.user_id

						var filledSlots = this.event.session.attributes.filledSlots;
						const title = filledSlots.slots.date.value; // eggs benedict
						// const suppliedIngredients = filledSlots.slots.recipeIngredients.value;// eggs and bread and butter

						this.handler.response = {
							'version': '1.0',
							'response': {
							  'directives': [
								  {
									  'type': 'Connections.SendRequest',
									  'name': 'Buy',
									  'payload': {
												 'InSkillProduct': {
													 'productId': this.event.session.attributes.recipeSub.productId
												 }
									   },
									  'token': 'correlationToken'
								  }
							  ],
							  'shouldEndSession': true
							}
						};

						checkIfUserExists.call(this, userId)
						  .then(function (existingData) {
							var dynamoParams = {
								TableName: table
							  }
							var existingItem = existingData.Item;
							if (existingItem) {
								existingItem.userID = userId;
								existingItem.date = title
								// existingItem.savedRecipeIngredients = suppliedIngredients
								dynamoParams.Item = existingItem;
							} else {
                // isn't subscribed to daily emails but wants to email themselves
                var item = {userID: userId,
                date: title};
                dynamoParams.Item = item;
              }

							// tell which you already have, and what added, number added
							// putParamsAndMessage.call(this, dynamoParams, "You added "+names.join(" and ")+" to the "+location+" "+(granularLocation||"") + (alreadyExisting.length ? alreadyExists:""), ":tellWithCard", this.t('TRIVIA_INFO_TITLE'));
							dbPut(dynamoParams).then(function(){
								//this.emit(":tell", "I've added your recipe called "+title);
								this.emit(":responseReady");
							}.bind(this)).catch(err => {
								console.error(err);
                console.log("cannot put "+dynamoParams)
								//this.emit(':ask', "There was a problem adding your recipe.");
								this.emit(":responseReady");
							});

						}.bind(this)).catch(err => {
							console.error(err);
              console.log("user does not exist issue")
							//this.emit(':ask',  "There was a problem adding your recipe.");
							this.emit(":responseReady");
						});


					}
				})
			}
		} else {

			this.emit(':ask', this.t('HELP_REPROMPT'));
		}
	},
	'RefundRequest': function() {
		console.log("Refund request")
		this.handler.response = {
		  'version': '1.0',
		  'response': {
			  'directives': [
				  {
					  'type': 'Connections.SendRequest',
					  'name': 'Cancel',
					  'payload': {
								 'InSkillProduct': {
									 'productId': 'amzn1.adg.product.7570f523-b395-4322-a533-a1668a5f862a'
								 }
					   },
					 'token': 'correlationToken'
				  }
			  ],
			  'shouldEndSession': true
		  }
	};

	this.emit(":responseReady");
	},
	'BuyRequest': function() {
		// what about not purchasable?
		this.handler.response = {
		  'version': '1.0',
		  'response': {
			  'directives': [
				  {
					  'type': 'Connections.SendRequest',
					  'name': 'Buy',
					  'payload': {
								 'InSkillProduct': {
									 'productId': 'amzn1.adg.product.7570f523-b395-4322-a533-a1668a5f862a'
								 }
					   },
					  'token': 'correlationToken'
				  }
			  ],
			  'shouldEndSession': true
		  }
		};

		this.emit(":responseReady");
	}
};
const languageStrings = {
    'en': {
        translation: {
            SKILL_NAME: 'Daily Bread',
      			WELCOME: 'Welcome to Daily Bread. You can say play. ',// or comment.',//list, modify
      			TRIVIA_INFO_TITLE: 'Christine Trivia',
      			REMOVED_CARD_TITLE: "Removed Comment",
      			NOT_REMOVED: "I have not removed your comment.",
      			NO_FOOD: "You do not have any comments.",
      			REQUEST_ADD_BEFORE_MODIFY: "Please add comment before modifying.",
            HELP_MESSAGE: 	'You can say: ' +
              'Play. ' +
              'Read. ' +
              'Get emails. ' +
              'Deregister. ' +
              'Subscribe. ' +
              'Refund. ' +
              // 'Comment. ' +
              'Read today. ' +
              'Play today\'s verses. ' +
              'Play yesterday\'s verses. ' +
              'Play tomorrow\'s verses. ' +
              'Play this Wednesday\'s verses. ' +
              'Play verses from November 11th, 2019. ' +

              'Email today\'s verses. ' +
              'Email yesterday\'s verses. ' +
              // 'Comment on yesterday\'s verses ' +
              // 'Comment on verses from November 16th' +
      				'What can I help you with?',
			      SORRY: "Sorry, there was a connection error. Could you ask me again?",
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
        },
    },
};
/*
To test:
ask food tracker to add milk to fridge top shelf
ask food tracker do I have milk?
ask food tracker to move milk to the fridge middle shelf
ask food tracker to remove milk
ask food tracker to add beans and rice to fridge bottom shelf
ask food tracker to suggest food
ask food tracker to suggest recipe
ask food tracker what should i eat
ask food tracker what's old
ask food tracker to list food
ask food tracker to list food from the fridge
ask food tracker to add ice to the freezer
ask food tracker to undo addition

ask food tracker to add a recipe called ice with water and fruit
ask food tracker to get recipe called ice
ask food tracker to list recipes
ask food tracker to remove recipe called ice

*/
function delegateSlotCollection() {
	//console.log("delegate method")
	console.log(this.event.request.dialogState)
	console.log(this.event.request.intent)
	console.log(this.event)
    if (this.event.request.dialogState === "STARTED") {
      var updatedIntent=this.event.request.intent;
      this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
      this.emit(":delegate");
    } else {
      return this.event.request.intent;
    }
}

function supportsAPL(handlerInput) {
	//const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
	const supportedInterfaces = this.event.context.System.device.supportedInterfaces;
  const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
  return aplInterface != null && aplInterface != undefined;
}

function supportsAudio(handlerInput) {
	//const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
	const supportedInterfaces = this.event.context.System.device.supportedInterfaces;
  console.log(supportedInterfaces);
  const aplInterface = supportedInterfaces['AudioApp'];
  return aplInterface != null && aplInterface != undefined;
}

function supportsVideo(handlerInput) {
	//const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
	const supportedInterfaces = this.event.context.System.device.supportedInterfaces;
  console.log(supportedInterfaces);
  const aplInterface = supportedInterfaces['VideoApp'];
  return aplInterface != null && aplInterface != undefined;
}

// function getData(accessToken){
// let url =
				// 'https://api.amazon.com/user/profile?access_token=' + accessToken;// this.getAccessToken();//this.event.context.System.apiEndpoint+"/v2/accounts/~current/settings/Profile.email";
				// console.log("url:");
				// console.log(url);
				// console.log("apiAccessToken");
				// console.log(this.event.context.System.apiAccessToken);
				// const options = {
					// url: url,
					// method: 'GET',
					// headers: {
						// 'Accept': 'application/json',
						// Authorization: "Bearer " + this.event.context.System.apiAccessToken
					// }
				// };
				// return request(options, (error, response, body) => {
					// if (!error && response.statusCode === 200){

						// let data = JSON.parse(body); // Store the data we got from the API request
						// console.log(data)
						// return data;
					// }
				// });
// }
function checkIfUserExists(userId) {
  	const checkIfUserExistsParams = {
  		TableName: table,
  		Key: {
  			userID: userId
  		}
  	};
  	return dbGet(checkIfUserExistsParams);
}
function getRecipes() {
  	const checkIfUserExistsParams = {
  		TableName: "foodTrackerRecipes"
  	};
  	return dbScan(checkIfUserExistsParams);
}

function putParamsAndMessage(dynamoParams, toTell, emitName, cardName) {
	dbPut(dynamoParams).then(function(){
		if (emitName == ":tellWithCard" && supportsAPL.call(this, null)) {
			this.response.cardRenderer(this.t('TRIVIA_INFO_TITLE'), toTell);
			  this.response.speak(toTell);
			  //main['mainTemplate']['items'][0]['text'] = toTell
			  open['dataSources']['bodyTemplate6Data']['textContent']['primaryText']['text'] = toTell
			  this.response._addDirective({
					type: 'Alexa.Presentation.APL.RenderDocument',
					varsion: '1.0',
					document: open['document'],
					datasources: open['dataSources']
				})
			  this.emit(':responseReady');
		} else if (emitName) {
			this.emit(emitName, toTell, cardName, toTell);
		} else {
  			this.emit(':tell', toTell);
		}
  	}.bind(this)).catch(err => {
  		console.error(err);
  		this.emit(':ask', this.t('SORRY'));
  	});
}
//getTriviaQuestion.call(this, existingItem, null, location ? location.value : null, null, null, null, null, true)
function getTriviaQuestion(existingItem, nameOrList, location, granularLocation, remove, findAny, findAll, findOld, findRecent) {
	console.log("getTriviaQuestion")
	var matchingFood = [];
    var foods = existingItem ? existingItem.food ? existingItem.food : [] : [];
    var name = null;//nameOrList;
    var map = {};
    if (findAll) {
    	if (location) {
		    for (var index in foods) {
		    	var food = foods[index];
		    	if (food.location === location) {
		    		matchingFood.push(food);
		    	}
		    }
    	} else {
    		matchingFood = foods;
    	}
		//matchingFood = matchingFood.slice(0,matchingFood.length > 9? 10:matchingFood.length);
    }
    if (findOld) {
    	if (location) {
		    for (var index in foods) {
		    	var food = foods[index];
		    	if (food.location === location && !food.condiment) {
		    		matchingFood.push(food);
		    	}
		    }
    	} else {
    		//matchingFood = foods;
			for (var index in foods) {
		    	var food = foods[index];
				if (!food.condiment) {
		    		matchingFood.push(food);
		    	}
		    }

    	}
    	matchingFood.sort(function(a, b){return a.dateAdded - b.dateAdded});
		//console.log(matchingFood);
    	matchingFood = matchingFood.slice(0,matchingFood.length > 9? 10:matchingFood.length);
		//console.log(matchingFood);
    }
    if (findRecent) {
    	matchingFood = foods;
    	// what if no food?
    	matchingFood.sort(function(a, b){return b.dateAdded - a.dateAdded});
		console.log("food")
		//console.log(matchingFood)
    	matchingFood = matchingFood.slice(0);
    	if (remove) {
   			name = matchingFood[0].name
   			console.log("will remove "+name)
   		}
    }
    if (findAny) {
    	name = true;
	  		const newIndex = Math.floor(Math.random() * foods.length);

	  		for (var i = newIndex; i < foods.length; i++) {
	  			var food = foods[i];
	  			if (!food.condiment) {
	  				matchingFood.push(food);
	  			}
	  		}
	  		if (matchingFood.length === 0) {
	  			for (var i = 0; i < newIndex; i++) {
	  				var food = foods[i];
		  			if (!food.condiment) {
		  				matchingFood.push(food);
		  			}
	  			}
	  		}
	  	} else {
	  		if(!name){
	if (nameOrList instanceof Array) {
		for (let name of nameOrList) {
			map[name] = true;
		}
	} else {
		name = nameOrList;
	}
	  		}
	console.log("foods: ")
	console.log(foods)
    for (var index in foods) {
    	var food = foods[index];
    	// console.log(food)
						if ((name === food.name || map[food.name])&& (!location || location === food.location)
							&& (!granularLocation || granularLocation === food.granularLocation)) {
								matchingFood.push(food);
								if (remove) {
									console.log("removing "+food.name)
									foods.splice(index, 1);
								}
								if (name) {
									break;
								}
						}
    	}
    }
	if (existingItem && existingItem.food){
		existingItem.food.sort((a,b) => {
			if (('' + a.location).localeCompare(b.location)>0){
				return 1;
			}
			if (('' + a.location).localeCompare(b.location)==0){
				if(('' + a.granularLocation).localeCompare(b.granularLocation)>0){
					return 1;
				}
				if (('' + a.granularLocation).localeCompare(b.granularLocation) == 0) {
					if(('' + a.food).localeCompare(b.food)>0){
						return 1;
					} else {
						return 0;
					}
				}
				return -1
			}
			return -1
		});
	}
    if (name){
    	return matchingFood[0];
    } else {
    	return matchingFood;
    }
}

function emailVerses(email, date) {
  // var email = data.email;//'randa164@d.umn.edu';
  console.log(email)//or just data with permissions url
  console.log(date);
  var params = {
    TableName: "dailyBreadVerses",
    Key: {
      date: date// "2019-11-11"
    }
  };
  dbGet(params).then(function(item) {
  // Create sendEmail params
  var params = {
    Destination: {
    CcAddresses: [
    ],
    ToAddresses: [
      email
    ],//, BCC instead?
    // BccAddresses: [
    //   email
    // ]//, BCC instead? it's just to one person tho.
    },
    Message: {
    Body: {
      Html: {
       Charset: "UTF-8",
       Data: "<p>"+item.Item.verses+"</p>"+item.Item.url+"<br><br> Date: "+item.Item.date+"<br><p>Love, Christine</p>"+
       "https://www.biblegateway.com/passage/?search=1+Corinthians+13%3A4-7&version=GNT;KJV<br>"
      },
      Text: {
       Charset: "UTF-8",
       Data: item.Item.verses+" Url: "+item.Item.url+" Date: "+item.Item.date+" Love, Christine"//"TEXT_FORMAT_BODY"
      }
     },
     Subject: {
      Charset: 'UTF-8',
      Data: 'Daily Bread: '+item.Item.title
     }
    },
    Source: 'Christine.DailyBreadVerses@gmail.com', /* required */
    ReplyToAddresses: [
      'Christine.DailyBreadVerses@gmail.com',
    ],
  };

    // Create the promise and SES service object
    var sendPromise = new awsSDK.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

    // Handle promise's fulfilled/rejected states
     sendPromise.then(
      function(data) {
      // console.log(data.MessageId);
      // Add the auth to the table
      this.emit(':tell', "I've sent you an email with "+ item.Item.title);
      }.bind(this)).catch(
      function(err) {
       console.error(err, err.stack);
      // this.emit(':ask', this.t('SORRY'));
      this.emit(':tell', "There was a problem sending you an email. Please check your account or try again later.");
      }.bind(this));
    }.bind(this))
}

function addFoodForUser(filledSlots, userId) {
		if (filledSlots != undefined){
console.log("slots3")
console.log(filledSlots)
	const name = filledSlots.slots.food.value; // milk
	const location = filledSlots.slots.location.value;// fridge
	const granularLocation = filledSlots.slots.granularLocation.value; // top shelf
	// const condiment = filledSlots.slots.condiment ? true : ""; // true if is a condiment
	const useByDate = filledSlots.slots.date.value;// July 30
	var dynamoParams = {
	  TableName: table,
	  Item: {
		userID: userId,
		food: [],
		updated: Date.now()
	  }
	};
	checkIfUserExists.call(this, userId)
	  .then(function (existingData) {
		var existingItem = existingData.Item;
		if (existingItem) {
			existingItem.userID = userId;
			dynamoParams.Item = existingItem;
		}
		var nameList = name.split(" and ");
		var matchingFood = getTriviaQuestion.call(this, existingItem, nameList, location, granularLocation);
		var alreadyExists = "You already have ";
		var alreadyExisting = {}
		for (let food of matchingFood) {
			alreadyExisting[food.name] = true;
			alreadyExists = alreadyExists +food.name+" in your "+food.location+" "+(food.granularLocation||"")+", ";
		}
		var names = [];
		for (let name of nameList) {

			let ignore = alreadyExisting[name];
			if (!ignore) {
				names.push(name);
				var newFood = {
					name: name,
					location: location,
					granularLocation: granularLocation,
					// condiment: condiment,
					dateAdded: Date.now(),
					useByDate: useByDate
				};
				dynamoParams.Item.food.push(newFood);
				dynamoParams.Item.food.sort((a,b) => {
  					if (('' + a.location).localeCompare(b.location)>0){
						return 1;
					}
                    if (('' + a.location).localeCompare(b.location)==0){
                    	if(('' + a.granularLocation).localeCompare(b.granularLocation)>0){
                        	return 1;
                        }
                        if (('' + a.granularLocation).localeCompare(b.granularLocation) == 0) {
                        	if(('' + a.food).localeCompare(b.food)>0){
                            	return 1;
                            } else {
                            	return 0;
                            }
                        }
                        return -1
					}
                    return -1
				});

				dynamoParams.Item.updated = Date.now();
			}

		}
		// tell which you already have, and what added, number added
		putParamsAndMessage.call(this, dynamoParams, "You added "+names.join(" and ")+" to the "+location+" "+(granularLocation||"") + (alreadyExisting.length ? alreadyExists:""), ":tellWithCard", this.t('TRIVIA_INFO_TITLE'));

	}.bind(this)).catch(err => {
		console.error(err);
		this.emit(':ask', this.t('SORRY'));
	});
		}
}

function updateFoodForUser(filledSlots, userId) {
	if (filledSlots != undefined){
	const name = filledSlots.slots.food.value; // milk
	const location = filledSlots.slots.location.value;// fridge
	const granularLocation = filledSlots.slots.granularLocation; // top shelf
	const newLocation = filledSlots.slots.newLocation.value;// fridge
	const newGranularLocation = filledSlots.slots.newGranularLocation; // bottom shelf
	// const condiment = filledSlots.slots.condiment ? true : ""; // true if is a condiment
	const useByDate = filledSlots.slots.date.value;// July 30
	const addedDate = filledSlots.slots.addedDate.value;// July 30

	//const { userId } = this.event.session.user;
	var dynamoParams = {
		TableName: table
	};
	checkIfUserExists.call(this, userId)
	  .then(data => {
		var existingItem = data.Item;
		if (existingItem) {
			var food = getTriviaQuestion.call(this, existingItem, name, location, granularLocation ? granularLocation.value: null);
			if (food) {
				if (newLocation){ food.location = newLocation;}
				if (newGranularLocation){ food.granularLocation = newGranularLocation.value;} else {food.granularLocation = ""}
				if (useByDate){ food.useByDate = useByDate;}
				if (addedDate){ food.addedDate = addedDate;}
				data.userID = userId;
				dynamoParams.Item = data.Item;
				dynamoParams.Item.updated = Date.now();

				var d = new Date(food.dateAdded);
				var now = new Date(Date.now());
				var daysBetween = Math.round(Math.abs(now - d) / 36e5 / 24);// Tenths: Math.round(hoursBetween * 10) / 10
				var toShow = "You have updated "+name+" in the "+food.location;
				toShow = food.granularLocation ? toShow +" "+food.granularLocation+". " : toShow +". ";
				toShow = toShow + "It is "+daysBetween+" day"+(daysBetween===1?"":"s")+" old. ";
				toShow = food.useByDate ? toShow + "It is best by "+food.useByDate+". " : toShow;
				putParamsAndMessage.call(this, dynamoParams, toShow, ":tellWithCard", this.t('TRIVIA_INFO_TITLE'));
			} else {
				this.emit(':ask', "I cannot find "+name+(location ? " in the "+location+" ": "")+(granularLocation.value ||"")+". "+this.t('HELP_REPROMPT'));
			}
		} else {
			this.emit(':ask', this.t('REQUEST_ADD_BEFORE_MODIFY')+" "+this.t('HELP_REPROMPT'));
		}
	}).catch(err => {
		console.error(err);
		this.emit(':ask', this.t('SORRY'));
	});
	}
}

function updateFoodAsCondimentForUser(filledSlots, userId) {
		if (filledSlots != undefined){
	const name = filledSlots.slots.food.value; // milk
	const location = filledSlots.slots.location.value;// fridge
	const granularLocation = filledSlots.slots.granularLocation; // top shelf
	// const newLocation = filledSlots.slots.newLocation.value;// fridge
	// const newGranularLocation = filledSlots.slots.newGranularLocation; // bottom shelf
	// const condiment = filledSlots.slots.condiment ? true : ""; // true if is a condiment
	// const useByDate = filledSlots.slots.date.value;// July 30
	// const addedDate = filledSlots.slots.addedDate.value;// July 30

	//const { userId } = this.event.session.user;
	var dynamoParams = {
		TableName: table
	};
	checkIfUserExists.call(this, userId)
	  .then(data => {
		var existingItem = data.Item;
		if (existingItem) {
			var food = getTriviaQuestion.call(this, existingItem, name, location, granularLocation ? granularLocation.value: null);
			if (food) {
				// if (newLocation){ food.location = newLocation;}
				// if (newGranularLocation){ food.granularLocation = newGranularLocation.value;} else {food.granularLocation = ""}
				// if (useByDate){ food.useByDate = useByDate;}
				// if (addedDate){ food.addedDate = addedDate;}
				food.condiment = true;
				data.userID = userId;
				dynamoParams.Item = data.Item;
				dynamoParams.Item.updated = Date.now();

				var d = new Date(food.dateAdded);
				var now = new Date(Date.now());
				var daysBetween = Math.round(Math.abs(now - d) / 36e5 / 24);// Tenths: Math.round(hoursBetween * 10) / 10
				var toShow = "You have updated "+name+" in the "+food.location;
				toShow = food.granularLocation ? toShow +" "+food.granularLocation+". " : toShow +". ";
				toShow = toShow + "It is "+daysBetween+" day"+(daysBetween===1?"":"s")+" old. ";
				toShow = food.useByDate ? toShow + "It is best by "+food.useByDate+". " : toShow;
				putParamsAndMessage.call(this, dynamoParams, toShow, ":tellWithCard", this.t('TRIVIA_INFO_TITLE'));
			} else {
				this.emit(':ask', "I cannot find "+name+(location ? " in the "+location+" ": "")+(granularLocation.value ||"")+". "+this.t('HELP_REPROMPT'));
			}
		} else {
			this.emit(':ask', this.t('REQUEST_ADD_BEFORE_MODIFY')+" "+this.t('HELP_REPROMPT'));
		}
	}).catch(err => {
		console.error(err);
		this.emit(':ask', this.t('SORRY'));
	});
		}
}

function removeFoodForUser(filledSlots, userId) {
	if (filledSlots != undefined){
		if (filledSlots.confirmationStatus !== "DENIED") {
			const name = filledSlots.slots.food.value;
			const location = filledSlots.slots.location.value;
			const granularLocation = filledSlots.slots.granularLocation.value;

			//const { userId } = this.event.session.user;
			checkIfUserExists.call(this, userId)
			  .then(data => {
				const existingItem = data.Item;
				if (existingItem) {
					var food = getTriviaQuestion.call(this, existingItem, name, location, granularLocation, true);
					if (food) {
						data.userID = userId;
						data.Item.updated = Date.now();
						const dynamoParams = {
							TableName: table,
							Item: data.Item,
						};
						var toTell = "I've removed "+name+" from the "+food.location+" "+(food.granularLocation||"")+". ";
						putParamsAndMessage.call(this, dynamoParams, toTell, ":tellWithCard",  this.t('REMOVED_CARD_TITLE'));
					} else {
						this.emit(':ask', "I cannot find "+name+" "+(location ? "in the "+location+" " : "anywhere")+(granularLocation||"")+". "+this.t('HELP_REPROMPT'));
					}
				} else {
					this.emit(':ask', this.t('NO_FOOD')+" "+this.t('HELP_REPROMPT'));
				}
			}).catch(err => {
				console.error(err);
				this.emit(':ask', this.t('SORRY'));
			});
		} else {
			this.emit(':tell', this.t('NOT_REMOVED'));
		}
	}
}

function getFoodSuggestionForUser(filledSlots, userId) {
	if (filledSlots != undefined){
		//const { userId } = this.event.session.user;
		checkIfUserExists.call(this, userId)
		  .then(data => {
			const existingItem = data.Item;
			if (existingItem) {
				var food = getTriviaQuestion.call(this, existingItem, null, null, null, null, true);
				if (food) {
					var d = new Date(food.dateAdded);
					var now = new Date(Date.now());
					var daysBetween = Math.round(Math.abs(now - d) / 36e5 / 24);// Tenths: Math.round(hoursBetween * 10) / 10
					var toShow = "I suggest having "+food.name+" from the "+food.location;
		            toShow = food.granularLocation ? toShow +" "+food.granularLocation+". " : toShow +". ";
		            toShow = toShow + "It is "+daysBetween+" day"+(daysBetween===1?"":"s")+" old. ";
		            toShow = food.useByDate ? toShow + "It is best by "+food.useByDate+". " : toShow;
					this.emit(':tellWithCard', toShow, this.t('TRIVIA_INFO_TITLE'), toShow);
				} else {
					this.emit(':ask', this.t('NO_FOOD')+" "+this.t('HELP_REPROMPT'));
				}
			} else {
				this.emit(':ask', this.t('NO_FOOD')+" "+this.t('HELP_REPROMPT'));
			}
		}).catch(err => {
			console.error(err);
			this.emit(':ask', this.t('SORRY'));
		});
	}
}

function getMealSuggestionForUser(filledSlots, userId) {
	if (filledSlots != undefined){
		console.log("GetMealSuggestion")
		//const { userId } = this.event.session.user;
		var recipes = getRecipes()
		recipes.then(recipes => {
			checkIfUserExists.call(this, userId).then(data => {
				const existingItem = data.Item;
				var matchingFood = getTriviaQuestion.call(this, existingItem, null, null, null, null, null, true);
				var existingFood = []
				for (let food of matchingFood) {
					existingFood.push(food.name);
				}
				var suggestedMeals = [];
				for (let item of recipes.Items) {
					var canMake = true;
					// if this isn't a specific user's recipe, or if the recipe is their recipe
					if (!item.userId || item.userId == userId) {
					// if have all ingredients, suggest
					for (let ingredient of item.ingredients) {
						console.log(existingFood.indexOf(ingredient))
						if (!(existingFood.indexOf(ingredient) > -1)
							&& !(existingFood.indexOf(ingredient+"s") > -1) && !(ingredient[ingredient.length-1] == "s" && existingFood.indexOf(ingredient.slice(0, -1)) > -1)) {
								// handles "s" differences, eg. onion will match onions and onions will match onion
							canMake = false;
							break;
						}
					}
					} else {
						canMake = false;
					}
					if (canMake) {
						suggestedMeals.push(item);
					}
				}
				console.log(suggestedMeals)
				if (suggestedMeals.length > 0) {
					//suggestedMeals = suggestedMeals.sort(function(a, b){return a.timesSuggested - b.timesSuggested});
					const newIndex = Math.floor(Math.random() * suggestedMeals.length);

					var suggestedMeal = suggestedMeals[newIndex]
					var toShow = "I suggest making "+suggestedMeal.title+". The ingredients are "+suggestedMeal.ingredients.join(", ") + (suggestedMeal.instructions ? ". Instructions: "+suggestedMeal.instructions : "")
					toShow = toShow+"\nOther recipes you could make with your food are: ";
					var recipeTitles = []
					for(let meal of suggestedMeals){
						recipeTitles.push(meal.title);
					}
					toShow = toShow + recipeTitles.join(", ")+"."
					suggestedMeal.timesSuggested = suggestedMeal.timesSuggested + 1;
					const dynamoParams = {
						TableName: "foodTrackerRecipes",
						Item: suggestedMeal,
					};
					//putParamsAndMessage.call(this, dynamoParams, toShow, ":tellWithCard", this.t('TRIVIA_INFO_TITLE'));
					dbPut(dynamoParams).then(function(){
						if (supportsAPL.call(this, null)){
							// this.response.cardRenderer(this.t('TRIVIA_INFO_TITLE'), toTell);
							  // this.response.speak(toTell);
							  ////main['mainTemplate']['items'][0]['text'] = toTell
							  // open['dataSources']['bodyTemplate6Data']['textContent']['primaryText']['text'] = toTell
							  // this.response._addDirective({
									// type: 'Alexa.Presentation.APL.RenderDocument',
									// varsion: '1.0',
									// document: open['document'],
									// datasources: open['dataSources']
								// })
							  // this.emit(':responseReady');
							this.response.cardRenderer(this.t('TRIVIA_INFO_TITLE'), suggestedMeal.id + ": "+ toShow);
							this.response.speak(toShow);
							large['dataSources']['bodyTemplate1Data']['title'] = suggestedMeal.id
							large['dataSources']['bodyTemplate1Data']['textContent']['primaryText']['text'] = "Ingredients: "+suggestedMeal.ingredients.join(", ") + (suggestedMeal.instructions ? ".\nInstructions: "+suggestedMeal.instructions : "")
							large['dataSources']['bodyTemplate1Data']['backgroundImage']['sources'][0]['url'] = "https://s3.amazonaws.com/food-tracker/images/carrots-food-fresh-616404.jpg"
							large['dataSources']['bodyTemplate1Data']['backgroundImage']['sources'][1]['url'] = "https://s3.amazonaws.com/food-tracker/images/carrots-food-fresh-616404.jpg"
							large['document']['theme'] = "dark"
							this.response._addDirective({
								type: 'Alexa.Presentation.APL.RenderDocument',
								varsion: '1.0',
								document: large['document'],
								datasources: large['dataSources']
							})
							this.emit(':responseReady');
						} else {
							this.emit(":tellWithCard", toShow, this.t('TRIVIA_INFO_TITLE'), toShow);
						}
					}.bind(this)).catch(err => {
						console.error(err);
						this.emit(':ask', this.t('SORRY'));
					});

				} else {
					var toShow = "I couldn't find any recipes with the food you have. Try adding food and spices from your cupboard."
					this.emit(':tellWithCard', toShow, this.t('TRIVIA_INFO_TITLE'), toShow);
				}
			}).catch(err => {
				console.error(err);
				this.emit(':ask', this.t('SORRY'));
			});
		}).catch(err => {
			console.error(err);
			this.emit(':ask', this.t('SORRY'));
		});
	}
}

// function listOldFoodForUser(filledSlots, userId) {
// 	if (filledSlots != undefined){
// 		//var filledSlots = delegateSlotCollection.call(this);
// 		// var name = filledSlots.slots.food.value;
// 		var location = filledSlots.slots.location;
// 		// var granularLocation = filledSlots.slots.granularLocation.value;
//
// 		//const { userId } = this.event.session.user;
// 		// checkIfUserExists.call(this, userId)
// 		//   .then(data => {
// 			const existingItem = {};//data.Item;
// 			if (existingItem) {
// 				var matchingFood = getTriviaQuestion.call(this, existingItem, null, location ? location.value : null, null, null, null, null, true);
// 				if (matchingFood.length > 0) {
// 					var toTell = "You have ";
// 					var toShow = "The top ten old items"+(location ? " in the "+location.value : "")+" are: ";
// 					var tellArray = []
// 					var foodDetailArray = []
// 					var foodDictDetailArray = []
// 					var previousLocation = "falseNotEqual"
// 					var previousShelf = "falseNotEqual"
// 					for (let food of matchingFood) {
// 						var d = new Date(food.dateAdded);
// 						var now = new Date(Date.now());
// 						var daysBetween = Math.round(Math.abs(now - d) / 36e5 / 24);// Tenths: Math.round(hoursBetween * 10) / 10
//
// 						// alreadyExisting[food.name] = true;
// 						// alreadyExists = alreadyExists +food.name+" in your "+food.location+" "+(food.granularLocation||"")+", ";
// 						// toShow = toShow + "You have "+food.name+" in the "+food.location;
// 						// toShow = food.granularLocation ? toShow +" "+food.granularLocation+". " : toShow +". ";
// 						// toShow = toShow + "It is "+daysBetween+" day"+(daysBetween===1?"":"s")+" old. ";
// 						// toShow = food.useByDate ? toShow + "It is best by "+food.useByDate+". " : toShow;
// 						////toTell = toTell +  + ", ";
// 						tellArray.push(daysBetween +" day old "+food.name)
// 						if (previousLocation != food.location || previousShelf != food.granularLocation) {
// 							previousLocation = food.location;
// 							previousShelf = food.granularLocation
// 							//foodArray.push("In the "+food.location+(food.granularLocation?" "+food.granularLocation:"")+": you have "+food.name)
// 							// toShow = toShow + "You have "+food.name+" in the "+food.location;
// 							// toShow = food.granularLocation ? toShow +" "+food.granularLocation+". " : toShow +". ";
// 							////toShow = toShow + "It is "+daysBetween+" day"+(daysBetween===1?"":"s")+" old. ";
// 							// toShow = food.useByDate ? toShow + "(best by "+food.useByDate+"). " : toShow;
// 							foodDetailArray.push("In the "+food.location+(food.granularLocation?" "+food.granularLocation:"")+": you have "+daysBetween+" day old "+food.name+(food.useByDate?" (best by "+food.useByDate+")":""))
//
// 						} else {
// 							//foodArray.push(food.name);
// 							foodDetailArray.push(daysBetween+" day old "+food.name+(food.useByDate?" (best by "+food.useByDate+")":""));
// 						}
//
// 						foodDictDetailArray.push({
// 							primary: food.name,
// 							secondary: food.location + " " + (food.granularLocation?" "+food.granularLocation:""),
// 							tertiary: daysBetween+" day"+(daysBetween===1?"":"s")+" old"
// 						});
//
// 					}
// 					toTell = toTell + tellArray.join(", ") + ".";
// 					toShow = toShow + foodDetailArray.join(", ") + ".";
//
// 					// if (supportsAPL.call(this, null)) {
// 						// this.response.cardRenderer(this.t('TRIVIA_INFO_TITLE'), toShow);
// 						// this.response.speak(toTell);
// 						// large['dataSources']['bodyTemplate1Data']['title'] = "What's old"
// 						// large['dataSources']['bodyTemplate1Data']['textContent']['primaryText']['text'] = toShow
// 						// large['dataSources']['bodyTemplate1Data']['backgroundImage']['sources'][0]['url'] = "https://s3.amazonaws.com/food-tracker/images/dinner-dish-egg-54455.jpg"
// 						// large['dataSources']['bodyTemplate1Data']['backgroundImage']['sources'][1]['url'] = "https://s3.amazonaws.com/food-tracker/images/dinner-dish-egg-54455.jpg"
// 						// large['document']['theme'] = "light"
// 						// this.response._addDirective({
// 						// type: 'Alexa.Presentation.APL.RenderDocument',
// 						// varsion: '1.0',
// 						// document: large['document'],
// 						// datasources: large['dataSources']
// 						// })
// 						// this.emit(':responseReady');
// 					// } else {
// 						// this.emit(':tellWithCard', toTell, this.t('TRIVIA_INFO_TITLE'), toTell + " "+ toShow);
// 					// }
//
// 					if (supportsAPL.call(this, null)) {
// 						this.response.cardRenderer(this.t('TRIVIA_INFO_TITLE'), toShow);
// 						this.response.speak(toTell);
// 						list['dataSources']['listTemplate1Metadata']['title'] = "Top 10 old items " +(location.value ? "in the "+location.value : "")
// 						var listItems = list['dataSources']['listTemplate1ListData']['listPage']['listItems']
// 						var itemToClone = list['exampleListItem']
// 						listItems = []
// 						//var ordinal = 1;
// 						for(let item of foodDictDetailArray){
// 							var newObj = clone(itemToClone);
// 							var cont = newObj['textContent'];
// 							cont['primaryText']['text'] = item['primary']
// 							cont['secondaryText']['text'] = item['secondary']
// 							cont['tertiaryText']['text'] = item['tertiary']
// 							//console.log(item)
// 							//newObj['listItemIdentifier'] = item['primary']
// 							//newObj['token'] = item['primary']
// 							//newObj['ordinalNumber'] = ordinal
// 							//ordinal = ordinal + 1;
// 							// Duration: 185.06 ms fails
// 							// Duration Duration: 306.22 ms fails
// 							// Duration: 99.67 ms works
// 							// Duration: 113.11 ms	 fails
// 							//Duration: 87.36 ms fails??
// 							listItems.push(newObj)
// 						}
// 						//console.log(listItems)
// 						//console.log(list['dataSources']['listTemplate1ListData']['listPage']['listItems'])
// 						list['dataSources']['listTemplate1ListData']['listPage']['listItems'] = listItems
// 						//console.log(list['dataSources']['listTemplate1ListData']['listPage']['listItems'])
// 						this.response._addDirective({
// 							type: 'Alexa.Presentation.APL.RenderDocument',
// 							varsion: '1.0',
// 							document: list['document'],//large
// 							datasources: list['dataSources']//large
// 						})
// 						this.emit(':responseReady');
//
// 					} else {
// 						this.emit(':tellWithCard', toTell, this.t('TRIVIA_INFO_TITLE'), toTell + " "+ toShow);
// 					}
// 				} else {
// 					this.emit(':ask', this.t('NO_FOOD')+" "+this.t('HELP_REPROMPT'));
// 				}
// 			} else {
// 				this.emit(':ask', this.t('NO_FOOD')+" "+this.t('HELP_REPROMPT'));
// 			}
// 		// }).catch(err => {
// 		// 	console.error(err);
// 		// 	this.emit(':ask', this.t('SORRY'));
// 		// });
// 	}
// }
function getVerse(date) {
var params = {
          TableName: "dailyBreadVerses",
          Key: {
            date: date
          }
        };
        console.log(date);
        return dbGet(params).then(function(item) {
          return item.Item;
        });
}
function listWeeklyVerses() {
  // get the five days worth
  // today's day of week minus stuff so day is equal
  //var dayOne = getVerse("2019-12-04");//Wednesday
  //var dayTwo = getVerse("2019-12-05");//Thursday
  //var dayThree = getVerse("2019-12-06");//Friday
  //var dayFour = getVerse("2019-12-07");//Saturday
  //var dayFive = getVerse("2019-12-08");//Sunday


  //var dayOne = getVerse("2020-11-04");//Wednesday
  //var dayTwo = getVerse("2020-11-05");//Thursday
  //var dayThree = getVerse("2020-11-06");//Friday
  //var dayFour = getVerse("2020-11-07");//Saturday
  //var dayFive = getVerse("2020-11-08");//Sunday

  var all = getVerse("weekly_verses")

all.then(function(weekly){

var weekly_verses = weekly.verses.split(", ");

  var dayOne = getVerse(weekly_verses[0]);//Wednesday
  var dayTwo = getVerse(weekly_verses[1]);//Thursday
  var dayThree = getVerse(weekly_verses[2]);//Friday
  var dayFour = getVerse(weekly_verses[3]);//Saturday
  var dayFive = getVerse(weekly_verses[4]);//Sunday
  // once all five done, continue
  // var params = {
          // console.log(item)
          dayOne.then(function(one){
          dayTwo.then(function(two){
          dayThree.then(function(three){
          dayFour.then(function(four){
          dayFive.then(function(five){

        if (true) {
					// var toTell = "This week's verses are: ";
					var toShow = "This week's verses are: ";
					var tellArray = []
					var foodDetailArray = []
					var foodDictDetailArray = []
          // one = one.Item;
          foodDetailArray.push("Wednesday, "+one.date+": "+one.title+" ");
          foodDictDetailArray.push({
            primary: "Wednesday, "+one.date,
            secondary: one.verses,
            tertiary: one.title
          });
          // two = two.Item
          foodDetailArray.push("Thursday, "+two.date+": "+two.title+" ");
          foodDictDetailArray.push({
            primary: "Thursday, "+two.date,
            secondary: two.verses,
            tertiary: two.title
          });
          // three = three.Item
          foodDetailArray.push("Friday, "+three.date+": "+three.title+" ");
          foodDictDetailArray.push({
            primary: "Friday, "+three.date,
            secondary: three.verses,
            tertiary: three.title
          });
          // three = four.Item
          foodDetailArray.push("Saturday, "+four.date+": "+four.title+" ");
          foodDictDetailArray.push({
            primary: "Saturday, "+four.date,
            secondary: four.verses,
            tertiary: four.title
          });
          // three = five.Item
          foodDetailArray.push("Sunday, "+five.date+": "+five.title+" ");
          foodDictDetailArray.push({
            primary: "Sunday, "+five.date,
            secondary: five.verses,
            tertiary: five.title
          });

					// toTell = toTell + tellArray.join(", ") + ".";
					toShow = toShow + "\n" + foodDetailArray.join(",\n");


					if (supportsAPL.call(this, null)) {
						this.response.cardRenderer(this.t('TRIVIA_INFO_TITLE'), toShow);
						this.response.speak(toShow);
						list['dataSources']['listTemplate1Metadata']['title'] = "This week's verses"
						var listItems = list['dataSources']['listTemplate1ListData']['listPage']['listItems']
						var itemToClone = list['exampleListItem']
						listItems = []
						//var ordinal = 1;
						for(let item of foodDictDetailArray){
							var newObj = clone(itemToClone);
							var cont = newObj['textContent'];
							cont['primaryText']['text'] = item['primary']
							cont['secondaryText']['text'] = item['secondary']
							cont['tertiaryText']['text'] = item['tertiary']
							//console.log(item)
							//newObj['listItemIdentifier'] = item['primary']
							//newObj['token'] = item['primary']
							//newObj['ordinalNumber'] = ordinal
							//ordinal = ordinal + 1;
							// Duration: 185.06 ms fails
							// Duration Duration: 306.22 ms fails
							// Duration: 99.67 ms works
							// Duration: 113.11 ms	 fails
							//Duration: 87.36 ms fails??
							listItems.push(newObj)
						}
						//console.log(listItems)
						//console.log(list['dataSources']['listTemplate1ListData']['listPage']['listItems'])
						list['dataSources']['listTemplate1ListData']['listPage']['listItems'] = listItems
						//console.log(list['dataSources']['listTemplate1ListData']['listPage']['listItems'])
						this.response._addDirective({
							type: 'Alexa.Presentation.APL.RenderDocument',
							varsion: '1.0',
							document: list['document'],//large
							datasources: list['dataSources']//large
						})
						this.emit(':responseReady');

					} else {
						this.emit(':tellWithCard', toShow, this.t('TRIVIA_INFO_TITLE'), toShow);
					}
				} else {
					this.emit(':ask', this.t('NO_FOOD')+" "+this.t('HELP_REPROMPT'));
				}
			// } else {
			// 	this.emit(':ask', this.t('NO_FOOD')+" "+this.t('HELP_REPROMPT'));
			// }
		}.bind(this)).catch(err => {
			console.error(err);
			this.emit(':ask', this.t('SORRY'));
		});

  }.bind(this)).catch(err => {
    console.error(err);
    this.emit(':ask', this.t('SORRY'));
  });

}.bind(this)).catch(err => {
  console.error(err);
  this.emit(':ask', this.t('SORRY'));
});

}.bind(this)).catch(err => {
console.error(err);
this.emit(':ask', this.t('SORRY'));
});

}.bind(this)).catch(err => {
console.error(err);
this.emit(':ask', this.t('SORRY'));
});

}.bind(this)).catch(err => {
console.error(err);
this.emit(':ask', this.t('SORRY'));
});

	// }
}

// function listAllFoodForUser(filledSlots, userId) {
// 	// if (filledSlots != undefined) {
// 	// 	//var filledSlots = delegateSlotCollection.call(this);
// 	// 	// var name = filledSlots.slots.food.value;
// 	// 	var location = filledSlots.slots.location;
// 	// 	var granularLocation = filledSlots.slots.granularLocation;
//
// 		//const { userId } = this.event.session.user;
// 		// checkIfUserExists.call(this, userId)
// 		//   .then(data => {
// 			const existingItem = {};//data.Item;
// 			if (existingItem) {//TODO?
// 				var matchingFood = getTriviaQuestion.call(this, existingItem, null, location ? location.value : null, granularLocation ? granularLocation.value : null, null, null, true);
// 				if (matchingFood.length > 0) {
// 					var toTell = "";
// 					var toShow = "Here are more details: ";
// 					var foodArray = []
// 					var foodDetailArray = []
// 					var foodDictDetailArray = []
// 					var previousLocation = "falseNotEqual"
// 					var previousShelf = "falseNotEqual"
//
// 				// var limitIs = 31;
// 					for (let food of matchingFood) {
// 						// limitIs = limitIs -1;
// 						// if (limitIs!=0){
// 							var d = new Date(food.dateAdded);
// 							var now = new Date(Date.now());
// 							var daysBetween = Math.round(Math.abs(now - d) / 36e5 / 24);// Tenths: Math.round(hoursBetween * 10) / 10
// 							if (previousLocation != food.location || previousShelf != food.granularLocation) {
// 								previousLocation = food.location;
// 								previousShelf = food.granularLocation
// 								foodArray.push("In the "+food.location+(food.granularLocation?" "+food.granularLocation:"")+": you have "+food.name)
// 								// toShow = toShow + "You have "+food.name+" in the "+food.location;
// 								// toShow = food.granularLocation ? toShow +" "+food.granularLocation+". " : toShow +". ";
// 								////toShow = toShow + "It is "+daysBetween+" day"+(daysBetween===1?"":"s")+" old. ";
// 								// toShow = food.useByDate ? toShow + "(best by "+food.useByDate+"). " : toShow;
// 								foodDetailArray.push("In the "+food.location+(food.granularLocation?" "+food.granularLocation:"")+": you have "+daysBetween+" day old "+food.name+(food.useByDate?" (best by "+food.useByDate+")":""))
//
// 							} else {
// 								foodArray.push(food.name);
// 								foodDetailArray.push(daysBetween+" day old "+food.name+(food.useByDate?" (best by "+food.useByDate+")":""));
// 							}
//
// 							foodDictDetailArray.push({
// 								primary: food.name,
// 								secondary: food.location + " " + (food.granularLocation?" "+food.granularLocation:""),
// 								tertiary: daysBetween+" day"+(daysBetween===1?"":"s")+" old"
// 							});
// 							//toTell = toTell + food.name + ", ";
// 						// alreadyExisting[food.name] = true;
// 						// alreadyExists = alreadyExists +food.name+" in your "+food.location+" "+(food.granularLocation||"")+", ";
// 						////
// 							// var d = new Date(food.dateAdded);
// 							// var now = new Date(Date.now());
// 							// var daysBetween = Math.round(Math.abs(now - d) / 36e5 / 24);// Tenths: Math.round(hoursBetween * 10) / 10
// 							// toShow = toShow + "You have "+food.name+" in the "+food.location;
// 							// toShow = food.granularLocation ? toShow +" "+food.granularLocation+". " : toShow +". ";
// 							// toShow = toShow + "It is "+daysBetween+" day"+(daysBetween===1?"":"s")+" old. ";
// 							// toShow = food.useByDate ? toShow + "(best by "+food.useByDate+"). " : toShow;
// 							// } else {
// 								// foodDictDetailArray.push({
// 								// primary: "You have more food, see the website",
// 								// secondary: "The echo show with my code currently cannot display more than 35. Sorry for the inconvenience.",
// 								// tertiary: ""
// 							// });
// 							// }
// 						// }
// 					}
// 					toTell = toTell + foodArray.join(", ") + ".";
// 					toShow = toShow + foodDetailArray.join(", ") + ".";
//
// 					if (supportsAPL.call(this, null)) {
// 						// this.response.cardRenderer(this.t('TRIVIA_INFO_TITLE'), toShow);
// 						// this.response.speak(toTell);
// 						// large['dataSources']['bodyTemplate1Data']['title'] = this.t('TRIVIA_INFO_TITLE')
// 						// large['dataSources']['bodyTemplate1Data']['textContent']['primaryText']['text'] = foodDetailArray.join(", ") + ".";
// 						// large['dataSources']['bodyTemplate1Data']['backgroundImage']['sources'][0]['url'] = "https://s3.amazonaws.com/food-tracker/images/dinner-dish-egg-54455.jpg"
// 						// large['dataSources']['bodyTemplate1Data']['backgroundImage']['sources'][1]['url'] = "https://s3.amazonaws.com/food-tracker/images/dinner-dish-egg-54455.jpg"
// 						// large['document']['theme'] = "light"
// 						// this.response._addDirective({
// 						// type: 'Alexa.Presentation.APL.RenderDocument',
// 						// varsion: '1.0',
// 						// document: large['document'],
// 						// datasources: large['dataSources']
// 						// })
// 						// this.emit(':responseReady');
// 						this.response.cardRenderer(this.t('TRIVIA_INFO_TITLE'), toShow);
// 						this.response.speak(toTell);
// 						// large['document']['theme'] = "dark"
// 						// var itemToClone = list['dataSources']['listTemplate1ListData']['listPage']['listItems'][0];
// 						// list['dataSources']['listTemplate1ListData']['listPage']['listItems'] = []
// 						// for(let item of foodDictDetailArray){
// 							// var newObj = clone(itemToClone);
// 							// newObj['textContent']['primaryText']['text'] = "test"//item['primary']
// 							// newObj['textContent']['secondaryText']['text'] = "test" //item['secondary']
// 							// newObj['textContent']['tertiaryText']['text'] = "test"//item['tertiary']
// 							// console.log(item);
// 							// console.log(item['primary'])
// 							// console.log(item['secondary'])
// 							// console.log(item['tertiary'])
//
// 							// list['dataSources']['listTemplate1ListData']['listPage']['listItems'].push(newObj)
// 						// }
// 						//var itemToClone = list['dataSources']['listTemplate1ListData']['listPage']['listItems'][0];
// 				list['dataSources']['listTemplate1Metadata']['title'] = "Food"
// 				var listItems = list['dataSources']['listTemplate1ListData']['listPage']['listItems']
// 				var itemToClone = list['exampleListItem']
// 				listItems = []
// 				//var ordinal = 1;
// 				var limit = 30;
// 				for(let item of foodDictDetailArray){
// 					limit = limit-1;
// 					//console.log(limit)
// 					//console.log(item)
// 					if (limit!=0){
// 						var newObj = clone(itemToClone);
// 						var cont = newObj['textContent'];
// 						cont['primaryText']['text'] = item['primary']
// 						cont['secondaryText']['text'] = item['secondary']
// 						cont['tertiaryText']['text'] = item['tertiary']
// 						//console.log(item)
// 						//newObj['listItemIdentifier'] = item['primary']
// 						//newObj['token'] = item['primary']
// 						//newObj['ordinalNumber'] = ordinal
// 						//ordinal = ordinal + 1;
// 						// Duration: 185.06 ms fails
// 						// Duration Duration: 306.22 ms fails
// 						// Duration: 99.67 ms works
// 						// Duration: 113.11 ms	 fails
// 						//Duration: 87.36 ms fails??
// 						listItems.push(newObj)
// 					} else {
// 						//console.log("here")
// 						var newObj = clone(itemToClone);
// 						var cont = newObj['textContent'];
// 						cont['primaryText']['text'] = "See the activity card for more.",
// 						cont['secondaryText']['text'] = (location?location.value?"":"Or ask me 'list food in the fridge'. ":"Or ask me 'list food in the fridge'. ")+"Sorry for the inconvenience."
// 						cont['tertiaryText']['text'] = ""
// 						//console.log(item)
// 						//newObj['listItemIdentifier'] = item['primary']
// 						//newObj['token'] = item['primary']
// 						//newObj['ordinalNumber'] = ordinal
// 						//ordinal = ordinal + 1;
// 						// Duration: 185.06 ms fails
// 						// Duration Duration: 306.22 ms fails
// 						// Duration: 99.67 ms works
// 						// Duration: 113.11 ms	 fails
// 						//Duration: 87.36 ms fails??
// 						listItems.push(newObj)
// 						break;
// 					}
// 				}
// 				//console.log(listItems)
// 				//console.log(list['dataSources']['listTemplate1ListData']['listPage']['listItems'])
// 				list['dataSources']['listTemplate1ListData']['listPage']['listItems'] = listItems
// 				//console.log(list['dataSources']['listTemplate1ListData']['listPage']['listItems'])
// 				this.response._addDirective({
// 					type: 'Alexa.Presentation.APL.RenderDocument',
// 					varsion: '1.0',
// 					document: list['document'],//large
// 					datasources: list['dataSources']//large
// 				})
// 						this.emit(':responseReady');
//
// 					} else {
// 						this.emit(':tellWithCard', toTell, this.t('TRIVIA_INFO_TITLE'), toTell + " "+ toShow);
// 					}
// 				} else {
// 					this.emit(':ask', this.t('NO_FOOD')+" "+this.t('HELP_REPROMPT'));
// 				}
// 			} else {
// 				this.emit(':ask', this.t('NO_FOOD')+" "+this.t('HELP_REPROMPT'));
// 			}
// 		// }).catch(err => {
// 		// 	console.error(err);
// 		// 	this.emit(':ask', this.t('SORRY'));
// 		// });
// 	// }
// }

//getTriviaForUser
function getTriviaForUser(filledSlots, userId) {
	if (filledSlots != undefined){
		var name = filledSlots.slots.categoryTitle.value;

		//const { userId } = this.event.session.user;
		checkIfUserExists.call(this, userId)
		  .then(data => {
			const existingItem = data.Item;
			var dynamoParams = {
				TableName: table,
				Item: {
					numberOfQuestionsAsked: 0,
					updated: Date.now()
				}
			}
			if (existingItem) {
				dynamoParams.Item = existingItem
			}
			var triviaInfo = getTriviaQuestion.call(this, existingItem, name);
			var toShow = ""
			if (triviaInfo) {
				toShow = triviaInfo.question
				//this.emit(':tellWithCard', toShow, this.t('TRIVIA_INFO_TITLE'), toShow);// !!TODO maybe just tell
			} else {
				this.emit(':ask', "I cannot find the category "+name+". Please ask for a different category."+this.t('HELP_REPROMPT'));
			}
			// save dynamo params to our dynamo db table
			var numberOfQuestionsAsked = dynamoParams.Item.numberOfQuestionsAsked
			numberOfQuestionsAsked = numberOfQuestionsAsked + 1;
			dynamoParams.Item.numberOfQuestionsAsked = numberOfQuestionsAsked
			putParamsAndMessage.call(this, dynamoParams, toShow, ":tellWithCard", this.t('TRIVIA_INFO_TITLE'));

		}).catch(err => {
			console.error(err);
			this.emit(':ask', this.t('SORRY'));
		});
	}
}

function addRecipeForUser(filledSlots, userId, mealsMax) {
	if (filledSlots != undefined) {
		console.log("AddVerse")
		const title = filledSlots.slots.recipeTitle.value; // eggs benedict
		const suppliedIngredients = filledSlots.slots.recipeIngredients.value;// eggs and bread and butter
		const instructions = filledSlots.slots.instructions;// cook eggs sunny side up and toast bread
		var ingredientsList = suppliedIngredients.split(" and ");
		var dynamoItem = {
			id: title+" "+userId,
			title: title,
			ingredients: ingredientsList,
			timesSuggested: 0,
			userId: userId
		}
		if (instructions) {
			dynamoItem.instructions= instructions.value;
		}
		var params = {
			TableName: "foodTrackerRecipes",
			Item: dynamoItem
		};
		//putParamsAndMessage.call(this, params, "I've added your recipe for "+title+".", ":tellWithCard", this.t('SKILL_NAME'));

		dbPut(params).then(function(){
			var toShow = "Ingredients: "+ingredientsList.join(", ") + (instructions ? ".\nInstructions: "+instructions.value : "");
			if (supportsAPL.call(this, null)) {
				this.response.cardRenderer(this.t('TRIVIA_INFO_TITLE'), title + ": "+ toShow);
				this.response.speak("I've added your recipe for "+title+".");
				large['dataSources']['bodyTemplate1Data']['title'] = title
				large['dataSources']['bodyTemplate1Data']['textContent']['primaryText']['text'] =  "Ingredients: "+ingredientsList.join(", ") + (instructions ? ".\nInstructions: "+instructions.value : "")
				large['dataSources']['bodyTemplate1Data']['backgroundImage']['sources'][0]['url'] = "https://s3.amazonaws.com/food-tracker/images/carrots-food-fresh-616404.jpg"
				large['dataSources']['bodyTemplate1Data']['backgroundImage']['sources'][1]['url'] = "https://s3.amazonaws.com/food-tracker/images/carrots-food-fresh-616404.jpg"
				large['document']['theme'] = "dark"
				this.response._addDirective({
					type: 'Alexa.Presentation.APL.RenderDocument',
					varsion: '1.0',
					document: large['document'],
					datasources: large['dataSources']
				})

        if (mealsMax % 5 === 0) {
          this.response._addDirective({
              'type': 'Connections.SendRequest',
              'name': 'Upsell',
              'payload': {
                         'InSkillProduct': {
                            'productId': 'amzn1.adg.product.7570f523-b395-4322-a533-a1668a5f862a'
                         },
                        'upsellMessage': 'You can add up to 20 recipes for free, unlimited added with a subscription purchase...Do you want to know more?'
               },
              'token': 'correlationToken'
          })
        }
				this.emit(':responseReady');
			} else {
				this.emit(":tellWithCard", "I've added your recipe for "+title+".",  this.t('SKILL_NAME'), title+": "+toShow);
			}
		}.bind(this)).catch(err => {
			console.error(err);
			this.emit(':ask', this.t('SORRY'));
		});
	}
}


function removeRecipeForUser(filledSlots, userId) {
	// if (filledSlots != undefined){
		console.log("RemoveRecipe")
		// const title = filledSlots.slots.recipeTitle.value; // eggs benedict
		var params = {
			TableName: "dailyBreadUsers",//dailyBreadVerses
			Key: {
				userID: userId
			}
		};
		dbGet(params).then(function(item) {
			console.log(item)
			if (!item || !item.Item) {
				this.emit(":ask", "You are not signed up for Daily Bread emails. "+this.t('HELP_REPROMPT'));
			} else {
				dbDelete(params).then(function(item2) {
					var recipe = item.Item;
					this.emit(':tellWithCard', "You are no longer signed up for Daily Bread emails.", this.t('TRIVIA_INFO_TITLE'), "You are no longer signed up for Daily Bread emails.");
				}.bind(this)).catch(err => {
					console.error(err);
					this.emit(':ask', this.t('SORRY'));
				});
			}
		}.bind(this)).catch(err => {
			console.error(err);
			this.emit(':ask', this.t('SORRY'));
		});
		//putParamsAndMessage.call(this, params, "I've added your recipe for "+title+".", ":tellWithCard", this.t('SKILL_NAME'));
	// }
}
function removeRecentAddition(filledSlots, userId) {
	if (filledSlots != undefined){

		//// getTriviaQuestion.call(this, existingItem, null, location ? location.value : null, null, null, null, null, true)
		//var filledSlots = delegateSlotCollection.call(this);
		if (filledSlots.confirmationStatus !== "DENIED") {
		// const name = filledSlots.slots.food.value;
		// const location = filledSlots.slots.location.value;
		// const granularLocation = filledSlots.slots.granularLocation.value;

		//const { userId } = this.event.session.user;
		checkIfUserExists.call(this, userId)
		  .then(data => {
			const existingItem = data.Item;
			if (existingItem) {
      			var food = getTriviaQuestion.call(this, existingItem, null, null, null, true, null, null, null, true);
      			if (food) {
					data.userID = userId;
		            data.Item.updated = Date.now();
		            const dynamoParams = {
		        		TableName: table,
		            	Item: data.Item,
		        	};
    				var toTell = "I've removed "+food.name+" from the "+food.location+" "+(food.granularLocation||"")+". ";
    				putParamsAndMessage.call(this, dynamoParams, toTell, ":tellWithCard",  this.t('REMOVED_CARD_TITLE'));
				} else {
					this.emit(':ask', "I cannot find anything. Please add food first. "+this.t('HELP_REPROMPT'));
				}
			} else {
				this.emit(':ask', this.t('NO_FOOD')+" "+this.t('HELP_REPROMPT'));
			}
		}).catch(err => {
			console.error(err);
			this.emit(':ask', this.t('SORRY'));
		});
		} else {
			this.emit(':tell', this.t('NOT_REMOVED'));
		}
	}
}
function listRecipesForUser(filledSlots, userId) {//
	if (filledSlots != undefined){
		console.log("ListRecipes")
		//const title = filledSlots.slots.recipeTitle.value; // eggs benedict
		var params = {
			TableName: "foodTrackerRecipes",
			// ExpressionAttributeValues: {
				// ":value0": {
					// S: userId
				// }
			// },
			// FilterExpression: "userId = :value0",//""contains (userId, :userId)",//"userId = :userId",
			ProjectionExpression: 'id, title, ingredients, userId'
		};
		dbScan(params).then(function(recipes){
			console.log(recipes)
			console.log(userId)
			console.log("here")
			var titleArray = []
			var itemArray = []
			for (let item of recipes.Items) {
				if(item.userId == userId){
					titleArray.push(item.title)
					itemArray.push(item)
				}
			}
			titleArray.sort();
			console.log("array:")
			console.log(itemArray)

			itemArray = itemArray.sort(function(a, b){
    if(a.title < b.title) { return -1; }
    if(a.title > b.title) { return 1; }
    return 0;
})
			console.log(itemArray)
			var toShow = "You have "+titleArray.join(", ")+".";
			if (titleArray.length == 0) {
				toShow = "You do not have any recipes."
			}
			if (supportsAPL.call(this, null)) {
				this.response.cardRenderer(this.t('TRIVIA_INFO_TITLE'), toShow);
				this.response.speak(toShow);
				// large['dataSources']['bodyTemplate1Data']['title'] = "List Recipes"
				// large['dataSources']['bodyTemplate1Data']['textContent']['primaryText']['text'] =  "list"//"Ingredients: "+ingredientsList.join(", ") + (instructions ? ".\nInstructions: "+instructions.value : "")
				// large['dataSources']['bodyTemplate1Data']['backgroundImage']['sources'][0]['url'] = "https://s3.amazonaws.com/food-tracker/images/carrots-food-fresh-616404.jpg"
				// large['dataSources']['bodyTemplate1Data']['backgroundImage']['sources'][1]['url'] = "https://s3.amazonaws.com/food-tracker/images/carrots-food-fresh-616404.jpg"
				// large['document']['theme'] = "dark"
				list['dataSources']['listTemplate1Metadata']['title'] = "Recipes"
				var itemToClone = list['exampleListItem'];
				list['dataSources']['listTemplate1ListData']['listPage']['listItems'] = []
				var limit = 35;
				for(let item of itemArray){
					limit = limit-1;
					if(limit!=0){
						var newObj = clone(itemToClone);
						newObj['textContent']['primaryText']['text'] = item.title
						newObj['textContent']['secondaryText']['text'] = item.ingredients.join(", ")
						newObj['textContent']['tertiaryText']['text'] = ""

						list['dataSources']['listTemplate1ListData']['listPage']['listItems'].push(newObj)
					} else {
						console.log("here")
						var newObj = clone(itemToClone);
						var cont = newObj['textContent'];
						cont['primaryText']['text'] = "See the activity card for more.",
						cont['secondaryText']['text'] = "Sorry for the inconvenience. You can also view more on the website."
						cont['tertiaryText']['text'] = ""
						//console.log(item)
						//newObj['listItemIdentifier'] = item['primary']
						//newObj['token'] = item['primary']
						//newObj['ordinalNumber'] = ordinal
						//ordinal = ordinal + 1;
						// Duration: 185.06 ms fails
						// Duration Duration: 306.22 ms fails
						// Duration: 99.67 ms works
						// Duration: 113.11 ms	 fails
						//Duration: 87.36 ms fails??
						list['dataSources']['listTemplate1ListData']['listPage']['listItems'].push(newObj)
						break;
					}
				}

				this.response._addDirective({
					type: 'Alexa.Presentation.APL.RenderDocument',
					varsion: '1.0',
					document: list['document'],//large
					datasources: list['dataSources']//large
				})
				this.emit(':responseReady');
			} else {
				this.emit(':tellWithCard', toShow, this.t('TRIVIA_INFO_TITLE'), toShow);
			}
		}.bind(this)).catch(err => {
			console.error(err);
			this.emit(':ask', this.t('SORRY'));
		});
	}
}
function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

function playAudio(item, toShow, toTell, date) {

        if (supportsAudio.call(this, null) && item.Item.audioUrl) {
          // ask daily bread to play november 11 2019's verses
          // try november 11 2020 and add this to dynamo db https://daily-bread.s3.amazonaws.com/IMG_2089.mp3
            this.response._addDirective({
              "type": "AudioPlayer.Play",
              "playBehavior": "REPLACE_ALL",
              "audioItem": {
                "stream": {
                  "url": item.Item.audioUrl,
                  "token": "1234AAAABBBBCCCCCDDDDEEEEEFFFF",
                  // "expectedPreviousToken": "9876ZZZZZZZYYYYYYYYYXXXXXXXXXXX",
                  "offsetInMilliseconds": 0
                },
                "metadata": {
                  "title": "Daily Bread: verses for " + date,
                  "subtitle": "Provided by Christine",
                  "art": {
                    "sources": [
                      {
                        "url": "https://s3.amazonaws.com/food-tracker/images/carrots-food-fresh-616404.jpg"
                      }
                    ]
                  },
                  "backgroundImage": {
                    "sources": [
                      {
                        "url": "https://s3.amazonaws.com/food-tracker/images/carrots-food-fresh-616404.jpg"
                      }
                    ]
                  }
                }
              }
            })

              console.log(this.response)
      				this.emit(':responseReady');
          } else {
            console.log("Does not support Audio or '"+item.Item.audioUrl+"' is null")
          }
        //else
}
function showVideoOrAudio(item, toShow, toTell, date) {
          console.log("made it")
          var notAdded = true;
          if (item.Item.videoUrl) {
            if (supportsVideo.call(this, null)) {
              this.response._addDirective({
                "type": "VideoApp.Launch",
                "videoItem": {
                  "source": item.Item.videoUrl,
                  "metadata": {
                    "title": "Daily Bread: verses for " + date,
                    "subtitle": "Provided by Christine"
                  }
                }
              })
              notAdded = false;
            } else {
              throw "Doesn't support Video but is an APL. Weird."
            }
          }
// console.log(item.Item.audioUrl)

            // if (notAdded && !item.Item.audioUrl) {
              console.log(this.event.context);
              if (this.event.context.Viewport && this.event.context.Viewport.shape === "ROUND") {
                toShow = "Daily Bread\n" + date + "\n";
                if (item.Item.title) {
                  toShow = toShow + item.Item.title
                }
              }
        				this.response.cardRenderer(this.t('TRIVIA_INFO_TITLE'), date + ": "+ toTell);
        				this.response.speak(toTell);

              large['dataSources']['bodyTemplate1Data']['title'] = "Daily Bread: verses for " + date
      				large['dataSources']['bodyTemplate1Data']['textContent']['primaryText']['text'] = toShow //"Ingredients: "+recipe.ingredients.join(", ") + (recipe.instructions ? ".\nInstructions: "+recipe.instructions : "")
      				large['dataSources']['bodyTemplate1Data']['backgroundImage']['sources'][0]['url'] = "https://s3.amazonaws.com/food-tracker/images/carrots-food-fresh-616404.jpg"
      				large['dataSources']['bodyTemplate1Data']['backgroundImage']['sources'][1]['url'] = "https://s3.amazonaws.com/food-tracker/images/carrots-food-fresh-616404.jpg"
      				large['document']['theme'] = "light"
      				this.response._addDirective({
      					type: 'Alexa.Presentation.APL.RenderDocument',
      					varsion: '1.0',
      					document: large['document'],
      					datasources: large['dataSources']
      				})
      				this.emit(':responseReady');
          // }

}

function getRecipeForUser(filledSlots, userId) {//!!

		console.log("List Verses")
    var date = filledSlots.slots.recipeTitle.value;
    // ask daily bread play today's verse
      // const today = new Date(Date.now());
      // const year = 1900 + today.getYear();
      // const month = today.getMonth() + 1;
      // const day = today.getDate();
      // title = year +"-"+month+'-'+day;
    var params = {
      TableName: "dailyBreadVerses",
      Key: {
        date: date//+" "+userId
      }
    };
    console.log(date);
    dbGet(params).then(function(item) {
      console.log(item)
      if (!item || !item.Item) {//} || item.Item.userId != userId) {
        this.emit(":ask", "There aren't any verses for "+date+". "+this.t('HELP_REPROMPT'));
      } else {
        var toTell = item.Item.verses;
        var toShow = toTell;
        console.log("toTell");
        console.log(toTell);

        try {
          playAudio.call(this, item, toShow, toTell, date)
        } catch (errorOhNo) {
        	console.log(errorOhNo)
        }
          if (supportsAPL.call(this, null)) {

try {
  logDebug.call(this, "toTell")
	showVideoOrAudio.call(this, item, toShow, toTell, date)
} catch (errorOhNo) {
	console.log(errorOhNo)
          var notAdded = true;
//           if (item.Item.videoUrl) {
//             if (supportsVideo.call(this, null)) {
//               this.response._addDirective({
//                 "type": "VideoApp.Launch",
//                 "videoItem": {
//                   "source": item.Item.videoUrl,
//                   "metadata": {
//                     "title": "Daily Bread: verses for " + title,
//                     "subtitle": "Provided by Christine"
//                   }
//                 }
//               })
//               notAdded = false;
//             } else {
//               console.log("ffffail")
//             }
//           }
// console.log(item.Item.audioUrl)

            // if (notAdded && !item.Item.audioUrl) {
              console.log(this.event.context);
              if (this.event.context.Viewport && this.event.context.Viewport.shape === "ROUND") {
                toShow = "Daily Bread\n" + date + "\n";
                if (item.Item.title) {
                  toShow = toShow + item.Item.title
                }
              }
        				this.response.cardRenderer(this.t('TRIVIA_INFO_TITLE'), date + ": "+ toTell);
        				this.response.speak(toTell);

              large['dataSources']['bodyTemplate1Data']['title'] = "Daily Bread: verses for " + date
      				large['dataSources']['bodyTemplate1Data']['textContent']['primaryText']['text'] = toShow //"Ingredients: "+recipe.ingredients.join(", ") + (recipe.instructions ? ".\nInstructions: "+recipe.instructions : "")
      				large['dataSources']['bodyTemplate1Data']['backgroundImage']['sources'][0]['url'] = "https://s3.amazonaws.com/food-tracker/images/carrots-food-fresh-616404.jpg"
      				large['dataSources']['bodyTemplate1Data']['backgroundImage']['sources'][1]['url'] = "https://s3.amazonaws.com/food-tracker/images/carrots-food-fresh-616404.jpg"
      				large['document']['theme'] = "light"
      				this.response._addDirective({
      					type: 'Alexa.Presentation.APL.RenderDocument',
      					varsion: '1.0',
      					document: large['document'],
      					datasources: large['dataSources']
      				})
      				this.emit(':responseReady');
          // }
}
  			} else {
          console.log("made it here, so just having Alexa say it")//no audio clip
          // TODO: do not substring toShow, make another variable.
          // But this actually does have issues, Alexa quit talking after a certain num of chars.
          if (toShow.length > 7950) {
            toShow = toShow.substring(0, 7950)+"...";
          }
  				this.emit(':tellWithCard', toShow, this.t('TRIVIA_INFO_TITLE'), toTell);//, main);
  			}
      }
    }.bind(this)).catch(err => {
      console.error(err);
      this.emit(':ask', this.t('SORRY'));
    });

    // dbScan(params).then(function(recipes){
		// 	console.log(recipes)
		// 	console.log(userId)
		// 	console.log("here")
		// 	var recipe = null
		// 	for (let item of recipes.Items) {
		// 		if(item.id == title) {//}+" "+userId) {
		// 			recipe = item//titleArray.push(item.id)
		// 			break;
		// 		}
		// 	}
		// 	var toShow = null;
		// 	if (recipe == null) {
		// 		for (let item of recipes.Items) {
		// 			if(item.id == title) {
		// 				recipe = item//titleArray.push(item.id)
		// 				break;
		// 			}
		// 		}
    //
		// 		if (recipe == null) {
		// 			toShow = "You do not have a recipe called "+title+"."
		// 		} else {
		// 			toShow = "The ingredients are "+recipe.ingredients.join(", ") + (recipe.instructions ? ". Instructions: "+recipe.instructions : "")
		// 		}
		// 	} else {
		// 		toShow = "The ingredients are "+recipe.ingredients.join(", ") + (recipe.instructions ? ". Instructions: "+recipe.instructions : "")
		// 	}
		// 	if (supportsAPL.call(this, null) && recipe) {
		// 		this.response.cardRenderer(this.t('TRIVIA_INFO_TITLE'), title + ": "+ toShow);
		// 		this.response.speak(toShow);
		// 		large['dataSources']['bodyTemplate1Data']['title'] = title
		// 		large['dataSources']['bodyTemplate1Data']['textContent']['primaryText']['text'] =  "Ingredients: "+recipe.ingredients.join(", ") + (recipe.instructions ? ".\nInstructions: "+recipe.instructions : "")
		// 		large['dataSources']['bodyTemplate1Data']['backgroundImage']['sources'][0]['url'] = "https://s3.amazonaws.com/food-tracker/images/carrots-food-fresh-616404.jpg"
		// 		large['dataSources']['bodyTemplate1Data']['backgroundImage']['sources'][1]['url'] = "https://s3.amazonaws.com/food-tracker/images/carrots-food-fresh-616404.jpg"
		// 		large['document']['theme'] = "dark"
		// 		this.response._addDirective({
		// 			type: 'Alexa.Presentation.APL.RenderDocument',
		// 			varsion: '1.0',
		// 			document: large['document'],
		// 			datasources: large['dataSources']
		// 		})
		// 		this.emit(':responseReady');
		// 	} else {
		// 		this.emit(':tellWithCard', toShow, this.t('TRIVIA_INFO_TITLE'), toShow);//, main);
		// 	}
		// }.bind(this)).catch(err => {
		// 	console.error(err);
		// 	this.emit(':ask', this.t('SORRY'));
		// });
	// }
}

function logDebug(debug) {
  try {
    if (process.env.ENV_VARIABLE == "true") {
      console.log(debug)
    }
  } catch (error) {
    console.log(error)
  }
}

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
console.log("Alexa contents!!")
console.log(alexa);

var lambda = new awsSDK.Lambda({
  region: 'us-east-1' //change to your region
});

lambda.invoke({
  FunctionName: 'alexa',
  Payload: JSON.stringify(event,context) // pass params
}, function(error, data) {
  if (error) {
console.log("error here:")
console.log(error)
    //context.done('error', error);
  }
  if(data && data.Payload){
console.log("payload!")
console.log(data.Payload)
console.log(data)
   //context.succeed(data.Payload)
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
  }
});
};
// utterances:

/**

TESTing:
    ask daily bread play today's verse
    ask daily bread to play november 11 2019's verses
    ask daily bread to email november 11 2019 verses

    ask daily bread to play
    ask daily bread to read
    ask daily bread to read today
    ask daily bread to sign up for daily emails
    ask daily bread to get emails
    ask daily bread to Deregister
    ask daily bread to Subscribe
    ask daily bread to Refund
    ask daily bread to play today's Verses
    ask daily bread to play yesterday's Verses
    ask daily bread to play tomorrow's Verses
    ask daily bread to play this Wednesday's Verses
    ask daily bread to play verses from november 11 2019
    ask daily bread to email today's Verses
    ask daily bread to email yesterday's verses
    ask daily bread to Refund
    ask daily bread to get emails
    ask daily bread to email day after tomorrow's Verses
    ask daily bread to play december 4 2020
    ask daily bread to email december 4 2020



    TODO:
3. Figure out how to have video play on Alexa
4. ensure < and > don't make it into the verses
5. record videos and save to db
1. Do I need this? : Implement a double opt-in strategy. When users sign up to receive email from you, send them a message with a confirmation link, and do not start sending them email until they confirm their address by clicking that link. A double opt-in strategy helps reduce the number of hard bounces resulting from typographical errors.

set up something for bounces and complaints
https://docs.aws.amazon.com/ses/latest/DeveloperGuide/monitor-sending-activity.html
view bounce rates and complaint rates here: https://console.aws.amazon.com/ses/home?region=us-east-1#reputation-dashboard:
2. make echo show/firestick tv text scrollable?!? I thought it was on the list side for sure.


Steps for updating:
1. add to dynamo db by copying from https://www.biblegateway.com/passage/?search=Acts+15%3A1-35%3B+Galatians+2&version=NIV;KJV KJV.
2. date is key and is in format 2019-10-03
3. title is verse eg Acts 13:1-3
4. audioUrl is the audio url in mp3 format, currently hosted on s3 (upload from computer and make public, copy link to db)
4a. https://itstillworks.com/convert-mp3-audio-ipod-format-7500.html
5. videoUrl is the video url in mp4 format, but could be a youtube video actually and would be cheaper, and could make podcast
5a. have dad record his voice, send it to me via text, I'll text it to my email (or send via airdrop to a mac if over 25mb)-- and copy-paste the text, reuse a couple clips, and create it here: https://www.kapwing.com/studio/editor
6. url is the bible gateway link that has NIV and KJV so users can read in another format (language or publication)

**/
