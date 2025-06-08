const apiBaseUrl = 'http://localhost:3000/api';

let currentTopicId = null;
let currentTopicName = '';
let allTopics = [];

const recentTopicsList = document.getElementById('recent-topics');
const addTopicForm = document.getElementById('add-topic-form');
const addLinkForm = document.getElementById('add-link-form');
const linksList = document.getElementById('links-list');
const currentTopicTitle = document.getElementById('current-topic-title');
const addUrlMessage = document.getElementById('add-url-message');
const searchInput = document.getElementById('search');
const searchResultsList = document.getElementById('search-results');

// Removed search input event listener to disable search action

async function fetchTopics() {
  try {
    const response = await fetch(apiBaseUrl + '/topics');
    if (!response.ok) {
      alert('Failed to fetch topics');
      return [];
    }
    return await response.json();
  } catch (error) {
    alert('Failed to fetch topics');
    return [];
  }
}

async function fetchRecentTopics() {
  try {
    const response = await fetch(apiBaseUrl + '/topics/recent');
    if (!response.ok) {
      alert('Failed to fetch recent topics');
      return [];
    }
    return await response.json();
  } catch (error) {
    alert('Failed to fetch recent topics');
    return [];
  }
}

async function fetchLinks(topicId = null, query = '') {
  let url = apiBaseUrl + '/links';
  const params = [];
  if (topicId) {
    params.push('topic_id=' + encodeURIComponent(topicId));
  }
  if (query) {
    params.push('q=' + encodeURIComponent(query));
  }
  if (params.length > 0) {
    url += '?' + params.join('&');
  }
  const response = await fetch(url);
  if (!response.ok) {
    alert('Failed to fetch links');
    return [];
  }
  return await response.json();
}

function createRecentTopicElement(topic) {
  const li = document.createElement('li');
  li.textContent = topic.name;
  li.dataset.id = topic.id;
  li.onclick = () => {
    selectTopic(topic.id, topic.name);
  };
  return li;
}

function createLinkElement(link) {
  const li = document.createElement('li');
  li.className = 'link-item';

  const title = document.createElement('h3');
  const linkAnchor = document.createElement('a');
  linkAnchor.href = link.url;
  linkAnchor.target = '_blank';
  linkAnchor.textContent = link.name;
  title.appendChild(linkAnchor);

  const editButton = document.createElement('button');
  editButton.className = 'edit';
  editButton.textContent = 'Edit';
  editButton.onclick = () => editLink(link);

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete';
  deleteButton.textContent = 'Delete';
  deleteButton.onclick = () => deleteLink(link.id);

  li.appendChild(title);
  li.appendChild(editButton);
  li.appendChild(deleteButton);

  return li;
}

async function loadRecentTopics() {
  const recentTopics = await fetchRecentTopics();
  recentTopicsList.innerHTML = '';
  recentTopics.forEach(topic => {
    const li = createRecentTopicElement(topic);
    recentTopicsList.appendChild(li);
  });
}

async function loadLinks(query = '') {
  if (!currentTopicId) {
    linksList.innerHTML = '';
    addLinkForm.classList.add('hidden');
    searchInput.classList.add('hidden');
    currentTopicTitle.textContent = 'Select a topic';
    if (addUrlMessage) addUrlMessage.classList.add('hidden');
    return;
  }
  addLinkForm.classList.remove('hidden');
  searchInput.classList.remove('hidden');
  if (addUrlMessage) {
    addUrlMessage.classList.remove('hidden');
    addUrlMessage.textContent = `Add URL to the topic "${currentTopicName}"`;
  }
  currentTopicTitle.textContent = 'Links for: ' + currentTopicName;
  const links = await fetchLinks(currentTopicId, query);
  linksList.innerHTML = '';
  links.forEach(link => {
    const li = createLinkElement(link);
    linksList.appendChild(li);
  });
}

function selectTopic(id, name) {
  currentTopicId = id;
  currentTopicName = name;
  document.querySelectorAll('#recent-topics li').forEach(li => {
    li.classList.toggle('active', li.dataset.id == id);
  });
  loadLinks();
}

addTopicForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('topic-name').value.trim();
  if (!name) return;
  const response = await fetch(apiBaseUrl + '/topics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (response.ok) {
    addTopicForm.reset();
    await loadRecentTopics();
    allTopics = await fetchTopics();  // Update allTopics after loading recent topics
    const newTopic = allTopics.find(t => t.name === name);
    if (newTopic) {
      selectTopic(newTopic.id, newTopic.name);
      if (addUrlMessage) {
        addUrlMessage.textContent = `Add URL to the topic [${newTopic.name}]`;
        addUrlMessage.classList.remove('hidden');
      }
      loadLinks();
    }
  } else {
    alert('Failed to add topic');
  }
});

addLinkForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('title').value.trim();
  const url = document.getElementById('url').value.trim();

  if (!name || !url) {
    alert('Name and URL are required');
    return;
  }

  const response = await fetch(apiBaseUrl + '/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic_id: currentTopicId, name, url }),
  });

  if (response.ok) {
    addLinkForm.reset();
    loadLinks();
  } else {
    alert('Failed to add link');
  }
});


document.getElementById('add-topic-btn').addEventListener('click', () => {
  const addTopicForm = document.getElementById('add-topic-form');
  const topicNameInput = document.getElementById('topic-name');
  addTopicForm.classList.remove('hidden');
  topicNameInput.focus();
});

// Initial load
loadRecentTopics();
