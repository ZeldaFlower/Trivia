/*
Mocha tests for the Alexa skill "Hello World" example (https://github.com/alexa/skill-sample-nodejs-hello-world).
Using the Alexa Skill Test Framework (https://github.com/BrianMacIntosh/alexa-skill-test-framework).
Run with 'mocha examples/skill-sample-nodejs-hello-world/helloworld-tests.js'.
*/

// // include the testing framework
// var webdriver = require('selenium-webdriver');
// require('jest-environment-jsdom');
const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
// from selenium import webdriver
// from selenium.webdriver.chrome.options import Options

jest.setTimeout(50000)

describe("html", function () {
	
	test("Code Compiles", function () {
		var result = "true"
		expect(result).toBe("true")
	});
	
	test("test html", async function () {
		// example from selenium website:
		console.log(process.env)
		var builder = new Builder().forBrowser('firefox');
		// var capabilities = Capabilities.firefox();
		// var options = {
		//     'args':  [ "--headless", "--no-sandbox", "--window-size=1420,1080", "--disable-gpu", "--disable-dev-shm-usage" ]
		// };

		// capabilities.set('firefoxOptions', options)
		// capabilities['loggingPrefs'] = {'browser': 'ALL'}
		// builder.withCapabilities(capabilities);
		var options = firefox.Options();
		builder.setFirefoxOptions(options.addArguments('--headless'));
		let driver
		try {
			driver = await builder.build();
			await driver.get('http://www.google.com/ncr');
			await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
			await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
			// driver.get('https://s3.amazonaws.com/christine-trivia/index.html');
		} catch (e) {
			console.log("Hi!!!")
			if (driver) {
			console.log(" driver logs:")
				for (let entry in driver.get_log('browser')) {
	    				console.log(entry)
				}
			}
			throw e;
		} finally {
			if (driver) {
				await driver.quit();
			}
		}
		
		// var chromeCapabilities = webdriver.Capabilities.chrome();
		// //setting chrome options to start the browser fully maximized
		// var chromeOptions = {
		//     'args': [ '--start-maximized', "--headless", "--no-sandbox", "--window-size=1420,1080", "--disable-gpu", "--disable-dev-shm-usage", "disable-extensions", "--disable-infobars", "--remote-debugging-port=9222" ]
		// };
		// chromeCapabilities.set('chromeOptions', chromeOptions);
		// var driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();


		
		// var searchString = "Automation testing with Selenium";
		
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
		// driver.get('https://s3.amazonaws.com/christine-trivia/index.html')
		
		// //To wait for browser to build and launch properly
		// // let driver = await new webdriver.Builder().forBrowser("chrome").build();
		
		// //To fetch http://google.com from the browser with our code.
		// // await driver.get("https://s3.amazonaws.com/christine-trivia/index.html");
		    
		// //To send a search query by passing the value in searchString.
		// //await driver.findElement(By.name("q")).sendKeys(searchString,Key.RETURN);
		
		// //Verify the page title and print it
		// var title = await driver.getTitle();
		// console.log('Title is:', title);
		
		// //It is always a safe practice to quit the browser after execution
		// await driver.quit();

	});

});
