const { fireEvent, screen, waitFor } = require('@testing-library/dom');
// Removed require('@testing-library/jest-dom/extend-expect') to avoid module not found error

// Mock fetch globally
global.fetch = jest.fn();

// Mock window.alert to avoid errors in tests
global.alert = jest.fn();

describe('KnowledgeBase UI', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ul id="recent-topics"></ul>
      <form id="add-topic-form" class="hidden">
        <input type="text" id="topic-name" placeholder="Add new topic" required />
        <button type="submit">Add Topic</button>
      </form>
      <section class="links-section">
        <h2 id="current-topic-title">Select a topic</h2>
        <div id="add-url-message" class="hidden"></div>
        <form id="add-link-form" class="hidden">
          <input type="text" id="title" placeholder="Name" required />
          <input type="url" id="url" placeholder="URL" required />
          <button type="submit">Add Link</button>
        </form>
        <ul id="links-list"></ul>
      </section>
      <button id="add-topic-btn">Add New Topic</button>
    `;
    fetch.mockClear();
    global.alert.mockClear();

    // Require app.js here to attach event listeners
    jest.isolateModules(() => {
      require('./app.js');
    });
  });

  test('add topic button shows add topic form', () => {
    const addTopicBtn = screen.getByText('Add New Topic');
    const addTopicForm = document.getElementById('add-topic-form');
    expect(addTopicForm.classList.contains('hidden')).toBe(true);

    fireEvent.click(addTopicBtn);

    expect(addTopicForm.classList.contains('hidden')).toBe(false);
  });

  test('add topic form submission calls fetch with correct data', async () => {
    fetch.mockResolvedValueOnce({ ok: true });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'Test Topic' }],
    });

    const addTopicForm = document.getElementById('add-topic-form');
    const topicNameInput = document.getElementById('topic-name');

    fireEvent.click(screen.getByText('Add New Topic'));
    topicNameInput.value = 'Test Topic';

    fireEvent.submit(addTopicForm);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/topics'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test Topic' }),
        })
      );
    });
  });

  // Additional tests for adding links, loading recent topics, etc. can be added here
});
