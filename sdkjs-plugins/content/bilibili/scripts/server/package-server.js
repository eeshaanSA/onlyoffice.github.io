import Bilibili from '@lawchihon/bilibili-api';

const alive = await Bilibili.alive();
console.log(alive);

// const filters = await Bilibili.getFilters();
// console.log(filters);

const videos = await Bilibili.getVideos("anime kamaea e");
console.log(videos);