const API_URL = 'http://localhost:3004/posts';

const elements = {
    postForm: document.getElementById('postForm'),
    postsGrid: document.getElementById('postsGrid'),
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    emptyState: document.getElementById('emptyState'),
    errorMessage: document.getElementById('errorMessage'),
    submitBtn: document.getElementById('submitBtn'),
    refreshBtn: document.getElementById('refreshBtn'),
    retryBtn: document.getElementById('retryBtn'),
    viewPostsBtn: document.getElementById('viewPostsBtn'),
    toggleFormBtn: document.getElementById('toggleFormBtn'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    imageUrlInput: document.getElementById('imageUrl'),
    titleInput: document.getElementById('title'),
    descriptionInput: document.getElementById('description')
};

function showToast(message, isError = false) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.toggle('error', isError);
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function showLoading() {
    elements.loadingState.style.display = 'flex';
    elements.errorState.style.display = 'none';
    elements.emptyState.style.display = 'none';
    elements.postsGrid.style.display = 'none';
}

function hideLoading() {
    elements.loadingState.style.display = 'none';
}

function showError(message) {
    elements.errorState.style.display = 'flex';
    elements.errorMessage.textContent = message;
    elements.loadingState.style.display = 'none';
    elements.emptyState.style.display = 'none';
    elements.postsGrid.style.display = 'none';
}

function showEmpty() {
    elements.emptyState.style.display = 'flex';
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.postsGrid.style.display = 'none';
}

function showPosts() {
    elements.postsGrid.style.display = 'grid';
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.emptyState.style.display = 'none';
}

function setSubmitButtonLoading(isLoading) {
    const btnText = elements.submitBtn.querySelector('.btn-text');
    const btnLoader = elements.submitBtn.querySelector('.btn-loader');
    
    elements.submitBtn.disabled = isLoading;
    btnText.style.display = isLoading ? 'none' : 'inline';
    btnLoader.style.display = isLoading ? 'inline-block' : 'none';
}

function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.style.animationDelay = `${Math.random() * 0.2}s`;
    
    const imageContainer = document.createElement('div');
    imageContainer.className = 'post-image-container';
    
    const img = document.createElement('img');
    img.className = 'post-image';
    img.src = post.imageUrl;
    img.alt = post.title;
    img.loading = 'lazy';
    
    img.onerror = function() {
        this.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.className = 'post-image-placeholder';
        placeholder.innerHTML = '🖼️';
        imageContainer.appendChild(placeholder);
    };
    
    imageContainer.appendChild(img);
    
    const content = document.createElement('div');
    content.className = 'post-content';
    
    const title = document.createElement('h3');
    title.className = 'post-title';
    title.textContent = post.title;
    
    const description = document.createElement('p');
    description.className = 'post-description';
    description.textContent = post.description;
    
    const actions = document.createElement('div');
    actions.className = 'post-actions';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deletePost(post.id);
    
    actions.appendChild(deleteBtn);
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(actions);
    
    card.appendChild(imageContainer);
    card.appendChild(content);
    
    return card;
}

async function fetchPosts() {
    showLoading();
    
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json();
        
        hideLoading();
        
        if (posts.length === 0) {
            showEmpty();
        } else {
            showPosts();
            elements.postsGrid.innerHTML = '';
            posts.forEach(post => {
                const card = createPostCard(post);
                elements.postsGrid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
        showError(error.message || 'Failed to load posts. Please check if the server is running.');
    }
}

async function createPost(postData) {
    setSubmitButtonLoading(true);
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newPost = await response.json();
        
        showToast('Post created successfully!');
        
        elements.postForm.reset();
        
        setTimeout(() => {
            scrollToPostsSection();
            fetchPosts();
        }, 500);
        
    } catch (error) {
        console.error('Error creating post:', error);
        showToast(error.message || 'Failed to create post. Please try again.', true);
    } finally {
        setSubmitButtonLoading(false);
    }
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${postId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        showToast('Post deleted successfully!');
        fetchPosts();
        
    } catch (error) {
        console.error('Error deleting post:', error);
        showToast(error.message || 'Failed to delete post. Please try again.', true);
    }
}

function scrollToPostsSection() {
    const postsSection = document.getElementById('postsSection');
    postsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

elements.postForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const postData = {
        imageUrl: elements.imageUrlInput.value.trim(),
        title: elements.titleInput.value.trim(),
        description: elements.descriptionInput.value.trim()
    };
    
    createPost(postData);
});

elements.refreshBtn.addEventListener('click', () => {
    fetchPosts();
});

elements.retryBtn.addEventListener('click', () => {
    fetchPosts();
});

elements.viewPostsBtn.addEventListener('click', () => {
    scrollToPostsSection();
});

elements.toggleFormBtn.addEventListener('click', () => {
    elements.postForm.classList.toggle('hidden');
    elements.toggleFormBtn.classList.toggle('collapsed');
});

document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();
});
