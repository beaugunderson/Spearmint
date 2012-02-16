function photosByPopularity(photos) {
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
      return 0 - (photo.comments + photo.likes);
   });

   _.chain(transformed).first(15).each(function(photo) {
      var $div = $('<div class="item">').appendTo('#popular-photos-container');

      var $i = $('<img />');

      $i.hide();

      $i.load(function() {
         $(this).fadeIn(function() {
            $('#popular-photos-container').masonry('reload');

            var $photo = $(this);

            try {
               var color = getDominantColor($photo);
               var palette = createPalette($photo, 3);
            } catch (e) {
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

         $('#popular-photos-container').masonry('reload');
      });

      $div.append($i);

      $i.attr('src', baseUrl + '/Me/photos/image/' + photo.id);
   });

   $('#popular-photos-container').masonry({
      itemSelector: '.item',
      columnWidth: 220
   });
}
