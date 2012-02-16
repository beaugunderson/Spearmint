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
