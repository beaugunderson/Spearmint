var categories = {};

function addCategory(category) {
   var name = category.pluralName;

   if (categories[name] === undefined) {
      categories[name] = category;

      categories[name].checkins = 0;
   }

   categories[name].checkins++;
}

function groupByCategory(data) {
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

   categories = _.chain(categories).sortBy(function(category) {
      return 0 - category.checkins;
   }).first(24).value();

   _.each(categories, function(category) {
      $('#category-list').append(sprintf('<li><img src="%(icon)s" /> %(pluralName)s: %(checkins)s</li>', category));
   });

   $('#category-list').makeacolumnlists();
}
