# name: indoorway-theme
# about: Adds functionalities to indoorway theme
# version: 0.1.2
# authors: Daniel Sitarz
# page: www.community.indoorway.com

enabled_site_setting :indoorway_theme_enabled

register_asset 'stylesheets/colors.scss', :all
register_asset 'stylesheets/icons.scss', :all
register_asset 'stylesheets/footer.scss', :all

register_asset 'stylesheets/mobile/header.scss', :mobile

register_asset 'stylesheets/desktop/webfonts.scss', :desktop
register_asset 'stylesheets/desktop/layout.scss', :desktop
register_asset 'stylesheets/desktop/style.scss', :desktop
register_asset 'stylesheets/desktop/buttons.scss', :desktop
register_asset 'stylesheets/desktop/category-view-topics-list.scss', :desktop
register_asset 'stylesheets/desktop/content.scss', :desktop
register_asset 'stylesheets/desktop/index-layout.scss', :desktop
register_asset 'stylesheets/desktop/list-controls.scss', :desktop
register_asset 'stylesheets/desktop/main-navigation-categories.scss', :desktop
register_asset 'stylesheets/desktop/misc.scss', :desktop
register_asset 'stylesheets/desktop/modals.scss', :desktop
register_asset 'stylesheets/desktop/new-topic-button-for-quests.scss', :desktop
register_asset 'stylesheets/desktop/page-header.scss', :desktop
register_asset 'stylesheets/desktop/search.scss', :desktop
register_asset 'stylesheets/desktop/topic-timeline.scss', :desktop
register_asset 'stylesheets/desktop/user.scss', :desktop
register_asset 'stylesheets/desktop/admin-interface.scss', :desktop
