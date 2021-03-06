const Prismic = require('prismic.io');
const queryString = require('query-string');

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

  var setRenderHtml = function(name, html) {
    var $element = $('[data-render="' + name + '"]');
    $element.addClass('appear-done');
    $element.html(html);
  };

  var renderEventList = function(eventList) {
    return renderTemplate('eventList', {
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
  };

  var renderEventListInfo = function(text) {
    return renderTemplate('eventList-info', {
      'text': text
    });
  };

  var renderInfo = function(homepage) {
    return renderTemplate('info', {
      'openingHours': homepage.getStructuredText('homepage.opening-hours').asHtml()
    });
  };

  /**
   * @param {Function} prismicQuery
   * @returns {Promise}
   */
  var loadEvents = function(prismicQuery) {
    var dateMin = moment().tz(venueTimeZone)
      .subtract(dayOffset, 'hours')
      .set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0})
      .add(dayOffset, 'hours')
      .toDate();
    return prismicQuery([
      Prismic.Predicates.at('document.type', 'event'),
      Prismic.Predicates.dateAfter('my.event.from', dateMin)
    ], {
      orderings: '[my.event.from]'
    }).then(function(response) {
      return response.results;
    });
  };

  /**
   * @param {Function} prismicQuery
   * @returns {Promise}
   */
  var loadHomepage = function(prismicQuery) {
    return prismicQuery([
      Prismic.Predicates.at('document.type', 'homepage')
    ]).then(function(response) {
      return response.results[0];
    });
  };

  Prismic.api('https://reneech.prismic.io/api').then(function(prismicApi) {

    var prismicRef = queryString.parse(location.search)['token'];
    var prismicQuery = function(q, options) {
      options = options || {};
      options['ref'] = prismicRef;
      return prismicApi.query(q, options);
    };

    loadEvents(prismicQuery)
      .then(function(eventList) {
        if (0 === eventList.length) {
          setRenderHtml('eventList', renderEventListInfo('No upcoming shows.'));
        } else {
          setRenderHtml('eventList', renderEventList(eventList));
        }
      })
      .catch(function(error) {
        setRenderHtml('eventList', renderEventListInfo('Failed to display upcoming shows.'));
        throw error;
      });

    loadHomepage(prismicQuery)
      .then(function(homepage) {
        setRenderHtml('info', renderInfo(homepage));
        var introText = homepage.getStructuredText('homepage.intro-text');
        if (introText) {
          setRenderHtml('intro', introText.asHtml());
        }
      });

  });

})();
