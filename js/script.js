var categories = {};
var postalCodes = {};
var stateCheckins = {};

var genders = {};

var stateAbbreviations;

function lastfmQuantize(value, max) {
   return 2 + value / max * 15;
}

var dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function initCheckinBlobs(checkins) {
   var days = {};

   _.each(dayNames, function(dayName) {
      days[dayName] = {
         hours: []
      };

      for (var i = 0; i < 24; i++) {
         days[dayName].hours[i] = 0;
      }
   });

   _.each(checkins, function(checkin) {
      var m = moment(checkin.at);

      var dayName = m.format('dddd');

      var hour = m.hours();

      days[dayName].hours[hour]++;
   });

   var max = 0;

   _.each(days, function(day, key) {
      _.each(day.hours, function(hour) {
         if (hour > max) {
            max = hour;
         }
      });
   });

   var data = [];

   for (var i = 0; i < 7; i++) {
      for (var j = 0; j < 24; j++) {
         data.push({
            day: i,
            hour: j,
            value: days[dayNames[i]].hours[j]
         });
      }
   }

   var color = d3.scale.quantize()
      .domain([max, 1])
      .range(d3.range(9));

   var w = 960;
   var h = 30 + 7 * 30;

   var svg = d3.select("#checkin-blobs-viz").append("svg:svg")
     .attr("width", w)
     .attr("height", h);

   var hours = svg.selectAll("text.hours")
      .data(['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
         '12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']);

   hours.enter().append("text")
      .attr("transform", function(d, i) { return sprintf("translate(%d,10)", 120 + i * 30); })
      .attr("class", "hours")
      .attr("text-anchor", "middle")
      .text(String);

   hours.exit().remove();

   var day = svg.selectAll("text.days")
      .data(dayNames);

   day.enter().append("text")
      .attr("transform", function(d, i) { return "translate(0," + (35 + (i * 30)) + ")"; })
      .attr("class", "days")
      .attr("text-anchor", "bottom")
      .text(String);

   day.exit().remove();

   var circle = svg.selectAll("circle")
      .data(data);

   circle.enter().append("svg:circle")
      .attr("cy", function(d) { return 30 + d.day * 30; })
      .attr("cx", function(d) { return 120 + d.hour * 30; })
      .attr("r", function(d) { return lastfmQuantize(d.value, max); })
      .attr("opacity", function(d) { return d.value > 0 ? 1 : 0; })
      .attr("class", function (d) {
         return "q" + color(d.value) + "-9";
      });

   circle.exit().remove();
}
function initMusicBlobs(scrobbles) {
   var hours = {};

   _.each(scrobbles, function(scrobble) {
      var uts = parseInt(scrobble.date.uts, 10);

      var nearestHour = Math.floor(uts / 3600) * 3600;

      if (hours[nearestHour] === undefined) {
         hours[nearestHour] = {
            uts: nearestHour,
            value: 0
         };
      }

      hours[nearestHour].value++;
   });

   var today = moment();

   var hoursArray = _.toArray(hours);

   var lastHour = moment(_.last(hoursArray).uts * 1000);
   var firstHour = moment(_.first(hoursArray).uts * 1000);

   var daySpan = lastHour.diff(firstHour, 'days');

   var max = 0;

   _.each(hours, function(hour, key) {
      if (hour.value > max) {
         max = hour.value;
      }
   });

   var data = [];
   var dayNames = [];

   for (var i = 0; i < daySpan; i++) {
      var d = moment(lastHour);

      d.subtract('days', i);

      d.milliseconds(0);
      d.seconds(0);
      d.minutes(0);

      dayNames.push(d.format('MMMM D'));

      for (var j = 0; j < 24; j++) {
         d.hours(j);

         var uts = d.valueOf() / 1000;

         if (hours[uts] !== undefined) {
            hours[uts].day = i;
            hours[uts].hour = j;

            data.push(hours[uts]);
         } else {
            data.push({
               day: i,
               hour: j,
               value: 0
            });
         }
      }
   }

   var color = d3.scale.quantize()
      .domain([max, 1])
      .range(d3.range(9));

   var w = 960;
   var h = 30 + daySpan * 30;

   var svg = d3.select("#lastfm-blobs-viz").append("svg:svg")
     .attr("width", w)
     .attr("height", h);

   var hours = svg.selectAll("text.hours")
      .data(['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
         '12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']);

   hours.enter().append("text")
      .attr("transform", function(d, i) { return sprintf("translate(%d,10)", 120 + i * 30); })
      .attr("class", "hours")
      .attr("text-anchor", "middle")
      .text(String);

   hours.exit().remove();

   var day = svg.selectAll("text.days")
      .data(dayNames);

   day.enter().append("text")
      .attr("transform", function(d, i) { return "translate(0," + (35 + (i * 30)) + ")"; })
      .attr("class", "days")
      .attr("text-anchor", "bottom")
      .text(String);

   day.exit().remove();

   var circle = svg.selectAll("circle")
      .data(data);

   circle.enter().append("svg:circle")
      .attr("cy", function(d) { return 30 + d.day * 30; })
      .attr("cx", function(d) { return 120 + d.hour * 30; })
      .attr("r", function(d) { return lastfmQuantize(d.value, max); })
      .attr("opacity", function(d) { return d.value > 0 ? 1 : 0; })
      .attr("class", function (d) {
         return "q" + color(d.value) + "-9";
      });

   circle.exit().remove();
}

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

   postalCodes = _.chain(postalCodes).sortBy(function(postalCode) {
      return 0 - postalCode.checkins;
   }).first(24).value();

   _.each(postalCodes, function(postalCode) {
      $('#postal-code-list').append(sprintf('<li>%(postalCode)s (%(city)s, %(state)s): %(checkins)s</li>', postalCode));
   });

   $('#postal-code-list').makeacolumnlists();
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

   d3.json("js/d3/data/us-states.json", function(json) {
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

   categories = _.chain(categories).sortBy(function(category) {
      return 0 - category.checkins;
   }).first(24).value();

   _.each(categories, function(category) {
      $('#category-list').append(sprintf('<li><img src="%(icon)s" /> %(pluralName)s: %(checkins)s</li>', category));
   });

   $('#category-list').makeacolumnlists();
}

function groupByGender(data) {
   _.each(data, function(contact) {
      var gender = 'none';

      // XXX: Manual capture of gender will go away soon
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
      window.alert("Couldn't find your locker, you might need to add a config.js (see <a href=\"https://me.singly.com/Me/devdocs/\">the docs</a>)");
   }

   var lastfmUrl = baseUrl + '/Me/lastfm/getCurrent/scrobble';
   var foursquareUrl = baseUrl + '/Me/foursquare/getCurrent/checkin';

   //var contactsUrl = baseUrl + '/Me/contacts/';
   var placesUrl = baseUrl + '/Me/places/';
   var contactsUrl = baseUrl + '/query/getContact';

   $.getJSON(placesUrl, { 'limit': 1000 }, function(data) {
      initCheckinBlobs(data);
   });

   $.getJSON(lastfmUrl, { 'limit': 1000 }, function(data) {
      initMusicBlobs(data);
   });

   $.getJSON(foursquareUrl, { 'limit': 1000, 'sort': 'at', 'order': 1 }, function(data) {
      groupByCategory(data);
      groupByPostalCode(data);

      $.getJSON("data/states.json", function(stateData) {
         stateAbbreviations = stateData.items;

         mapByState(data);
      });
   });

   $.getJSON(contactsUrl, { 'limit': 5000, 'fields': '[gender:1,accounts.facebook.data.gender:1,accounts.foursquare.gender:1]' }, function(data) {
      groupByGender(data);
   });
});
