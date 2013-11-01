$(document).ready(function() {

  var stack;
  var change;
  var map;
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

  d3.json('./data/data.json', function(layers) {
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

  d3.json('./data/subunits.json', function(err, countries) {
    map = mapFn({
      data: countries,
      width: 500,
      height: 500,
      selection: '#map',
      margin: { top: 10, bottom: 10, left: 10, right: 10 }
    });

    map();

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
    title: 'Ethiopia Invasion',
    description: 'Ethiopia invades Somalia, ousts Islamic Courts Union',
    date: parseDate('2006')

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

Somalia.CountryColors = {
  Somalia: 'rgb(228, 26, 28)',
  Uganda: 'rgb(55, 126, 184)',
  Yemen: 'rgb(77, 175, 74)',
  Kenya: 'rgb(152, 78, 163)',
  Eritrea: 'rgb(255, 127, 0)',
  Djibouti: 'rgb(255, 255, 51)'
};

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
