var genders = {};

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
