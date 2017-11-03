import { createWidget, applyDecorators } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import DiscourseURL from 'discourse/lib/url';
import { ajax } from 'discourse/lib/ajax';
import { userPath } from 'discourse/lib/url';

const flatten = array => [].concat.apply([], array);

createWidget('priority-faq-link', {
  tagName: 'a.faq-priority.widget-link',

  buildAttributes(attrs) {
    return { href: attrs.href };
  },

  html() {
    return [ I18n.t('faq'), ' ', h('span.badge.badge-notification', I18n.t('new_item')) ];
  },

  click(e) {
    e.preventDefault();
    if (this.siteSettings.faq_url === this.attrs.href) {
      ajax(userPath("read-faq"), { method: "POST" }).then(() => {
        this.currentUser.set('read_faq', true);
        DiscourseURL.routeToTag($(e.target).closest('a')[0]);
      });
    } else {
      DiscourseURL.routeToTag($(e.target).closest('a')[0]);
    }
  }
});

export default createWidget('hamburger-menu', {
  tagName: 'div.hamburger-panel',

  adminLinks() {
    const { currentUser } = this;

    const links = [{ route: 'admin', className: 'admin-link', icon: 'wrench', label: 'admin_title' },
                   { href: '/admin/flags/active',
                     className: 'flagged-posts-link',
                     icon: 'flag',
                     label: 'flags_title',
                     badgeClass: 'flagged-posts',
                     badgeTitle: 'notifications.total_flagged',
                     badgeCount: 'site_flagged_posts_count' }];

    if (currentUser.show_queued_posts) {
      links.push({ route: 'queued-posts',
                   className: 'queued-posts-link',
                   label: 'queue.title',
                   badgeCount: 'post_queue_new_count',
                   badgeClass: 'queued-posts' });
    }

    if (currentUser.admin) {
      links.push({ href: '/admin/site_settings/category/required',
                   icon: 'gear',
                   label: 'admin.site_settings.title',
                   className: 'settings-link' });
    }

    return links.map(l => this.attach('link', l));
  },

  lookupCount(type) {
    const tts = this.register.lookup('topic-tracking-state:main');
    return tts ? tts.lookupCount(type) : 0;
  },

  showUserDirectory() {
    if (!this.siteSettings.enable_user_directory) return false;
    if (this.siteSettings.hide_user_profiles_from_public && !this.currentUser) return false;
    return true;
  },

  generalLinks() {
    const { siteSettings } = this;
    const links = [];

    links.push({ route: 'discovery.latest', className: 'latest-topics-link', label: 'filters.latest.title' });

    if (this.currentUser) {
      links.push({ route: 'discovery.new',
                   className: 'new-topics-link',
                   labelCount: 'filters.new.title_with_count',
                   label: 'filters.new.title',
                   count: this.lookupCount('new') });

      links.push({ route: 'discovery.unread',
                   className: 'unread-topics-link',
                   labelCount: 'filters.unread.title_with_count',
                   label: 'filters.unread.title',
                   count: this.lookupCount('unread') });
    }

    links.push({ route: 'discovery.top', className: 'top-topics-link', label: 'filters.top.title' });

    if (siteSettings.enable_badges) {
      links.push({ route: 'badges', className: 'badge-link', label: 'badges.title' });
    }

    if (this.showUserDirectory()) {
      links.push({ route: 'users', className: 'user-directory-link', label: 'directory.title' });
    }

    if (this.siteSettings.enable_group_directory) {
      links.push({ route: 'groups', className: 'groups-link', label: 'groups.index.title' });
    }

    if (this.siteSettings.tagging_enabled) {
      links.push({ route: 'tags', label: 'tagging.tags' });
    }

    const extraLinks = flatten(applyDecorators(this, 'generalLinks', this.attrs, this.state));
    return links.concat(extraLinks).map(l => this.attach('link', l));
  },

  listCategories() {
    const hideUncategorized = !this.siteSettings.allow_uncategorized_topics;
    const isStaff = Discourse.User.currentProp('staff');

    const categories = Discourse.Category.list().reject((c) => {
      if (c.get('parentCategory.show_subcategory_list')) { return true; }
      if (hideUncategorized && c.get('isUncategorizedCategory') && !isStaff) { return true; }
      return false;
    });

    return this.attach('hamburger-categories', { categories });
  },

  footerLinks(prioritizeFaq, faqUrl) {
    const links = [];
    links.push({ route: 'about', className: 'about-link', label: 'about.simple_title' });

    if (!prioritizeFaq) {
      links.push({ href: faqUrl, className: 'faq-link', label: 'faq' });
    }

    const { site } = this;
    if (!site.mobileView && !this.capabilities.touch) {
      links.push({ action: 'showKeyboard', className: 'keyboard-shortcuts-link', label: 'keyboard_shortcuts_help.title' });
    }

    if (this.site.mobileView || (this.siteSettings.enable_mobile_theme && this.capabilities.touch)) {
      links.push({ action: 'toggleMobileView',
                   className: 'mobile-toggle-link',
                   label: this.site.mobileView ? "desktop_view" : "mobile_view" });
    }

    const extraLinks = flatten(applyDecorators(this, 'footerLinks', this.attrs, this.state));
    return links.concat(extraLinks).map(l => this.attach('link', l));
  },

  panelContents() {
    const { currentUser } = this;
    const results = [];

    let faqUrl = this.siteSettings.faq_url;
    if (!faqUrl || faqUrl.length === 0) {
      faqUrl = Discourse.getURL('/faq');
    }

    const prioritizeFaq = false; // this.currentUser && !this.currentUser.read_faq;
    if (prioritizeFaq) {
      results.push(this.attach('menu-links', { name: 'faq-link', heading: true, contents: () => {
        return this.attach('priority-faq-link', { href: faqUrl });
      }}));
    }

    if (currentUser && currentUser.staff) {
      results.push(this.attach('menu-links', { name: 'admin-links', contents: () => {
        const extraLinks = flatten(applyDecorators(this, 'admin-links', this.attrs, this.state));
        return this.adminLinks().concat(extraLinks);
      }}));
    }

    results.push(this.attach('menu-links', {name: 'general-links', contents: () => this.generalLinks() }));
    results.push(this.listCategories());
    results.push(h('hr'));
    results.push(this.attach('menu-links', {name: 'footer-links', omitRule: true, contents: () => this.footerLinks(prioritizeFaq, faqUrl) }));

    return results;
  },

  html() {
    return this.attach('menu-panel', { contents: () => this.panelContents() });
  },

  clickOutside() {
    this.sendWidgetAction('toggleHamburger');
  }
});
