const axios = require('axios');

const apiBaseUrl = 'http://localhost:3000/api';

async function testTopics() {
  console.log('Testing Topics API...');
  // Test GET /topics
  let response = await fetch(apiBaseUrl + '/topics');
  let data = await response.json();
  console.log('GET /topics:', data);

  // Test POST /topics
  response = await fetch(apiBaseUrl + '/topics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Topic' }),
  });
  data = await response.json();
  console.log('POST /topics:', data);

  // Test GET /topics/recent
  response = await fetch(apiBaseUrl + '/topics/recent');
  data = await response.json();
  console.log('GET /topics/recent:', data);
}

async function testLinks(topicId) {
  console.log('Testing Links API...');
  // Test POST /links
  let response = await fetch(apiBaseUrl + '/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic_id: topicId, name: 'Test Link', url: 'https://example.com' }),
  });
  let data = await response.json();
  console.log('POST /links:', data);

  // Test GET /links?topic_id=topicId
  response = await fetch(apiBaseUrl + '/links?topic_id=' + topicId);
  data = await response.json();
  console.log('GET /links?topic_id=', topicId, data);

  // Test PUT /links/:id
  if (data.length > 0) {
    const linkId = data[0].id;
    response = await fetch(apiBaseUrl + '/links/' + linkId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id: topicId, name: 'Updated Link', url: 'https://updated.com' }),
    });
    data = await response.json();
    console.log('PUT /links/:id:', data);

    // Test DELETE /links/:id
    response = await fetch(apiBaseUrl + '/links/' + linkId, {
      method: 'DELETE',
    });
    console.log('DELETE /links/:id status:', response.status);
  }
}

async function runTests() {
  await testTopics();
  // Fetch topics to get a valid topicId for links tests
  const response = await fetch(apiBaseUrl + '/topics');
  const topics = await response.json();
  if (topics.length > 0) {
    await testLinks(topics[0].id);
  } else {
    console.log('No topics found to test links API.');
  }
}

runTests().catch(err => {
  console.error('Error during API tests:', err);
});
