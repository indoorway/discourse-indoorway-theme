import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
  name: 'init',
  initialize() {
    // $.getJSON(window.location.href + '.json', function (data) { 
    //   console.log(data)
    // });
    withPluginApi('0.8.6', api => {
      api.addPostClassesCallback((a) => {
        console.log(a);
      })
    });
  }
};