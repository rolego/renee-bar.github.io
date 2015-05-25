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
      return this.from;
    }
  });
};

fetch('https://www.denkmal.dev/api/events?venue=Kaserne').then(function(response) {
  return response.json();
}).then(function(json) {
  var html = renderEvents(json['events']);
  $('#agenda').html(html);
});
