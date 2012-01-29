var categories = {};
var postalCodes = {};
var stateCheckins = {};

var genders = {};

var stateAbbreviations;

function addPostalCode(location) {
   var name = location.postalCode.replace(/-\d{4}$/, '');

   if (postalCodes[name] === undefined) {
      postalCodes[name] = location;

      postalCodes[name].checkins = 0;
   }

   postalCodes[name].checkins++;
}

function addCategory(category) {
   var name = category.pluralName;

   if (categories[name] === undefined) {
      categories[name] = category;

      categories[name].checkins = 0;
   }

   categories[name].checkins++;
}

function groupByPostalCode(data) {
   _.each(data, function(checkin) {
      if (checkin.venue === undefined) {
         return;
      }

      if (checkin.venue.location.postalCode === undefined) {
         return;
      }

      addPostalCode(checkin.venue.location);
   });

   postalCodes = _.sortBy(postalCodes, function(postalCode) {
      return 0 - postalCode.checkins;
   });

   _.each(postalCodes, function(postalCode) {
      $('#postal-code-list').append(sprintf('<li>%(postalCode)s (%(city)s, %(state)s): %(checkins)s</li>', postalCode));
   });
}

function quantize(d) {
   if (stateCheckins[d.properties.name] !== undefined) {
      return "q8-9";
   }

   return "q3-9";

   //return "q" + Math.min(8, ~~(stateCheckins[d] * 9 / 12)) + "-9";
}

function mapByState(data) {
   _.each(data, function(checkin) {
      if (checkin.venue === undefined) {
         return;
      }

      if (checkin.venue.location.state === undefined) {
         return;
      }

      var state = checkin.venue.location.state;

      var stateObject = _.find(stateAbbreviations, function(item) {
         if (item.name.toLowerCase() == state.toLowerCase()) {
            return true;
         }

         if (item.abbreviation.toLowerCase() == state.toLowerCase()) {
            return true;
         }

         return false;
      });

      if (stateObject !== undefined) {
         stateCheckins[stateObject.name] = true;
      }
   });

   var path = d3.geo.path();

   var svg = d3.select("#states-with-checkins-map")
     .append("svg");

   var states = svg.append("g")
       .attr("id", "states")
       .attr("class", "Blues");

   d3.json("js/d3/examples/data/us-states.json", function(json) {
     states.selectAll("path")
         .data(json.features)
       .enter().append("path")
         .attr("class", data ? quantize : null)
         .attr("d", path);
   });

   states.selectAll("path")
      .attr("class", quantize);
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

   categories = _.sortBy(categories, function(category) {
      return 0 - category.checkins;
   });

   _.each(categories, function(category) {
      $('#category-list').append(sprintf('<li><img src="%(icon)s" /> %(pluralName)s: %(checkins)s</li>', category));
   });
}

function groupByGender(data) {
   _.each(data, function(contact) {
      var gender = 'unknown';

      if (contact.gender !== undefined) {
         gender = contact.gender;
      } else if (contact.accounts.foursquare !== undefined &&
         contact.accounts.foursquare[0].data.gender !== undefined) {
         gender = contact.accounts.foursquare[0].data.gender;
      } else if (contact.accounts.facebook !== undefined &&
         contact.accounts.facebook[0].data.gender !== undefined) {
         gender = contact.accounts.facebook[0].data.gender;
      }

      var name = gender.toLowerCase();

      if (genders[name] === undefined) {
         genders[name] = 0;
      }

      genders[name]++;
   });

   _.each(genders, function(count, gender) {
      $('#genders-list').append(sprintf('<li>%s: %s</li>', gender, count));
   });
}

$(function() {
   if (baseUrl === false) {
      window.alert("Couldn't find your locker, you might need to add a config.js (see https://me.singly.com/Me/devdocs/)");
   }

   var foursquareUrl = baseUrl + '/Me/foursquare/getCurrent/checkin';
   var contactsUrl = baseUrl + '/Me/contacts/';

   $.getJSON(foursquareUrl, { 'limit': 1000, 'sort': 'at', 'order': 1 }, function(data) {
      groupByCategory(data);
      groupByPostalCode(data);

      $.getJSON("data/states.json", function(stateData) {
         stateAbbreviations = stateData.items;

         mapByState(data);
      });
   });

   $.getJSON(contactsUrl, { 'limit': 5000 }, function(data) {
      groupByGender(data);
   });
});
