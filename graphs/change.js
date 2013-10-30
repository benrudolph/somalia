function changeFn(config) {

  var div = d3.select(config.selection).append('div')
    .attr('class', 'change-container');

  var layers = config.layers;

  function render() {

    var containers = div.selectAll('.change')
      .data(layers);

    containers.enter().append('div');
    containers.attr('class', function(d) {
      return ['change'].join(' ');
    });

    containers.each(function(d) {
      var container = d3.select(this);

      var value = container.selectAll('.value').data([d], function(d) {
        return d.coa + d.population_type;
      });
      value.enter().append('div');
      value.attr('class', 'value')
        .each(function(d) {
          var $ele = $(this);

          var from = +$ele.text() || 0;
          $ele.countTo({ from: from, to: window.manager.eventValue(d) });
        });
      value.exit().remove();
      var label = container.selectAll('.label').data([d], function(d) {
        return d.coa + d.population_type;
      });
      label.enter().append('div');
      label.attr('class', 'label')
        .text(d.coa + ' | ' + d.population_type);
      label.exit().remove();

    });

    containers.exit().remove();

  }

  return render;
}
