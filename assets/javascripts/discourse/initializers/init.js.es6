import DiscourseURL from 'discourse/lib/url';

export default {
  name: 'init',
  initialize(container) {    
    
    const router = container.lookup('router:main');

    router.on('willTransition', addResizer);
    router.on('didTransition', cleanDOM);    
  }
};

function cleanDOM() {
  $('#main-outlet').css('min-height', 'unset');
}

function addResizer () {

  let elToResize = $('#main-outlet');  
  let height = elToResize.height() - 28; //  minus loader's height

  elToResize.css('min-height', height);
}
