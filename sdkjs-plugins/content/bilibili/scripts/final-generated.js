// Select DOM elements
const searchInput = document.querySelector('.search-container input');
const resultsContainer = document.querySelector('.results-container ul');
const iframePlayer = document.querySelector('.player-container iframe');

// Function to render video list
function renderVideos(videosToRender) {
    resultsContainer.innerHTML = ''; // Clear the previous results
    videosToRender.forEach(video => {
        const videoElement = document.createElement('li');
        videoElement.textContent = video.title; // Display the title
        videoElement.addEventListener('click', () => {
            updatePlayer(video.aid); // Pass the 'aid' to updatePlayer when clicked
        });
        resultsContainer.appendChild(videoElement);
    });
}

// Function to update video player
function updatePlayer(videoId) {
    const videoUrl = `https://player.bilibili.com/player.html?aid=${videoId}`;
    iframePlayer.src = videoUrl; // Set iframe source to the selected video
}

// Function to search videos using API
async function searchVideos(query) {
    try {
        const apiUrl = `https://api.bilibili.com/x/web-interface/search/all?keyword=${query}`;
        const response = await fetch(apiUrl); // Fetch data from Bilibili API
        const data = await response.json(); // Convert response to JSON

        // Assuming the relevant video data is in `data.result.videos`
        const videos = data.result.videos.map(video => ({
            aid: video.aid,
            title: video.title
        }));

        renderVideos(videos); // Render videos into the results container
    } catch (error) {
        console.error('Error fetching video data:', error);
    }
}

// Event listener for the search input
searchInput.addEventListener('input', function () {
    const query = searchInput.value.trim(); // Get the search query
    if (query.length > 2) {
        searchVideos(query); // Call search API if query length > 2 characters
    } else {
        resultsContainer.innerHTML = ''; // Clear results if query is too short
    }
});
