var stateCheckins = {};
var stateAbbreviations;

function quantizeState(d) {
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
         stateCheckins[stateObject.name] = stateCheckins[stateObject.name] || 0;
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

   d3.json("js-lib/d3/data/us-states.json", function(json) {
      states.selectAll("path")
            .data(json.features)
         .enter().append("path")
            .attr("class", data ? quantizeState : null)
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
      .attr("class", quantizeState);
}
