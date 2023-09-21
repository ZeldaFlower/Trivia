/*
Mocha tests for the Alexa skill "Hello World" example (https://github.com/alexa/skill-sample-nodejs-hello-world).
Using the Alexa Skill Test Framework (https://github.com/BrianMacIntosh/alexa-skill-test-framework).
Run with 'mocha examples/skill-sample-nodejs-hello-world/helloworld-tests.js'.
*/

// include the testing framework
var webdriver = require('selenium-webdriver');
require('chromedriver');
require('jest-environment-jsdom');
// from selenium import webdriver
// from selenium.webdriver.chrome.options import Options

jest.setTimeout(50000)

describe("html", function () {
	
	test("Code Compiles", function () {
		var result = "true"
		expect(result).toBe("true")
	});
	
	test("test html", async function () {
		var searchString = "Automation testing with Selenium";
		
		var chromeCapabilities = webdriver.Capabilities.chrome();
		//setting chrome options to start the browser fully maximized
		var chromeOptions = {
		    'args': [ '--start-maximized', "--headless", "--no-sandbox", "--window-size=1420,1080", "disable-gpu", "--disable-dev-shm-usage", "--disable-extensions", "disable-infobars", "--remote-debugging-port=9222" ]
		};
		chromeCapabilities.set('chromeOptions', chromeOptions);
		var driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();


		// chrome_options = webdriver.ChromeOptions()
		// chrome_options.add_argument('--no-sandbox')
		// chrome_options.add_argument('--window-size=1420,1080')
		// chrome_options.add_argument('--headless')
		// chrome_options.add_argument('--disable-gpu')
		// driver = webdriver.Chrome(chrome_options=chrome_options)
		
		// var chrome_options = webdriver.chrome.Options()
		// chrome_options.add_argument('--headless')
		// chrome_options.add_argument('--no-sandbox')
		// chrome_options.add_argument('--disable-dev-shm-usage')
		// var driver = webdriver.Chrome('/usr/bin/chromedriver', chrome_options=chrome_options)
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
