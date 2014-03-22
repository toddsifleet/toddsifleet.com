function show_navigation() {
  var title = "{{ page.title }}";
  var navigation = document.getElementById("nav-menu");
  var navigation_button = document.getElementById("mobile-nav-button");
  var height = navigation.style.getPropertyValue('max-height');
  if (height == '0px' || height == null) {
    navigation.style.setProperty('max-height', {{navigation_links|length}} * 70 + 'px');
    navigation_button.innerHTML = "- " + title + " -";
  }
  else {
    navigation.style.setProperty('max-height', '0px');
    navigation_button.innerHTML = "+ " + title + " +";
  }
}

