$(document).ready(function() {
  $(document).keydown(function(e) {
    console.log(e.keyCode);
    if (e.keyCode === 37) {
      // Left
      stack.previousYear();
      stack();

    } else if (e.keyCode === 39) {
      // Right
      stack.nextYear();
      stack();

    }

  });

});

var parseDate = d3.time.format("%Y").parse;

var stack;
d3.json('/data/data.json', function(layers) {

  stack = stackFn({
    layers: layers,
    width: 800,
    height: 400,
    selection: '#stack-graph',
    currentDate: parseDate('2012')
  });
  stack();

});

function stackFn(config) {
  var currentDate = config.currentDate;

  var margin = config.margin || {
    top: 50,
    bottom: 50,
    left: 80,
    right: 50
  };

  var stack = d3.layout.stack()
    .values(function(d) {
      return d.values;
    })
    .y(function(d) {
      return +d.value;
    });

  var width = config.width - margin.left - margin.right;
  var height = config.height - margin.top - margin.bottom;



  var x = d3.time.scale()
    .domain([parseDate('' + 2000), parseDate('' + 2012)])
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([0, 3000000])
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

  var color = d3.scale.linear()
      .range(["#aad", "#556"]);

  var area = d3.svg.area()
    .x(function(d) {
      return x(parseDate('' + d.year));
    })
    .y0(function(d) {
      return y(+d.y0);
    })
    .y1(function(d) {
      return y(+d.y0 + +d.value);
    });

  var svg = d3.select(config.selection).append("svg")
      .attr("width", config.width)
      .attr("height", config.height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var layers = config.layers;

  function render() {

    var stacks = svg.selectAll(".stack")
        .data(stack(layers));

    stacks.enter().append("path");
    stacks
      .transition()
      .duration(1000)
      .attr("d", function(d) {
          return (area(d.values));
        })
        .attr('class', function(d) {
          return [d.population_type.toLowerCase().replace(/ /g, ''),
                  d.coa.toLowerCase(),
                  'stack'].join(' ');
        });

    var transitionBlock = svg.selectAll('.transition-block').data([0]);
    transitionBlock.enter().append('rect');
    transitionBlock
      .attr('y', 0)
      .attr('height', y(height))
      .attr('class', 'transition-block');

    transitionBlock
      .transition()
      .duration(1000)
      .ease('linear')
      .attr('width', function(d) {
        return x(parseDate('2012')) - x(currentDate);
      })
      .attr('x', function(d) {
        return x(currentDate);
      });


    svg.select('.y.axis').remove();
    svg.select('.x.axis').remove();

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  }


  render.currentDate = function(date) {
    if (!arguments) return currentDate;
    currentDate = date;
    return this;
  };

  render.nextYear = function() {
    currentDate.setFullYear(currentDate.getFullYear() + 1);
  };

  render.previousYear = function() {
    currentDate.setFullYear(currentDate.getFullYear() - 1);
  };

  return render;

}
