renderEvents = function(eventList) {
  console.log(eventList);
};

fetch('/data.json').then(function(response) {
  return response.json();
}).then(function(json) {
  renderEvents(json.events)
});
