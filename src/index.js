


import {} from 'bootstrap/js/dist/collapse.js';
import {} from 'bootstrap/js/dist/button.js';
import baguetteBox from './vendors/gallery/baguetteBox.js';


import rt from './layouts/main/main.js';

console.log(67896);
console.log(rt);


baguetteBox.run('.portfolio__pictures', {
  captions: true, // display image captions.
  buttons: 'auto', // arrows navigation
  fullScreen: false,
  noScrollbars: false,
  bodyClass: 'baguetteBox-open',
  titleTag: false,
  async: false,
  preload: 2,
  animation: 'slideIn', // fadeIn or slideIn
  verlayBackgroundColor: 'rgba(0,0,0,.8)'
});


thumbs.onclick = function(event) {
  let thumbnail = event.target.closest('a');

  if (!thumbnail) return;
  showThumbnail(thumbnail.href, thumbnail.title);
  event.preventDefault();
}

function showThumbnail(href, title) {
  largeImg.src = href;
  largeImg.alt = title;
}
