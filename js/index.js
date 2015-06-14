(function() {
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
    return renderTemplate('eventList', {
      'eventList': eventList,
      'date': function() {
        var from = moment.unix(this.from);
        var formatTime = (0 == from.format('m')) ? 'ha' : 'h.mma';
        return from.format('dd, D MMM ' + formatTime);
      }
    });
  };

  var renderEventListInfo = function(text) {
    return renderTemplate('eventList-info', {
      'text': text
    });
  };

  var setEventListHtml = function(html) {
    $('#eventList-placeholder').html(html);
  };

  var loadEvents = function(venue, onSuccess, onFailure) {
    var url = UriTemplate.expand('https://www.denkmal.org/api/events?venue={venue}', {'venue': venue});
    fetch(url).then(function(response) {
      return response.json();
    }).then(function(json) {
      onSuccess(json['events']);
    }).catch(onFailure);
  };

  loadEvents('Renée', function(eventList) {
    if (0 === eventList.length) {
      setEventListHtml(renderEventListInfo('No upcoming shows.'));
    } else {
      setEventListHtml(renderEventList(eventList));
    }
  }, function(error) {
    setEventListHtml(renderEventListInfo('Failed to display upcoming shows.'));
  });
})();
