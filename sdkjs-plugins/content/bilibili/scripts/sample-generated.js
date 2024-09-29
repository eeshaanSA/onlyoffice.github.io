// Sample videos array - in real scenarios, this can come from an API
const videos = [
    { id: '28765146', title: 'Sample Video 1' },
    { id: '28765147', title: 'Sample Video 2' },
    { id: '28765148', title: 'Sample Video 3' },
    { id: '28765149', title: 'Sample Video 4' },
    { id: '28765150', title: 'Sample Video 5' }
];

// Select DOM elements
const searchInput = document.querySelector('.search-container input');
const resultsContainer = document.querySelector('.results-container ul');
const iframePlayer = document.querySelector('.player-container iframe');

// Function to render video list
function renderVideos(videosToRender) {
    resultsContainer.innerHTML = '';
    videosToRender.forEach(video => {
        const videoElement = document.createElement('li');
        videoElement.textContent = video.title;
        videoElement.addEventListener('click', () => {
            updatePlayer(video.id);
        });
        resultsContainer.appendChild(videoElement);
    });
}

// Function to update video player
function updatePlayer(videoId) {
    const videoUrl = `https://player.bilibili.com/player.html?aid=${videoId}`;
    iframePlayer.src = videoUrl;
}

// Function to filter videos based on search input
function filterVideos(query) {
    return videos.filter(video => video.title.toLowerCase().includes(query.toLowerCase()));
}

// Event listener for the search input
searchInput.addEventListener('input', function () {
    const query = searchInput.value;
    const filteredVideos = filterVideos(query);
    renderVideos(filteredVideos);
});

// Initial rendering of videos
renderVideos(videos);
