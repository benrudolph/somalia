function stackFn(config) {

  var margin = config.margin || {
    top: 50,
    bottom: 50,
    left: 80,
    right: 90
  };

  var duration = 1000;

  var legendBoxLength = 13;

  var layers = config.layers;
  var stack = d3.layout.stack()
    .values(function(d) {
      // Hack to give properties to values
      d.values.forEach(function(value) {
        value.population_type = d.population_type;
        value.coa = d.coa; });
      return d.values;
    })
    .order('inside-out')
    .y(function(d) {
      return getValue(d);
    });

  var width = config.width - margin.left - margin.right;
  var height = config.height - margin.top - margin.bottom;

  var x = d3.time.scale()
    .domain([parseDate('' + 2000), parseDate('' + 2012)])
    .range([0, width]);

  var y = d3.scale.linear()
    .nice()
    .range([height, 0]);


  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format('%Y'))
    .ticks(d3.time.years, 1)
    .tickSize(-height, 0, 0)
    .tickPadding(6);

  var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(5)
    .orient("left")
    .tickSize(-width, 0, 0)
    .tickPadding(8);

  var area = d3.svg.area()
    .x(function(d) {
      return x(parseDate('' + d.year));
    })
    .y0(function(d) {
      return y(+d.y0);
    })
    .y1(function(d) {
      return y(+d.y0 + getValue(d));
    });

  var svg = d3.select(config.selection).append("svg")
      .attr("width", config.width)
      .attr("height", config.height)
      .attr('class', 'bounding-svg')
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  /* Legend */
  var legendContainer = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(' + (width + 10) + ', 0)');

  var countries = _.uniq(layers.map(function(d) { return d.coa; }));
  var yLegend = d3.scale.ordinal()
    .domain(countries)
    .rangeBands([height, 0]);

  var legend = legendContainer.selectAll('.country')
    .data(countries);
  legend.enter().append('g');
  legend.attr('transform', function(d) {
    return 'translate(0,' + yLegend(d) + ')';
  })
    .attr('class', 'country')
    .each(function(d) {
      var country = d3.select(this);
      country.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', legendBoxLength)
        .attr('height', legendBoxLength)
        .style('fill', function(d) {
          return Somalia.CountryColors[d];
        });


      country.append('text')
        .attr('x', 20)
        .attr('y', 0)
        .attr('dy', '.7em')
        .text(d);
    });
  /* end legend */



  function render() {
    var extent = yExtent(layers);
    y.domain(extent);

    var stacks = svg.selectAll(".stack")
        .data(stack(layers));

    stacks.enter().append("path");
    stacks
      .transition()
      .duration(duration)
      .attr("d", function(d) {
          return (area(d.values));
        })
        .attr('class', function(d) {
          return [d.population_type.toLowerCase().replace(/ /g, ''),
                  d.coa.toLowerCase(),
                  'stack'].join(' ');
        })
        .style('fill', function(d) {
          return Somalia.CountryColors[d.coa];
        });

    stacks.on('click', function(d) {
      if (window.manager.isFilter()) {
        window.manager.emptyFilter();
      } else {
        window.manager.set('filter', { population_type: d.population_type, coa: d.coa });
      }
    });

    stacks.on('mouseover', function(d) {
    });

    stacks.exit().remove();

    var transitionBlock = svg.selectAll('.transition-block').data([0]);
    transitionBlock.enter().append('rect');
    transitionBlock
      .attr('y', y(extent[1]))
      .attr('height', y(extent[0]))
      .attr('class', 'transition-block');

    transitionBlock
      .transition()
      .duration(duration)
      .ease('linear')
      .attr('width', function(d) {
        return x(parseDate('2012')) - x(window.manager.event().date);
      })
      .attr('x', function(d) {
        return x(window.manager.event().date);
      });


    svg.select('.x.axis').remove();

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    if (svg.select('.y.axis').empty()) {
      svg.append("g")
        .attr("class", "y axis");
    }
    svg.select('.y.axis')
      .transition()
      .duration(duration)
      .call(yAxis);

  }

  function yExtent(layers) {
    var extent = [0,0];

    layers.forEach(function(layer) {

      var layerExtent = d3.extent(layer.values, function(d) {
        return getValue(d);
      });

      extent[0] -= Math.abs(layerExtent[0]);
      extent[1] += Math.abs(layerExtent[1]);
    });

    return extent;
  }

  function getValue(d) {
      var filter = window.manager.get('filter');
      if (window.manager.isFilter()) {
        if (d.population_type === filter.population_type && d.coa === filter.coa) {
          return +d[window.manager.get('measure')] || 0;
        } else {
          return 0;
        }
      } else {
        return +d[window.manager.get('measure')] || 0;
      }
  }

  return render;

}
