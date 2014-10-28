var navController = (function() {
  var navigation = document.getElementById("nav-menu");
  var title = navigation.dataset.pageTitle;
  var navigation_button = document.getElementById("mobile-nav-button");
  var nav_link_count = navigation.querySelectorAll('li').length;

  return {
    showNavigation: function() {
      var height = navigation.style.getPropertyValue('max-height');
      if (height == '0px' || height == null) {
        navigation.style.setProperty('max-height', nav_link_count * 70 + 'px');
        navigation_button.innerHTML = "- " + title + " -";
      }
      else {
        navigation.style.setProperty('max-height', '0px');
        navigation_button.innerHTML = "+ " + title + " +";
      }
    }
  };
})();
