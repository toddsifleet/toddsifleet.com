var navController = (function() {
  var navigation = document.getElementById("nav-menu");
  var navigation_button = document.getElementById("mobile-nav-button");
  var nav_link_count = navigation.querySelectorAll('li').length;

  return {
    showNavigation: function() {
      var height = navigation.style.getPropertyValue('max-height');
      if (height == '0px' || height == null) {
        navigation.style.setProperty('max-height', nav_link_count * 70 + 'px');
      }
      else {
        navigation.style.setProperty('max-height', '0px');
      }
    }
  };
})();
