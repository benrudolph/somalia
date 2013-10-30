$(document).ready(function() {

  var stack;
  var change;
  window.manager = new Somalia.Manager();

  window.manager.on('change', function() {
    stack();
    tooltip();
    change();
  });

  $(document).keydown(function(e) {
    console.log(e.keyCode);
    e.preventDefault();
    if (e.keyCode === 37) {
      // Left
      window.manager.previousEvent();

    } else if (e.keyCode === 39) {
      // Right
      window.manager.nextEvent();

    } else if (e.keyCode === 32) {

      window.manager.toggleMeasure();
    }

  });

  tooltip();

  d3.json('/data/data.json', function(layers) {
    stack = stackFn({
      layers: layers,
      width: 800,
      height: 400,
      selection: '#stack-graph',
    });
    stack();

    change = changeFn({
      layers: layers,
      selection: '#change'
    });

    change();

  });
});

var parseDate = d3.time.format("%Y").parse;


var Somalia = {};

Somalia.Manager = Backbone.Model.extend({
  defaults: {
    filter: { population_type: null, coa: null },
    eventIdx: 0,
    measure: 'change'
  },

  nextEvent: function() {
    var idx = this.get('eventIdx') + 1 >= Somalia.Events.length ? this.get('eventIdx') : this.get('eventIdx') + 1;
    console.log(idx);
    this.set('eventIdx', idx);
  },

  previousEvent: function() {
    var idx = this.get('eventIdx') - 1 < 0 ? 0 : this.get('eventIdx') - 1;
    this.set('eventIdx', idx);
  },

  isFilter: function() {
    var filter = this.get('filter');
    return filter.population_type && filter.coa;
  },

  toggleMeasure: function() {
    var measure = this.get('measure');
    if (measure === 'change') this.set('measure', 'value');
    else if (measure === 'value') this.set('measure', 'change');
  },

  emptyFilter: function() {
    this.set('filter', { population_type: null, coa: null });
  },

  event: function() {
    return Somalia.Events[this.get('eventIdx')];
  },

  eventValue: function(d) {
    var value = +(_.findWhere(d.values, { year: this.event().date.getFullYear() })).value;

    return value;
  }

});

Somalia.Events = [
  { title: 'Beginning of Time',
    description: '',
    date: parseDate('2000')
  },
  {
    title: 'Ethiopia Withdrawal',
    description: 'Ethiopia withdraws from Somalia, hands control to AMISOM/TFG forces',
    date: parseDate('2009')
  },
  { title: 'End of Time',
    description: '',
    date: parseDate('2012')
  },
];

function tooltip() {
  var $body = $('body');
  var $tooltip = $('#tooltip');
  var left = ($body.width() / 2) - ($tooltip.width() / 2);

  $tooltip.css({
    left: left + 'px'
  });

  $tooltip.find('.title').text(window.manager.event().title);
  $tooltip.find('.description').text(window.manager.event().description);
}

function convert(layers) {
  layers.forEach(function(layer) {

    layer.values.forEach(function(d, idx) {
      if (idx === 0) {
        d.change = null;
      } else {
        d.change = +d.value - +layer.values[idx - 1].value;
      }
    });

  });
  return layers;
}
