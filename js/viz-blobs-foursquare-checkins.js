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
