// Admin Panel Management — Cloudflare KV API Client

const API_BASE = '/api';
let sessionPassword = null;

class AdminApiClient {
  async authenticate(password) {
    try {
      const response = await fetch(`${API_BASE}/admin/ping`, {
        headers: { 'X-Admin-Password': password },
      });
      if (response.ok) {
        sessionPassword = password;
        sessionStorage.setItem('adminPassword', password);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Auth error:', err);
      return false;
    }
  }

  isAuthenticated() {
    const stored = sessionStorage.getItem('adminPassword');
    if (stored) {
      sessionPassword = stored;
      return true;
    }
    return false;
  }

  logout() {
    sessionPassword = null;
    sessionStorage.removeItem('adminPassword');
  }

  async getAllPosts() {
    try {
      const response = await fetch(`${API_BASE}/posts`, {
        headers: sessionPassword ? { 'X-Admin-Password': sessionPassword } : {},
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data.posts || [];
    } catch (err) {
      console.error('Error fetching posts:', err);
      return [];
    }
  }

  async createPost(postData) {
    try {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': sessionPassword,
        },
        body: JSON.stringify(postData),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data.post;
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  }

  async updatePost(id, postData) {
    try {
      const response = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': sessionPassword,
        },
        body: JSON.stringify(postData),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data.post;
    } catch (err) {
      console.error('Error updating post:', err);
      throw err;
    }
  }

  async deletePost(id) {
    try {
      const response = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': sessionPassword },
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return true;
    } catch (err) {
      console.error('Error deleting post:', err);
      throw err;
    }
  }

  async getPost(id) {
    try {
      const response = await fetch(`${API_BASE}/posts/${id}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data.post;
    } catch (err) {
      console.error('Error fetching post:', err);
      return null;
    }
  }
}

// Initialize admin manager
const adminManager = new AdminApiClient();

// DOM Elements
const loginView = document.getElementById('loginView');
const adminView = document.getElementById('adminView');
const loginForm = document.getElementById('loginForm');
const adminPassword = document.getElementById('adminPassword');
const loginMessage = document.getElementById('loginMessage');
const logoutBtn = document.getElementById('logoutBtn');
const postForm = document.getElementById('postForm');
const formMessage = document.getElementById('formMessage');
const postsTableBody = document.getElementById('postsTableBody');
const postsTable = document.getElementById('postsTable');
const emptyPostsMessage = document.getElementById('emptyPostsMessage');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Set today's date as default
document.getElementById('postDate').valueAsDate = new Date();

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
});

// Check authentication status
async function checkAuth() {
  if (adminManager.isAuthenticated()) {
    showAdminView();
    await loadPosts();
  } else {
    showLoginView();
  }
}

// Show login view
function showLoginView() {
  loginView.style.display = 'block';
  adminView.style.display = 'none';
  logoutBtn.style.display = 'none';
  loginForm.reset();
}

// Show admin view
function showAdminView() {
  loginView.style.display = 'none';
  adminView.style.display = 'block';
  logoutBtn.style.display = 'block';
}

// Login handler
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = adminPassword.value;

  if (await adminManager.authenticate(password)) {
    loginMessage.style.display = 'none';
    showAdminView();
    await loadPosts();
    loginForm.reset();
  } else {
    showMessage(loginMessage, 'Invalid password. Try again.', 'error');
  }
});

// Logout handler
logoutBtn?.addEventListener('click', () => {
  adminManager.logout();
  checkAuth();
});

// Tab navigation
tabButtons.forEach((btn) => {
  btn.addEventListener('click', async () => {
    const tabName = btn.getAttribute('data-tab');

    // Update active button
    tabButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    // Update active content
    tabContents.forEach((content) => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');

    // Load posts table when switching to all-posts tab
    if (tabName === 'all-posts') {
      await loadPosts();
    }
  });
});

// Post form handler
postForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(postForm);
  const postData = {
    title: formData.get('title'),
    category: formData.get('category'),
    author: formData.get('author'),
    emoji: formData.get('emoji'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    date: formData.get('date'),
    status: formData.get('status'),
  };

  // Validate required fields
  if (!postData.title || !postData.category || !postData.author) {
    showMessage(formMessage, 'Please fill in all required fields', 'error');
    return;
  }

  if (postData.emoji.length === 0) {
    showMessage(formMessage, 'Please select an emoji', 'error');
    return;
  }

  try {
    await adminManager.createPost(postData);
    showMessage(
      formMessage,
      '✅ Post published successfully!',
      'success'
    );
    postForm.reset();
    document.getElementById('postDate').valueAsDate = new Date();

    // Switch to all posts tab to show the new post
    setTimeout(() => {
      document.querySelector('[data-tab="all-posts"]').click();
    }, 1500);
  } catch (error) {
    showMessage(formMessage, 'Error creating post. Please try again.', 'error');
  }
});

// Load and display posts
async function loadPosts() {
  const posts = await adminManager.getAllPosts();

  if (posts.length === 0) {
    postsTable.style.display = 'none';
    emptyPostsMessage.style.display = 'block';
    return;
  }

  postsTable.style.display = 'block';
  emptyPostsMessage.style.display = 'none';

  postsTableBody.innerHTML = posts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(
      (post) => `
    <tr>
      <td><strong>${post.title}</strong></td>
      <td>${post.category}</td>
      <td>${post.author}</td>
      <td>${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
      <td>
        <span class="status-badge status-${post.status}">
          ${post.status.charAt(0).toUpperCase() + post.status.slice(1)}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn-table btn-table-view" onclick="viewBlogPost(${post.id})">View</button>
          <button class="btn-table btn-table-edit" onclick="editPost(${post.id})">Edit</button>
          <button class="btn-table btn-table-delete" onclick="deletePostConfirm(${post.id})">Delete</button>
        </div>
      </td>
    </tr>
    `
    )
    .join('');
}

// Edit post
async function editPost(postId) {
  const post = await adminManager.getPost(postId);
  if (!post) return;

  // Populate form with post data
  document.getElementById('postTitle').value = post.title;
  document.getElementById('postCategory').value = post.category;
  document.getElementById('postAuthor').value = post.author;
  document.getElementById('postEmoji').value = post.emoji;
  document.getElementById('postExcerpt').value = post.excerpt;
  document.getElementById('postContent').value = post.content;
  document.getElementById('postStatus').value = post.status;
  document.getElementById('postDate').value = post.date;

  // Change form submission to update instead
  postForm.onsubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(postForm);
    const postData = {
      title: formData.get('title'),
      category: formData.get('category'),
      author: formData.get('author'),
      emoji: formData.get('emoji'),
      excerpt: formData.get('excerpt'),
      content: formData.get('content'),
      date: formData.get('date'),
      status: formData.get('status'),
    };

    if (!postData.title || !postData.category || !postData.author) {
      showMessage(formMessage, 'Please fill in all required fields', 'error');
      return;
    }

    if (postData.emoji.length === 0) {
      showMessage(formMessage, 'Please select an emoji', 'error');
      return;
    }

    try {
      await adminManager.updatePost(postId, postData);
      showMessage(formMessage, '✅ Post updated successfully!', 'success');

      // Reset form submission handler
      postForm.onsubmit = null;
      postForm.reset();
      document.getElementById('postDate').valueAsDate = new Date();

      setTimeout(() => {
        document.querySelector('[data-tab="all-posts"]').click();
      }, 1500);
    } catch (error) {
      showMessage(formMessage, 'Error updating post. Please try again.', 'error');
    }
  };

  // Switch to new-post tab for editing
  document.querySelector('[data-tab="new-post"]').click();
  document.querySelector('h2').textContent = 'Edit Post';

  // Scroll to form
  document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
}

// Delete post with confirmation
async function deletePostConfirm(postId) {
  const post = await adminManager.getPost(postId);
  if (!post) return;

  if (confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
    try {
      await adminManager.deletePost(postId);
      await loadPosts();
      showMessage(
        document.querySelector('[data-tab="all-posts"]').parentElement.nextElementSibling,
        '✅ Post deleted successfully!',
        'success'
      );
    } catch (error) {
      showMessage(
        document.querySelector('[data-tab="all-posts"]').parentElement.nextElementSibling,
        'Error deleting post. Please try again.',
        'error'
      );
    }
  }
}

// View blog post
function viewBlogPost(postId) {
  // Redirect to blog page with ID param
  window.location.href = 'blog.html?id=' + postId;
}

// Show message
function showMessage(element, text, type) {
  element.textContent = text;
  element.className = 'message ' + type;
  element.style.display = 'block';

  if (type === 'success') {
    setTimeout(() => {
      element.style.display = 'none';
    }, 4000);
  }
}

// Make functions globally available
window.editPost = editPost;
window.deletePostConfirm = deletePostConfirm;
window.viewBlogPost = viewBlogPost;
