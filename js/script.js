$(function() {
   if (baseUrl === false) {
      window.alert("Couldn't find your locker, you might need to add a config.js (see https://me.singly.com/Me/devdocs/)");
   }

   var url = baseUrl + '/Me/contacts/';

   $('#url').html(sprintf('<a href="%s">%s</a>', url, url));

   $.getJSON(url, { 'limit': 1000, 'sort': 'at', 'order': 1 }, function(data) {
      console.log(data);
   });
});
