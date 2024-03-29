
const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const assert = require('node:assert');

jest.setTimeout(50000)

describe("html", function () {
	
	test("Code Compiles", function () {
		var result = "true"
		expect(result).toBe("true")
	});
	
	test("test html", async function () {
		console.log(process.env)
		var builder = new Builder().forBrowser('firefox');
		let options = new firefox.Options();
		builder.setFirefoxOptions(options.addArguments('--headless'));
		let driver
		try {
			driver = await builder.build();
			await driver.get('https://s3.amazonaws.com/christine-trivia/index.html');
			
			var title = await driver.wait(until.elementIsVisible(driver.findElement(By.xpath('/html/body/div[1]/h2'))), 1000).getAttribute('innerHTML');
			// var title = driver.findElement(By.xpath('/html/body/div[1]/h2'));//.getAttribute('innerHTML').text;
			console.log(title)
			assert.equal(title, "Christine Trivia");
			
			await driver.wait(until.elementIsVisible(driver.findElement(By.id('LoginWithAmazon'))), 1000).getAttribute('innerHTML');
			await driver.findElement(By.id('LoginWithAmazon')).click();


	
			// await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
			// await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
			// driver.get('https://s3.amazonaws.com/christine-trivia/index.html');
			
			// await driver.get('http://www.google.com/ncr');
			// await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
			// await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
			
		} catch (e) {
			console.log("Hi!!!")
			// if (driver) {
			// 	console.log(" driver logs:")
			// 	for (let entry in driver.get_log('browser')) {
	  //   				console.log(entry)
			// 	}
			// }
			throw e;
		} finally {
			if (driver) {
				await driver.quit();
			}
		}

	});

});
