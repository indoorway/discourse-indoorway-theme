import { createWidget } from 'discourse/widgets/widget';
import { iconNode } from 'discourse/helpers/fa-icon-node';
import { avatarImg } from 'discourse/widgets/post';
import DiscourseURL from 'discourse/lib/url';
import { wantsNewWindow } from 'discourse/lib/intercept-click';
import { applySearchAutocomplete } from "discourse/lib/search";

import { h } from 'virtual-dom';

const dropdown = {
  buildClasses(attrs) {
    if (attrs.active) { return "active"; }
  },

  click(e) {
    if (wantsNewWindow(e)) { return; }
    e.preventDefault();
    if (!this.attrs.active) {
      this.sendWidgetAction(this.attrs.action);
    }
  }
};

createWidget('header-notifications', {
  settings: {
    avatarSize: 'medium'
  },

  html(attrs) {
    const { currentUser } = this;

    const contents = [ avatarImg(this.settings.avatarSize, {
      template: currentUser.get('avatar_template'),
      username: currentUser.get('username')
    }) ];

    const unreadNotifications = currentUser.get('unread_notifications');
    if (!!unreadNotifications) {
      contents.push(this.attach('link', { action: attrs.action,
                                          className: 'badge-notification unread-notifications',
                                          rawLabel: unreadNotifications }));
    }

    const unreadPMs = currentUser.get('unread_private_messages');
    if (!!unreadPMs) {
      if (!currentUser.get('read_first_notification')) {
        contents.push(h('span.ring'));
        if (!attrs.active && attrs.ringBackdrop) {
          contents.push(h('span.ring-backdrop-spotlight'));
          contents.push(h('span.ring-backdrop',
            {},
            h('h1.ring-first-notification', {} ,I18n.t('user.first_notification'))
          ));
        }
      }

      contents.push(this.attach('link', { action: attrs.action,
                                          className: 'badge-notification unread-private-messages',
                                          rawLabel: unreadPMs }));
    }

    return contents;
  }
});

createWidget('user-dropdown', jQuery.extend({
  tagName: 'li.header-dropdown-toggle.current-user',

  buildId() {
    return 'current-user';
  },

  html(attrs) {
    const { currentUser } = this;

    return h('a.icon', { attributes: { href: currentUser.get('path'), 'data-auto-route': true } },
             this.attach('header-notifications', attrs));
  }
}, dropdown));

createWidget('header-dropdown', jQuery.extend({
  tagName: 'li.header-dropdown-toggle',

  html(attrs) {
    const title = I18n.t(attrs.title);

    const body = [iconNode(attrs.icon)];
    if (attrs.contents) {
      body.push(attrs.contents.call(this));
    }

    return h('a.icon', { attributes: { href: attrs.href,
                                       'data-auto-route': true,
                                       title,
                                       'aria-label': title,
                                       id: attrs.iconId } }, body);
  }
}, dropdown));

createWidget('header-icons', {
  tagName: 'ul.icons.clearfix',

  buildAttributes() {
    return { role: 'navigation' };
  },

  html(attrs) {
    if (this.siteSettings.login_required && !this.currentUser) { return []; }
    const hamburger = this.attach('header-dropdown', {
                        title: 'hamburger_menu',
                        icon: 'indoor-menu',
                        iconId: 'toggle-hamburger-menu',
                        active: attrs.hamburgerVisible,
                        action: 'toggleHamburger',
                        contents() {
                          if (!attrs.flagCount) { return; }
                          return h('div.badge-notification.flagged-posts', { attributes: {
                            title: I18n.t('notifications.total_flagged')
                          } }, attrs.flagCount);
                        }
                      });

    const search = this.attach('header-dropdown', {
                     title: 'search.title',
                     icon: 'search',
                     iconId: 'search-button',
                     action: 'toggleSearchMenu',
                     active: attrs.searchVisible,
                     href: Discourse.getURL('/search')
                   });

    const icons = [search, hamburger];
    if (this.currentUser) {
      icons.push(this.attach('user-dropdown', { active: attrs.userVisible,
                                                action: 'toggleUserMenu',
                                                ringBackdrop: attrs.ringBackdrop }));
    }

    return icons;
  }
});

