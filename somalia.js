d3.json('/data/data.json', function(layers) {

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
  var stack = d3.layout.stack()
    .values(function(d) {
      return d.values;
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

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  function render() {

    svg.selectAll("path")
        .data(stack(layers))
      .enter().append("path")
        .attr("d", function(d) {
          return area(d.values);
        })
        .attr('class', function(d) {
          return [d.population_type.toLowerCase().replace(/ /g, ''),
            d.coa.toLowerCase()].join(' ');
        });
  }

  return render

}
