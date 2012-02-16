var cities = {};

function addCity(location) {
   var name = sprintf("%s, %s", $.trim(location.city), $.trim(location.state));

   if (cities[name] === undefined) {
      cities[name] = location;

      cities[name].checkins = 0;
   }

   cities[name].checkins++;
}

function groupByCity(data) {
   _.each(data, function(checkin) {
      if (checkin.venue === undefined) {
         return;
      }

      if (checkin.venue.location.city === undefined ||
         checkin.venue.location.state === undefined) {
         return;
      }

      addCity(checkin.venue.location);
   });

   cities = _.chain(cities).sortBy(function(city) {
      return 0 - city.checkins;
   }).first(24).value();

   _.each(cities, function(city) {
      $('#city-list').append(sprintf('<li>%(city)s, %(state)s: %(checkins)s</li>', city));
   });

   $('#city-list').makeacolumnlists();
}
