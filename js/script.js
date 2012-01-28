var categories = {};

function addCategory(category) {
   var name = category.pluralName;

   if (categories[name] === undefined) {
      categories[name] = category;

      categories[name].checkins = 0;
   }

   categories[name].checkins++;
}

$(function() {
   if (baseUrl === false) {
      window.alert("Couldn't find your locker, you might need to add a config.js (see https://me.singly.com/Me/devdocs/)");
   }

   var url = baseUrl + '/Me/foursquare/getCurrent/checkin';

   $('#url').html(sprintf('<a href="%s">%s</a>', url, url));

   $.getJSON(url, { 'limit': 1000, 'sort': 'at', 'order': 1 }, function(data) {
      _.each(data, function(checkin) {
         if (checkin.venue === undefined) {
            return;
         }

         var c = checkin.venue.categories;

         if (c.length > 0) {
            _.each(c, function(category) {
               if (category.primary) {
                  addCategory(category);
               }
            });
         }
      });

      categories = _.sortBy(categories, function(category) {
         return 0 - category.checkins;
      });

      _.each(categories, function(category) {
         $('#checkins').append(sprintf('<li><img src="%(icon)s" /> %(pluralName)s: %(checkins)s</li>', category));
      });
   });
});
