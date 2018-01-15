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
  $('#transitionResizer').remove();
}

function addResizer () {  
  
  let elToResize = $('#main-outlet');  

  let height = elToResize.height() - 38 - 90; // minus loader's height and some magic numbers.
  let resizer = $('<div id="transitionResizer" />').height(height);

  elToResize.append(resizer);
}
