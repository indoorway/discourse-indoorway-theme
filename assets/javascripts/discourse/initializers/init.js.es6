import { scrollTop } from 'discourse/mixins/scroll-top';

export default {
  name: 'init',
  initialize(container) {    
    
    const router = container.lookup('router:main');

    router.on('willTransition', addResizer);
    router.on('didTransition', cleanDOM);  
    
    const appEvents = container.lookup('app-events:main');
    appEvents.on('post:highlight', _ => {
      Ember.run.scheduleOnce('afterRender', null, _ => {
        $('.transition-resizer').remove();        
      });
    });
  }
};

function cleanDOM() {
  Ember.run.scheduleOnce('afterRender', null, _ => {
    if (!$('#whole-discussion')[0]) {
      // Post is loading longer, we will remove resizer after post:highlight
      $('.transition-resizer').remove();
    }    
  });
}

function addResizer () {
  let elToResize = $('#main-outlet');  
  let height = elToResize.height() - 28; //  minus loader's height

  scrollTop();

  $('head').append(`<style class="transition-resizer">#main-outlet{min-height: ${height}px;}</style>`);
}
