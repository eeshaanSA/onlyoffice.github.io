// const query = "anime";
// async function search() {
//   const apiUrl = `https://api.bilibili.com/x/web-interface/search/all?keyword=${query}`;
//   const response = await fetch(apiUrl);
//   const data = await response.json();

//   console.log(data);
// }

// search();

// Function to make an API request with XMLHttpRequest
function searchVideos(query) {
  const xhr = new XMLHttpRequest();
  const apiUrl = `https://api.bilibili.com/x/web-interface/search/all/v2?keyword=${query}`;

  xhr.open("GET", apiUrl, true);
  xhr.onload = function () {
      const response = JSON.parse(xhr.responseText);
      console.log(response);
    
  };
}

searchVideos("anime");
