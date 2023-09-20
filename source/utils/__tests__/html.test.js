/*
Mocha tests for the Alexa skill "Hello World" example (https://github.com/alexa/skill-sample-nodejs-hello-world).
Using the Alexa Skill Test Framework (https://github.com/BrianMacIntosh/alexa-skill-test-framework).
Run with 'mocha examples/skill-sample-nodejs-hello-world/helloworld-tests.js'.
*/

// include the testing framework
var webdriver = require('selenium-webdriver');
// from selenium import webdriver
// from selenium.webdriver.chrome.options import Options

describe("html", function () {
	
	test("Code Compiles", function () {
		var result = "true"
		expect(result).toBe("true")
	});
	
	test("test html", async function () {
		var searchString = "Automation testing with Selenium";
		
		var chrome_options = webdriver.chrome.Options()
		chrome_options.add_argument('--headless')
		chrome_options.add_argument('--no-sandbox')
		chrome_options.add_argument('--disable-dev-shm-usage')
		var driver = webdriver.Chrome('/usr/bin/chromedriver', chrome_options=chrome_options)
		driver.get('https://s3.amazonaws.com/christine-trivia/index.html')
		
		//To wait for browser to build and launch properly
		// let driver = await new webdriver.Builder().forBrowser("chrome").build();
		
		//To fetch http://google.com from the browser with our code.
		// await driver.get("https://s3.amazonaws.com/christine-trivia/index.html");
		    
		//To send a search query by passing the value in searchString.
		//await driver.findElement(By.name("q")).sendKeys(searchString,Key.RETURN);
		
		//Verify the page title and print it
		var title = await driver.getTitle();
		console.log('Title is:', title);
		
		//It is always a safe practice to quit the browser after execution
		await driver.quit();

	});

});