createWidget('header-buttons', {
  tagName: 'span',

  html(attrs) {
    if (this.currentUser) { return; }

    const buttons = [];

    if (attrs.canSignUp) {
      buttons.push(this.attach('link', { label: "sign_up",
                                           className: 'btn-primary btn-small sign-up-button',
                                           action: "showCreateAccount" }));
      buttons.push(h('div.divider'));
    }    

    buttons.push(this.attach('link', { label: 'log_in',
                                         className: 'btn-primary btn-small login-button',
                                         action: 'showLogin'}));

    return h('div.login-buttons', buttons);
  }
});

createWidget('header-links', {
  tagName: 'div#indoorway-nav',

  html() {

    const links = [];
    const positions = [
      { name: 'Home', href: '' },
      { name: 'Business', href: 'business' },
      { name: 'Developers', href: 'developers' },
      { name: 'Technology', href: 'technology' },
      { name: 'Pricing', href: 'pricing' }
    ];
    for(var i = 0; i < positions.length; i++) {
      var position = positions[i];
      links.push(this.attach('link', {
        rawLabel: position.name,
        className: 'link',
        href: `https://indoorway.com/${position.href}`
      }));
    }    

    return links;
  }
});

createWidget('header-sub', {
  tagName: 'div#sub-header',

  html(attrs) {  

    const home = this.attach('link', {
      className: 'icon back-home',
      icon: 'indoor-home',
      href: '/'
    });

    const content = [
      this.attach('header-buttons', attrs.attrs),
      this.attach('header-icons', { 
        hamburgerVisible: attrs.state.hamburgerVisible,
        userVisible: attrs.state.userVisible,
        searchVisible: attrs.state.searchVisible,
        ringBackdrop: attrs.state.ringBackdrop,
        flagCount: attrs.attrs.flagCount 
      })
    ];

    return  h('div.wrap',  h('div.container', [home,  h('div.panel.clearfix', content)]));
  }
});

const forceContextEnabled = ['category', 'user', 'private_messages'];

let additionalPanels = [];
export function attachAdditionalPanel(name, toggle, transformAttrs) {
  additionalPanels.push({ name, toggle, transformAttrs });
}

