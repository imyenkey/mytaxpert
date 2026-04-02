// Blog Management System — Cloudflare KV API Client

const API_BASE = '/api';

class BlogManager {
  async getPublishedPosts() {
    try {
      const response = await fetch(`${API_BASE}/posts`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data.posts || [];
    } catch (err) {
      console.error('Error fetching published posts:', err);
      return [];
    }
  }

  async getPost(id) {
    try {
      const response = await fetch(`${API_BASE}/posts/${id}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data.post || null;
    } catch (err) {
      console.error(`Error fetching post ${id}:`, err);
      return null;
    }
  }
}

// Initialize blog manager
const blogManager = new BlogManager();

// DOM Elements
const blogGrid = document.getElementById('blogGrid');
const blogListView = document.getElementById('blogListView');
const blogSingleView = document.getElementById('blogSingleView');
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');

// Render blog list
async function renderBlogList(posts = null) {
  let postsToRender = posts;

  if (!postsToRender) {
    blogGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--muted);">Loading posts...</p>';
    postsToRender = await blogManager.getPublishedPosts();
  }

  if (postsToRender.length === 0) {
    blogGrid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  blogGrid.style.display = 'grid';
  emptyState.style.display = 'none';

  blogGrid.innerHTML = postsToRender
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(
      (post) => `
    <article class="blog-card">
      <div class="blog-card-image">${post.emoji}</div>
      <div class="blog-card-content">
        <div class="blog-meta">
          <span class="blog-category">${post.category}</span>
          <span>${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <div class="blog-author">
          <div class="author-avatar">${post.author.charAt(0)}</div>
          <div class="author-info">
            <strong>${post.author}</strong><br>
            <small>MyTaxPert</small>
          </div>
        </div>
      </div>
    </article>
    `
    )
    .join('');

  // Add click handlers
  document.querySelectorAll('.blog-card').forEach((card, index) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const post = postsToRender[index];
      viewPost(post.id);
    });
  });
}

// View single post
async function viewPost(postId) {
  blogListView.style.display = 'none';
  blogSingleView.style.display = 'block';
  blogSingleView.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 40px;">Loading post...</p>';
  window.scrollTo(0, 0);

  const post = await blogManager.getPost(postId);
  if (!post) {
    blogSingleView.innerHTML = '<p style="text-align: center; color: #EF4444; padding: 40px;">Post not found.</p>';
    return;
  }

  const publishDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  blogSingleView.innerHTML = `
    <a href="#" class="back-link" id="backLink">← Back to Blog</a>
    <article class="blog-single">
      <div class="blog-single-header">
        <h1>${post.title}</h1>
        <div class="blog-single-meta">
          <span><strong>By:</strong> ${post.author}</span>
          <span><strong>Date:</strong> ${publishDate}</span>
          <span><strong>Category:</strong> ${post.category}</span>
        </div>
      </div>
      <div class="blog-single-body">
        ${post.content}
      </div>
    </article>
  `;

  document.getElementById('backLink').addEventListener('click', (e) => {
    e.preventDefault();
    viewBlogList();
  });
}

// Go back to blog list
async function viewBlogList() {
  blogSingleView.style.display = 'none';
  blogListView.style.display = 'block';
  await renderBlogList();
  window.scrollTo(0, 0);
}

// Search functionality
function searchPosts(query) {
  if (!query.trim()) {
    renderBlogList();
    return;
  }

  const allPosts = blogManager.getPublishedPosts();
  const filtered = allPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      post.category.toLowerCase().includes(query.toLowerCase()) ||
      post.author.toLowerCase().includes(query.toLowerCase())
  );

  renderBlogList(filtered);
}

// Event listeners
searchInput?.addEventListener('input', (e) => {
  searchPosts(e.target.value);
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Check for direct post ID in URL params
  const params = new URLSearchParams(window.location.search);
  const directPostId = params.get('id');

  if (directPostId) {
    await viewPost(parseInt(directPostId, 10));
  } else {
    await renderBlogList();
  }

  // Add smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && !href.includes('contact')) {
        e.preventDefault();
      }
    });
  });
});

// Make viewPost available globally for blog cards
window.viewPost = viewPost;
