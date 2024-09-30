/*
 (c) Copyright Ascensio System SIA 2020

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

 
function embedBilibiliVideo() {
  // Get the video link from the input
  const link = document.getElementById('bilibiliLink').value;
  
  // Validate the link
  if (!link || !link.includes('bilibili.com/video')) {
    alert('Please insert a valid Bilibili video link!');
    return;
  }

  // Extract the BV or AV code from the URL
  const regex = /\/video\/(BV\w+|av\d+)/;
  const match = link.match(regex);
  
  if (match && match[1]) {
    // Embed the video in the iframe using the Bilibili player URL
    const videoID = match[1];
    const embedUrl = `https://player.bilibili.com/player.html?bvid=${videoID}&page=1`;

    // Set the iFrame src to the embed URL
    document.getElementById('bilibiliPlayer').src = embedUrl;
  } else {
    alert('Could not extract video ID from the link. Please check the URL.');
  }
}