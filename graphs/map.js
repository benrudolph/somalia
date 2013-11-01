function mapFn(config) {

  var margin = config.margin;

  var width = config.width - margin.left - margin.right,
      height = config.height - margin.top - margin.bottom;

  var svg = d3.select(config.selection).append("svg")
      .attr("width", config.width)
      .attr("height", config.height)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var projection = d3.geo.mercator()
    .center([49, 10])
    .scale(500)
    .translate([width / 2, height / 2]);

  var path = d3.geo.path()
    .projection(projection);

  var data = config.data;

  function render() {


    var countries = svg.selectAll('.country').data(data.features);

    countries.enter().append('path');
    countries.attr("d", path)
      .attr('class', 'country');



  }

  return render;

}
