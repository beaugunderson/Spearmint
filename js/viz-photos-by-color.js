function photosByColor(photos) {
   var image = document.getElementById("colors");

   var hueMap = makeHueMap(image, 860, 400);

   var ctx = image.getContext("2d");

   ctx.putImageData(hueMap, 0, 0);

   _.chain(photos).first(50).each(function(photo) {
      var $i = $('<img />');

      $i.hide();

      $i.load(function() {
         var $photo = $(this);

         try {
            var color = getDominantColor($photo);

            var xy = rgbToColorXY(color, 860, 400);

            $photo.css('left', xy.x - ($photo.width() / 2));
            $photo.css('top', xy.y - ($photo.height() / 2));
            $photo.css('border', sprintf('2px solid rgb(%(r)d,%(g)d,%(b)d)', color));

            $photo.show();
         } catch (e) {
            console.log('error getting color');

            $photo.remove();
         }
      }).error(function() {
         $(this).remove();
      });

      $('#photo-palette-container').prepend($i);

      $i.attr('crossOrigin', '');
      $i.attr('src', baseUrl + '/Me/photos/thumbnail/' + photo.id + '?proxy=1');
   });
}
