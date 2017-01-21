(function() {
  var venueTimeZone = 'Europe/Zurich';
  var dayOffset = 6;

  var templateCache = {};
  var renderTemplate = function(name, vars) {
    var template = templateCache[name];
    if (undefined === template) {
      template = templateCache[name] = $('#template-' + name).html();
      Mustache.parse(template);
    }
    return Mustache.render(template, vars);
  };

  var renderEventList = function(eventList) {
    var html = renderTemplate('eventList', {
      'eventList': eventList,
      'date': function() {
        var from = moment(this.getTimestamp('event.from')).tz(venueTimeZone);
        if (from.format('H') < dayOffset) {
          from.subtract(1, 'day');
        }
        return from.format('dd, D MMM H:mm');
      },
      'description': function() {
        return this.getStructuredText('event.description').asHtml();
      }
    });
    $('#eventList-placeholder').addClass('appear-done').html(html);
  };

  var renderEventListInfo = function(text) {
    var html = renderTemplate('eventList-info', {
      'text': text
    });
    $('#eventList-placeholder').addClass('appear-done').html(html);
  };

  var renderHomepage = function(homepage) {
    var html = renderTemplate('homepage', {
      'openingHours': homepage.getStructuredText('homepage.opening-hours').asHtml()
    });
    $('#homepage-placeholder').addClass('appear-done').html(html);
  };

  /**
   * @returns {Promise}
   */
  var loadEvents = function() {
    var dateMin = moment().tz(venueTimeZone)
      .subtract(dayOffset, 'hours')
      .set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0})
      .add(dayOffset, 'hours')
      .toDate();
    return Prismic.api('https://reneech.prismic.io/api')
      .then(function(api) {
        return api.query([
          Prismic.Predicates.at('document.type', 'event'),
          Prismic.Predicates.dateAfter('my.event.from', dateMin)
        ]);
      })
      .then(function(response) {
        return response.results;
      });
  };

  /**
   * @returns {Promise}
   */
  var loadHomepage = function() {
    return Prismic.api('https://reneech.prismic.io/api')
      .then(function(api) {
        return api.query([
          Prismic.Predicates.at('document.type', 'homepage')
        ]);
      })
      .then(function(response) {
        return response.results[0];
      });
  };

  loadEvents()
    .then(function(eventList) {
      if (0 === eventList.length) {
        renderEventListInfo('No upcoming shows.');
      } else {
        renderEventList(eventList);
      }
    })
    .catch(function(error) {
      renderEventListInfo('Failed to display upcoming shows.');
      throw error;
    });

  loadHomepage()
    .then(function(homepage) {
      renderHomepage(homepage);
    });
})();
