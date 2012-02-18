var apiToken;

function setUserGlobals(info) {
   apiToken = info.apiToken;
}

function blobQuantize(value, max) {
   return 2 + value / max * 14;
}

var dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
var dayNameLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Average'];

$(function() {
   if (baseUrl === false) {
      window.alert("Couldn't find your locker, you might need to add a config.js (see <a href=\"https://me.singly.com/Me/devdocs/\">the docs</a>)");
   }

   // Fix sub nav on scroll
   var $win = $(window),
      $nav = $('.subnav'),
      navTop = $('.subnav').length && $('.subnav').offset().top,
      isFixed = 0;

   processScroll();

   $win.on('scroll', processScroll);

   function processScroll() {
      var i;
      var  scrollTop = $win.scrollTop();

      if (scrollTop >= navTop && !isFixed) {
         isFixed = 1;

         $nav.addClass('subnav-fixed');
      } else if (scrollTop <= navTop && isFixed) {
         isFixed = 0;

         $nav.removeClass('subnav-fixed');
      }
   }

   $('.nav').scrollspy();

   var lastfmUrl = baseUrl + '/Me/lastfm/getCurrent/scrobble';
   var foursquareUrl = baseUrl + '/Me/foursquare/getCurrent/checkin';
   var placesUrl = baseUrl + '/Me/places/';
   var photosUrl = baseUrl + '/query/getPhoto';
   var contactsUrl = baseUrl + '/query/getContact';

   $.getJSON(placesUrl, { 'limit': 1000 }, function(data) {
      initCheckinBlobs(data);
   });

   $.getJSON(lastfmUrl, { 'limit': 1000 }, function(data) {
      initMusicBlobs(data);
   });

   $.getJSON(foursquareUrl, { 'limit': 1000, 'sort': 'at', 'order': 1 }, function(data) {
      groupByCategory(data);
      groupByCity(data);

      $.getJSON("data/states.json", function(stateData) {
         stateAbbreviations = stateData.items;

         mapByState(data);
      });
   });

   $.getJSON(photosUrl, { 'limit': 500, 'terms': '[me:true]', 'fields': '[id:1,sources.data.comments:1,sources.data.likes:1,url:1,thumbnail:1,timestamp:1]', 'sort': '\'{"timestamp":-1}\'' }, function(data) {
      photosByPopularity(data);
      photosByColor(data);
   });

   $.getJSON(contactsUrl, { 'limit': 5000, 'fields': '[gender:1,accounts.facebook.data.gender:1,accounts.foursquare.gender:1]' }, function(data) {
      groupByGender(data);
   });
});
