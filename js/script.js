var categories = {};
var cities = {};
var stateCheckins = {};

var genders = {};

var stateAbbreviations;

function blobQuantize(value, max) {
   return 2 + value / max * 14;
}

var dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
var dayNameLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Average'];

function popularPhotosByColor(photos) {
   var transformed = [];

   _.each(photos, function(photo) {
      var comments = 0;
      var likes = 0;

      if (photo.sources[0] === undefined ||
         photo.sources[0].data === undefined) {
         return;
      }

      if (photo.sources[0].data.comments !== undefined &&
         photo.sources[0].data.comments.data !== undefined) {
         comments = photo.sources[0].data.comments.data.length;
      }

      if (photo.sources[0].data.likes !== undefined &&
         photo.sources[0].data.likes.data !== undefined) {
         likes = photo.sources[0].data.likes.data.length;
      }

      transformed.push({
         id: photo.id,
         url: photo.url,
         thumbnail: photo.thumbnail,
         timestamp: photo.timestamp,
         comments: comments,
         likes: likes
      });
   });

   transformed = _.sortBy(transformed, function(photo) {
      if (photo.comments >= photo.likes) {
         return 0 - photo.comments;
      }

      return 0 - photo.likes;
   });

   _.chain(transformed).first(15).each(function(photo) {
      var $div = $('<div class="item">').appendTo('#popular-photos');

      var $i = $('<img />');

      $i.hide();

      $i.load(function() {
         $(this).fadeIn(function() {
            $('#popular-photos').masonry('reload');

            var $photo = $(this);

            try {
               var color = getDominantColor($photo);
               var palette = createPalette($photo, 3);

               console.log(color, palette);
            } catch (e) {
               console.log('error getting color');
            }

            $(this).parent().addAnnotations(function(annotation) {
               return $('<span />').addClass(annotation.className).html(annotation.value);
            }, [
               { x: -20, y: -20, className: 'black circle note', value: photo.comments },
               { x: -46, y: -20, className: 'gray circle note', value: photo.likes }
            ]);
         });
      }).error(function() {
         $(this).parent().remove();

         $('#popular-photos').masonry('reload');
      });

      $div.append($i);

      $i.attr('crossOrigin', '');
      $i.attr('src', baseUrl + '/Me/photos/image/' + photo.id + '?proxy=1');
   });

   $('#popular-photos').masonry({
      itemSelector: '.item',
      columnWidth: 220
   });
}

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
      .domain([1, max])
      .range(d3.range(3,9));

   var w = 825;
   var h = 20 + 8 * 30;

   var svg = d3.select("#checkin-blobs-viz").append("svg:svg")
     .attr("width", w)
     .attr("height", h);

   var hours = svg.selectAll("text.hours")
      .data(['am', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
         'pm', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']);

   hours.enter().append("text")
      .attr("transform", function(d, i) { return sprintf("translate(%d,10)", 120 + i * 30); })
      .attr("class", "hours")
      .attr("text-anchor", "middle")
      .text(String);

   hours.exit().remove();

   var day = svg.selectAll("text.days")
      .data(dayNameLabels);

   day.enter().append("text")
      .attr("transform", function(d, i) {
         var offset = 35;
         if (i == 7) {
            offset = 45;
         }
         return "translate(0," + (offset + (i * 30)) + ")";
      })
      .attr("class", "days")
      .attr("text-anchor", "bottom")
      .text(String);

   day.exit().remove();

   var circle = svg.selectAll("circle.day")
      .data(data);

   circle.enter().append("svg:circle")
      .attr("cy", function(d) { return 30 + d.day * 30; })
      .attr("cx", function(d) { return 120 + d.hour * 30; })
      .attr("r", function(d) { return blobQuantize(d.value, max); })
      .attr("opacity", function(d) { return d.value > 0 ? 1 : 0; })
      .attr("class", function (d) {
         return "day q" + color(d.value) + "-9";
      });

   circle.exit().remove();

   var averageData = [];

   for (var i = 0; i < 24; i++) {
      averageData[i] = 0;

      for (var j = 0; j < 7; j++) {
         averageData[i] += days[dayNames[j]].hours[i];
      }

      averageData[i] /= 7;
   }

   svg.append("line")
      .attr("x1", 0)
      .attr("y1", 24 + 7 * 30)
      .attr("x2", 825)
      .attr("y2", 24 + 7 * 30)
      .attr("class", "rule");

   var averageCircle = svg.selectAll("circle.average")
      .data(averageData);

   averageCircle.enter().append("svg:circle")
      .attr("cy", function(d) { return 40 + 7 * 30; })
      .attr("cx", function(d, i) { return 120 + i * 30; })
      .attr("r", function(d) { return blobQuantize(d, max); })
      .attr("opacity", function(d) { return d > 0 ? 1 : 0; })
      .attr("class", function (d) {
         return "average q" + color(d) + "-9";
      });

   averageCircle.exit().remove();
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

   hoursArray = _.sortBy(hoursArray, function(hour) {
      return hour.uts;
   });

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
      .domain([1, max])
      .range(d3.range(3,9));

   var w = 825;
   var h = 20 + daySpan * 30;

   var svg = d3.select("#lastfm-blobs-viz").append("svg:svg")
     .attr("width", w)
     .attr("height", h);

   var hours = svg.selectAll("text.hours")
      .data(['am', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
         'pm', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']);

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
      .attr("r", function(d) { return blobQuantize(d.value, max); })
      .attr("opacity", function(d) { return d.value > 0 ? 1 : 0; })
      .attr("class", function (d) {
         return "q" + color(d.value) + "-9";
      });

   circle.exit().remove();
}

function addCity(location) {
   var name = sprintf("%s, %s", $.trim(location.city), $.trim(location.state));

   if (cities[name] === undefined) {
      cities[name] = location;

      cities[name].checkins = 0;
   }

   cities[name].checkins++;
}

function addCategory(category) {
   var name = category.pluralName;

   if (categories[name] === undefined) {
      categories[name] = category;

      categories[name].checkins = 0;
   }

   categories[name].checkins++;
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

function quantize(d) {
   if (stateCheckins[d.properties.name] > 0) {
      return "q8-9";
   }

   return "q5-9";

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
         if (stateCheckins[stateObject.name] === undefined) {
            stateCheckins[stateObject.name] = 0;
         }

         stateCheckins[stateObject.name]++;
      }
   });

   var projection = d3.geo.albersUsa();

   projection.scale(780);
   projection.translate([412, 200]);

   var path = d3.geo.path();

   path.projection(projection);

   var svg = d3.select("#states-with-checkins-map")
      .append("svg");

   var states = svg.append("g")
      .attr("id", "states");

   var labels = svg.append("g")
      .attr("id", "labels");

   d3.json("js/d3/data/us-states.json", function(json) {
      states.selectAll("path")
            .data(json.features)
         .enter().append("path")
            .attr("class", data ? quantize : null)
            .attr("d", path)
            .on('mouseover', function(d) {
               var c = path.centroid(d);

               labels.append("circle")
                  .attr("cx", c[0])
                  .attr("cy", c[1])
                  .attr("r", 15)
                  .attr("pointer-events", "none")
                  .attr("class", sprintf("id-%s q8-9", d.id));

               labels.append("text")
                  .attr("transform", function(d, i) { return sprintf("translate(%d,%d)", c[0], c[1] + 1); })
                  .attr("class", sprintf("id-%s map-label", d.id))
                  .attr("text-anchor", "middle")
                  .attr("pointer-events", "none")
                  .attr("alignment-baseline", "middle")
                  .text(stateCheckins[d.properties.name] ? stateCheckins[d.properties.name] : 0);
            })
            .on('mouseout', function(d) {
               labels.selectAll('text.id-' + d.id).remove();
               labels.selectAll('circle.id-' + d.id).remove();
            });
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

   $('#male').text(genders['male']);
   $('#female').text(genders['female']);
   $('#unknown').text(genders['none']);
}

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

   //var contactsUrl = baseUrl + '/Me/contacts/';
   var placesUrl = baseUrl + '/Me/places/';
   var contactsUrl = baseUrl + '/query/getContact';
   var photosUrl = baseUrl + '/query/getPhoto';

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

   $.getJSON(photosUrl, { 'limit': 500, 'terms': '[me:true]', 'fields': '[id:1,sources.data.comments:1,sources.data.likes:1,url:1,thumbnail:1,timestamp:1]', 'sort': '\'{"timestamp":1}\'' }, function(data) {
      popularPhotosByColor(data);
   });

   $.getJSON(contactsUrl, { 'limit': 5000, 'fields': '[gender:1,accounts.facebook.data.gender:1,accounts.foursquare.gender:1]' }, function(data) {
      groupByGender(data);
   });
});
