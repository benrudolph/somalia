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

var stack;
d3.json('/data/data.json', function(layers) {

  stack = stackFn({ layers: layers, selection: '#stack-graph', currentYear: 2003 });
  stack();

    /*function transition() {
      d3.selectAll("path")
          .data(function() {
            var d = layers1;
            layers1 = layers0;
            return layers0 = d;
          })
        .transition()
          .duration(2500)
          .attr("d", area);
    }

    // Inspired by Lee Byron's test data generator.
    function bumpLayer(n) {

      function bump(a) {
        var x = 1 / (.1 + Math.random()),
            y = 2 * Math.random() - .5,
            z = 10 / (.1 + Math.random());
        for (var i = 0; i < n; i++) {
          var w = (i / n - y) * z;
          a[i] += x * Math.exp(-w * w);
        }
      }

      var a = [], i;
      for (i = 0; i < n; ++i) a[i] = 0;
      for (i = 0; i < 5; ++i) bump(a);
      return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
    }*/

  });

function stackFn(config) {
  var currentYear = config.currentYear;

  var stack = d3.layout.stack()
    .values(function(d) {
      return d.filtered;
    })
    .y(function(d) {
      return +d.value;
    });

  var width = 960,
      height = 400;


  var x = d3.scale.linear()
      .domain([2000, 2012])
      .range([0, width]);

  var y = d3.scale.linear()
      .domain([0, 3000000])
      .range([height, 0]);

  var color = d3.scale.linear()
      .range(["#aad", "#556"]);

  var area = d3.svg.area()
    .x(function(d) {
      return x(d.year);
    })
    .y0(function(d) {
      return y(+d.y0);
    })
    .y1(function(d) {
      return y(+d.y0 + +d.value);
    });

  var svg = d3.select(config.selection).append("svg")
      .attr("width", width)
      .attr("height", height);

  var layers = config.layers;

  function render() {
    layers = filtered(layers);

    var stacks = svg.selectAll("path")
        .data(stack(layers), function(d,i) {
          console.log(d);
          return i;
        });

    stacks.enter().append("path");
    stacks
      .transition()
      .duration(1000)
      .attr("d", function(d) {
          return area(d.filtered);
        })
        .attr('class', function(d) {
          return [d.population_type.toLowerCase().replace(/ /g, ''),
                  d.coa.toLowerCase()].join(' ');
        });
  }

  function filtered(layers) {
    layers.forEach(function(layer) {
      layer.filtered = layer.values.filter(function(d) {
        return currentYear >= d.year;
      });
    });
    return layers;
  }

  render.currentYear = function(year) {
    if (!arguments) return currentYear;
    currentYear = year;
    return this;
  };

  render.nextYear = function() {
    currentYear ++;
  };

  render.previousYear = function() {
    currentYear --;
  };

  return render;

}
