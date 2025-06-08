/**
 * Basic frontend UI test script using Puppeteer
 * Tests adding topics, adding links, and UI element visibility
 */

const puppeteer = require('puppeteer');

async function runUITests() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Change this URL to your local running app URL
  const appUrl = 'http://localhost:3000';

  try {
    await page.goto(appUrl);

    // Test adding a new topic
    await page.waitForSelector('#add-topic-form input#topic-name');
    await page.type('#add-topic-form input#topic-name', 'UI Test Topic');
    await page.click('#add-topic-form button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 1000)); // wait for UI update

    // Check if new topic appears in recent topics list
    const topicExists = await page.evaluate(() => {
      const topics = Array.from(document.querySelectorAll('#recent-topics li'));
      return topics.some(li => li.textContent.includes('UI Test Topic'));
    });
    console.log('New topic added to recent topics:', topicExists);

    // Select the new topic
    await page.evaluate(() => {
      const topics = Array.from(document.querySelectorAll('#recent-topics li'));
      const topic = topics.find(li => li.textContent.includes('UI Test Topic'));
      if (topic) topic.click();
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test adding a new link
    await page.waitForSelector('#add-link-form input#title');
    await page.type('#add-link-form input#title', 'UI Test Link');
    await page.type('#add-link-form input#url', 'https://example.com');
    await page.click('#add-link-form button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Check if new link appears in links list
    const linkExists = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.link-item h3 a'));
      return links.some(a => a.textContent.includes('UI Test Link'));
    });
    console.log('New link added to links list:', linkExists);

    // Check if "Add URL to the topic [topic name]" message is visible
    const messageVisible = await page.evaluate(() => {
      const msg = document.getElementById('add-url-message');
      return msg && msg.textContent.includes('UI Test Topic') && !msg.classList.contains('hidden');
    });
    console.log('Add URL message visible:', messageVisible);

    await browser.close();

    if (topicExists && linkExists && messageVisible) {
      console.log('Frontend UI tests passed.');
    } else {
      console.log('Frontend UI tests failed.');
    }
  } catch (error) {
    console.error('Error during frontend UI tests:', error);
    await browser.close();
  }
}

runUITests();
