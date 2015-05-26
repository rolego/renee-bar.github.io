var templateCache = {};
renderTemplate = function(name, vars) {
  var template = templateCache[name];
  if (undefined === template) {
    template = templateCache[name] = $('#template-' + name).html();
    Mustache.parse(template);
  }
  return Mustache.render(template, vars);
};

renderEvents = function(eventList) {
  return renderTemplate('eventList', {
    'eventList': eventList,
    'date': function () {
      var from = moment.unix(this.from);
      var formatTime = (0 == from.format('m')) ? 'ha' : 'h.mma';
      return from.format('dd, D MMM ' + formatTime);
    }
  });
};

fetch('https://www.denkmal.org/api/events?venue=Kaserne').then(function(response) {
  return response.json();
}).then(function(json) {
  var html = renderEvents(json['events']);
  $('#eventList-placeholder').html(html);
});
