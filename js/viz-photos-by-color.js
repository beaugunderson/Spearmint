function photosByColor(photos) {
   var photoUrl = baseUrl;
   var crossOrigin = false;

   console.log('baseUrl', baseUrl);

   if (baseUrl.search("https://singly.com") === -1) {
      photoUrl = "https://api.singly.com/" + apiToken;
      crossOrigin = true;
   }

   var image = document.getElementById("colors");

   var hueMap = makeHueMap(image, 860, 400);

   image.getContext("2d").putImageData(hueMap, 0, 0);

   _.chain(photos).first(50).each(function(photo) {
      var $i = $('<img />');

      $i.hide();

      $i.load(function() {
         var $photo = $(this);

         try {
            var color = getDominantColor($photo);
         } catch (e) {
            console.log('Spearmint: exception from getDominantColor()', e);
         }

         if (color === undefined) {
            $photo.remove();

            return;
         }

         var xy = rgbToColorXY(color, 860, 400);

         $photo.css('left', xy.x - ($photo.width() / 2));
         $photo.css('top', xy.y - ($photo.height() / 2));
         $photo.css('border', sprintf('2px solid rgb(%(r)d,%(g)d,%(b)d)', color));

         $photo.show();
      }).error(function() {
         $(this).remove();
      });

      $('#photo-palette-container').prepend($i);

      if (crossOrigin) {
         $i.attr('crossOrigin', '');
      }

      $i.attr('src', photoUrl + '/Me/photos/thumbnail/' + photo.id + '?proxy=1');
   });
}