export default createWidget('header', {
  tagName: 'header.d-header.clearfix',
  buildKey: () => `header`,

  defaultState() {
    let states =  {
      searchVisible: false,
      hamburgerVisible: false,
      userVisible: false,
      ringBackdrop: true
    };

    if (this.site.mobileView) {
      states.skipSearchContext = true;
    }

    return states;
  },

  html(attrs, state) {
    const panels = [
                    this.attach('header-links')                    
                    ];

    if (state.searchVisible) {
      const contextType = this.searchContextType();

      if (state.searchContextType !== contextType) {
        state.contextEnabled = undefined;
        state.searchContextType = contextType;
      }

      if (state.contextEnabled === undefined) {
        if (forceContextEnabled.includes(contextType)) {
          state.contextEnabled = true;
        }
      }

      panels.push(this.attach('search-menu', { contextEnabled: state.contextEnabled }));
    } else if (state.hamburgerVisible) {
      panels.push(this.attach('hamburger-menu'));
    } else if (state.userVisible) {
      panels.push(this.attach('user-menu'));
    }

    additionalPanels.map((panel) => {
      if (this.state[panel.toggle]) {
        panels.push(this.attach(panel.name, panel.transformAttrs.call(this, attrs, state)));
      }
    });

    const loggedClass = this.currentUser ? '.logged' : '';

    const contents = [ this.attach('home-logo', { minimized: !!attrs.topic }),
                       h(`div.panel.clearfix${loggedClass}`, panels) ];

    if (attrs.topic) {
      contents.push(this.attach('header-topic-info', attrs));
    }

    const header = [
        h('div.wrap', h('div.contents.clearfix', contents)),
        this.attach('header-sub', {attrs: attrs, state: state})
      ]

    return header;
  },

  updateHighlight() {
    if (!this.state.searchVisible) {
      const service = this.register.lookup('search-service:main');
      service.set('highlightTerm', '');
    }
  },

  closeAll() {
    this.state.userVisible = false;
    this.state.hamburgerVisible = false;
    this.state.searchVisible = false;    
  },

  linkClickedEvent(attrs) {
    if (!(attrs && attrs.searchContextEnabled)) this.closeAll();
    this.updateHighlight();
  },

  toggleSearchMenu() {
    if (this.site.mobileView) {
      const searchService = this.register.lookup('search-service:main');
      const context = searchService.get('searchContext');
      var params = "";

      if (context) {
        params = `?context=${context.type}&context_id=${context.id}&skip_context=${this.state.skipSearchContext}`;
      }

      return DiscourseURL.routeTo('/search' + params);
    }

    this.state.searchVisible = !this.state.searchVisible;
    this.updateHighlight();

    const resultsLoadedClass = 'results-loaded';    
    const searchButton = document.getElementById('search-button');

    if (this.state.searchVisible) {
      Ember.run.schedule('afterRender', () => {
        const $searchInput = $('#search-term');
        $searchInput.focus().select();

        const parentElement = document.querySelector('.search-menu');        

        if(parentElement) {
          if(document.querySelector('.search-menu .results')) {
            parentElement.classList.add(resultsLoadedClass);
            searchButton.classList.add(resultsLoadedClass);
          }    
        }

        applySearchAutocomplete($searchInput, this.siteSettings, this.appEvents, {
          appendSelector: '.menu-panel'
        });
      });
    }else {
      searchButton.classList.remove(resultsLoadedClass)
    }
  },

  toggleUserMenu() {
    this.state.ringBackdrop = false;
    this.state.userVisible = !this.state.userVisible;    
  },

  toggleHamburger() {
    this.state.hamburgerVisible = !this.state.hamburgerVisible;
  },

  togglePageSearch() {
    const { state } = this;

    state.contextEnabled = false;

    const currentPath = this.register.lookup('controller:application').get('currentPath');
    const blacklist = [ /^discovery\.categories/ ];
    const whitelist = [ /^topic\./ ];
    const check = function(regex) { return !!currentPath.match(regex); };
    let showSearch = whitelist.any(check) && !blacklist.any(check);

    // If we're viewing a topic, only intercept search if there are cloaked posts
    if (showSearch && currentPath.match(/^topic\./)) {
      showSearch = ($('.topic-post .cooked, .small-action:not(.time-gap)').length <
                    this.register.lookup('controller:topic').get('model.postStream.stream.length'));
    }

    if (state.searchVisible) {
      this.toggleSearchMenu();
      return showSearch;
    }

    if (showSearch) {
      state.contextEnabled = true;
      this.toggleSearchMenu();
      return false;
    }

    return true;
  },

  searchMenuContextChanged(value) {
    this.state.contextType = this.register.lookup('search-service:main').get('contextType');
    this.state.contextEnabled = value;
  },

  domClean() {
    const { state } = this;

    if (state.searchVisible || state.hamburgerVisible || state.userVisible) {
      this.closeAll();
    }
  },

  headerKeyboardTrigger(msg) {
    switch(msg.type) {
      case 'search':
        this.toggleSearchMenu();
        break;
      case 'user':
        this.toggleUserMenu();
        break;
      case 'hamburger':
        this.toggleHamburger();
        break;
      case 'page-search':
        if (!this.togglePageSearch()) {
          msg.event.preventDefault();
          msg.event.stopPropagation();
        }
        break;
    }
  },

  searchContextType() {
    const service = this.register.lookup('search-service:main');
    if (service) {
      const ctx = service.get('searchContext');
      if (ctx) {
        return Ember.get(ctx, 'type');
      }
    }
  }

});
