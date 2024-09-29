
    // Function to search for videos using Bilibili API
    function searchVideos() {
        const query = document.getElementById('searchQuery').value;
        const resultsList = document.getElementById('results');
        resultsList.innerHTML = '';  // Clear previous results

        // API call to search videos based on keyword
        fetch(`https://api.bilibili.com/x/web-interface/search/all/v2?keyword=${query}`)
            .then(response => response.json())
            .then(data => {
                const videos = data.data.result.find(item => item.result_type === 'video').data;

                // Display the search results
                videos.forEach(video => {
                    const listItem = document.createElement('li');
                    listItem.textContent = video.title;
                    listItem.setAttribute('data-aid', video.aid);
                    listItem.addEventListener('click', function() {
                        playVideo(video.aid);
                    });
                    resultsList.appendChild(listItem);
                });
            })
            .catch(error => {
                console.error('Error fetching videos:', error);
            });
    }

    // Function to play the selected video in the iframe
    function playVideo(aid) {
        const player = document.getElementById('bilibiliPlayer');
        player.src = `//player.bilibili.com/player.html?aid=${aid}`;
    }
