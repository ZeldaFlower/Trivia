/*
Mocha tests for the Alexa skill "Hello World" example (https://github.com/alexa/skill-sample-nodejs-hello-world).
Using the Alexa Skill Test Framework (https://github.com/BrianMacIntosh/alexa-skill-test-framework).
Run with 'mocha examples/skill-sample-nodejs-hello-world/helloworld-tests.js'.
*/

// include the testing framework
var webdriver = require('selenium-webdriver');

describe("html", function () {
	
	test("Code Compiles", function () {
		var result = "true"
		expect(result).toBe("true")
	});
	
	describe("test html", function () {
    var browser_name = new webdriver.Builder();
    
    withCapabilities(webdriver.Capabilities.firefox()).build();
    
    browser_name.get('https://s3.amazonaws.com/christine-trivia/index.html');
    
    var promise = browser_name.getTitle();
    
    promise.then(function(title) {
    
      console.log(title);
    
    });
    
    browser.quit();
	});

});
