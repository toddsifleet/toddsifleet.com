// Generated by CoffeeScript 1.5.0
(function() {
  var BubbleChart, Fork, chart, current_repo, draw_chart, draw_table, format_date, get_data, handle_data, handle_response, repos, today, update_data;

  repos = {};

  current_repo = false;

  today = new Date;

  chart = false;

  get_data = function(repo) {
    var path;
    path = "https://api.github.com/repos/" + repo + "/forks?sort=watchers&direction=dsc";
    return $.ajax({
      url: path,
      success: function(response) {
        return handle_response(repo, response);
      }
    });
  };

  BubbleChart = (function() {

    function BubbleChart(container, x_name, y_name, r_name) {
      this.container = container;
      this.x_name = x_name;
      this.y_name = y_name;
      this.r_name = r_name;
      this.colors = d3.scale.category10();
      this.legend = $("#legend");
      this.svg = false;
      this.margin = {
        top: 30,
        bottom: 20,
        left: 20,
        right: 20
      };
      this.padding = {
        top: 0,
        bottom: 50,
        left: 50,
        right: 0
      };
      this.initChart();
    }

    BubbleChart.prototype.setDimensions = function() {
      var container, s, _i, _len, _ref, _results;
      this.height = Math.max(300, window.innerHeight - (this.margin.top + this.margin.bottom));
      this.width = Math.max(500, window.innerWidth - (this.margin.left + this.margin.right));
      this.max_radius = Math.min(this.height, this.width) / 5;
      this.min_radius = this.max_radius / 10;
      container = $("#" + this.container);
      _ref = ['left', 'right', 'top', 'bottom'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s = _ref[_i];
        _results.push(container.css("margin-" + s, this.margin[s]));
      }
      return _results;
    };

    BubbleChart.prototype.initChart = function() {
      this.setDimensions();
      if (this.svg) {
        this.svg.remove();
      }
      this.svg = d3.select("#" + this.container).append("svg").attr("height", this.height).attr("width", this.width);
      return this.drawLabels();
    };

    BubbleChart.prototype.setData = function(data) {
      this.data = data;
      this.initChart();
      this.setBounds();
      this.setScale();
      return this.setAxes();
    };

    BubbleChart.prototype.setBounds = function() {
      var attr, point, _i, _j, _len, _len1, _ref, _ref1, _results;
      _ref = ['r', 'x', 'y'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        this["max_" + attr + "_value"] = -1 * 10e100;
        this["min_" + attr + "_value"] = 1 * 10e100;
      }
      _ref1 = this.data;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        point = _ref1[_j];
        _results.push((function() {
          var _k, _len2, _ref2, _results1;
          _ref2 = ['r', 'x', 'y'];
          _results1 = [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            attr = _ref2[_k];
            if (point[this["" + attr + "_name"]] > this["max_" + attr + "_value"]) {
              _results1.push(this["max_" + attr + "_value"] = point[this["" + attr + "_name"]]);
            } else if (point[this["" + attr + "_name"]] < this["min_" + attr + "_value"]) {
              _results1.push(this["min_" + attr + "_value"] = point[this["" + attr + "_name"]]);
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    BubbleChart.prototype.setScale = function() {
      var chart_height, chart_width, max_overhang, overhang, point, radius, side, temp_x_scale, temp_y_scale, x_value, y_value, _i, _j, _len, _len1, _ref, _ref1;
      this.r_scale = d3.scale.linear().domain([this.min_r_value, this.max_r_value]).range([this.min_radius, this.max_radius]);
      max_overhang = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      };
      temp_x_scale = d3.scale.linear().domain([this.min_x_value, this.max_x_value]).range([this.padding.left, this.width - this.padding.left]);
      temp_y_scale = d3.scale.linear().domain([this.max_y_value, this.min_y_value]).range([this.padding.top - max_overhang.top, this.height - this.padding.bottom]);
      chart_width = this.width - this.padding.left - this.padding.right;
      chart_height = this.height - this.padding.top - this.padding.bottom;
      _ref = this.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        point = _ref[_i];
        x_value = temp_x_scale(point[this.x_name]);
        y_value = temp_y_scale(point[this.y_name]);
        radius = this.r_scale(point[this.r_name]);
        overhang = {
          left: radius + this.padding.left - x_value,
          right: x_value + radius - chart_width,
          top: radius + this.padding.top - y_value,
          bottom: y_value + radius - chart_height
        };
        _ref1 = ['left', 'right', 'top', 'bottom'];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          side = _ref1[_j];
          if (overhang[side] > max_overhang[side]) {
            max_overhang[side] = overhang[side];
          }
        }
      }
      this.x_scale = d3.scale.linear().domain([this.min_x_value, this.max_x_value]).range([this.padding.left + max_overhang.left, this.padding.left + chart_width - max_overhang.right]);
      return this.y_scale = d3.scale.linear().domain([this.max_y_value, this.min_y_value]).range([this.padding.top + max_overhang.top, chart_height - max_overhang.bottom]);
    };

    BubbleChart.prototype.setAxes = function() {
      this.x_axis = d3.svg.axis().orient("bottom").scale(this.x_scale).tickFormat(function(x) {
        return Math.abs(x);
      });
      this.y_axis = d3.svg.axis().orient("left").scale(this.y_scale);
      this.svg.append("g").attr("transform", "translate(0," + (this.height - this.padding.bottom) + ")").attr("class", "x axis").call(this.x_axis);
      return this.svg.append("g").attr("transform", "translate(" + this.padding.bottom + ",0)").attr("class", "y axis").call(this.y_axis);
    };

    BubbleChart.prototype.drawLabels = function() {
      this.svg.append("text").attr("class", "x label").attr("text-anchor", "middle").attr("x", this.width / 2).attr("y", this.height - 6).text("Days Since Last Commit");
      return this.svg.append("text").attr("transform", "rotate(-90)").attr("y", 0).attr("x", 0 - (this.height / 2)).attr("dy", "1em").style("text-anchor", "middle").text("Number of Forks");
    };

    BubbleChart.prototype.drawBubbles = function() {
      var circles;
      circles = this.svg.selectAll("circle").data(this.data).enter().append("circle");
      circles.attr("cy", function(d) {
        return chart.y_scale(d.forks);
      }).attr("cx", function(d) {
        return chart.x_scale(d.age);
      }).attr("r", function(d) {
        return chart.r_scale(d.watchers);
      });
      return circles.on("click", function(d, i) {
        return d.toggle_legend(d3.event.pageX, d3.event.pageY, chart.colors(i));
      }).style("fill", function(d, i) {
        return chart.colors(i);
      }).style("stroke", "#000000").style("stroke-width", "2").style("opacity", ".7");
    };

    return BubbleChart;

  })();

  format_date = function(date) {
    var day, month, year;
    day = date.getDate();
    month = date.getMonth();
    year = date.getFullYear();
    return "" + month + "/" + day + "/" + year;
  };

  Fork = (function() {

    function Fork(data) {
      var attr, _i, _len, _ref;
      this.data = data;
      _ref = ['name', 'forks', 'watchers'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        this[attr] = this.data[attr];
      }
      this.created_date = new Date(this.data.created_at);
      this.modified_date = new Date(this.data.pushed_at);
      this.owner_login = this.data.owner.login;
      this.repo_url = "https://www.github.com/" + this.owner_login + "/" + this.name;
      this.age = (this.modified_date.getTime() - today.getTime()) / (1000 * 24 * 60 * 60);
    }

    Fork.prototype.toRow = function(row_number) {
      var col, columns, output, row_class, _i, _len;
      row_class = row_number % 2 ? 'odd' : 'even';
      this.repo_link = "<a target = \"_blank\" href = \"" + this.repo_url + "\">" + this.owner_login + "/" + this.name + "</a>";
      this.owner_link = "<a target = \"_blank\" href = \"https://www.github.com/" + this.owner_login + "\" >" + this.owner_login + "</a>";
      this.modified_string = format_date(this.modified_date);
      this.created_string = format_date(this.created_date);
      output = '';
      columns = ['repo_link', 'owner_link', 'created_string', 'modified_string', 'forks', 'watchers'];
      for (_i = 0, _len = columns.length; _i < _len; _i++) {
        col = columns[_i];
        output += "<td>" + this[col] + "</td>";
      }
      return "<tr class = \"" + row_class + "\">" + output + "</tr>";
    };

    Fork.prototype.toggle_legend = function(x, y, color) {
      var height, width;
      chart.legend.html("<a href = \"#\" style = \"background-color: " + color + "\" onClick = '$(\"#legend\").hide(); return false;' class = \"x-button\">X</a>\n<h1>" + this.repo_link + "</h1>\n<table>\n    <tr>\n        <td colspan = 2>" + this.data.description + "</td>\n    </tr>\n    <tr>\n        <td>Created:</td><td>" + this.created_string + "</td>\n    </tr>\n    <tr>\n        <td>Owner</td><td>" + this.owner_link + "</td>\n    </tr>\n    <tr>\n        <td>Last Push:</td><td>" + this.modified_string + "</td>\n    </tr>\n    <tr>\n        <td>Forks:</td><td>" + this.forks + "</td>\n    </tr>\n    <tr>\n        <td>Watchers:</td><td>" + this.watchers + "</td>\n    </tr>\n</table>");
      width = chart.legend.width();
      height = chart.legend.height();
      if (x > window.innerWidth - width - 40) {
        x = window.innerWidth - (width + 40);
      } else {
        x += 10;
      }
      if (y > window.innerHeight - height - 40) {
        y = window.innerHeight - (height + 40);
      } else {
        y += 10;
      }
      return chart.legend.show().offset({
        left: x,
        top: y
      });
    };

    return Fork;

  })();

  draw_table = function(repo_name) {
    var current, fork, forks, new_row, row_number, _i, _len, _ref, _results;
    forks = $('#forks');
    forks.show();
    forks.find("tr:gt(0)").remove();
    _ref = repos[repo_name];
    _results = [];
    for (row_number = _i = 0, _len = _ref.length; _i < _len; row_number = ++_i) {
      fork = _ref[row_number];
      new_row = $(fork.toRow(row_number));
      if (current) {
        current.after(new_row);
      } else {
        forks.find('thead').after(new_row);
      }
      _results.push(current = new_row);
    }
    return _results;
  };

  handle_response = function(repo_name, data) {
    if (data.message === "Not Found") {
      $("#error").html("" + repo_name + " not found").slideDown();
      return repos[repo_name] = 'ERROR';
    } else {
      return handle_data(repo_name, data);
    }
  };

  handle_data = function(repo_name, data) {
    var d;
    repos[repo_name] = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        d = data[_i];
        _results.push(new Fork(d));
      }
      return _results;
    })();
    draw_table(repo_name);
    return draw_chart(repo_name);
  };

  update_data = function(repo_name) {
    current_repo = repo_name;
    if (repos[repo_name]) {
      if (repos[repo_name] !== 'ERROR') {
        draw_table(repo_name);
        return draw_chart(repo_name);
      }
    } else {
      return get_data(repo_name);
    }
  };

  $(window).on('load', function() {
    var repo_name;
    repo_name = $('#repo_name');
    repo_name.on('focus', function() {
      if (!repo_name.active) {
        repo_name.active = true;
        return repo_name.val('').css("color", "black");
      }
    });
    return chart = new BubbleChart("chart", "age", "forks", "watchers");
  });

  $(window).on('load hashchange', function() {
    var repo_name;
    repo_name = window.location.hash.slice(1);
    if (repo_name) {
      update_data(repo_name);
      $('#repo_name').val(repo_name).css("color", "black");
    }
    return $('#find_forks').click(function() {
      var repo;
      repo = $('#repo_name').val();
      if (repo.substring(0, 4) === "e.g.") {
        repo = 'jquery/jquery';
      }
      return window.location.hash = '#' + repo;
    });
  });

  $(window).on('resize', function() {
    return draw_chart();
  });

  draw_chart = function(repo_name) {
    var error;
    error = $("#error");
    if (error.is(":visible")) {
      error.slideUp();
    }
    repo_name = repo_name || current_repo;
    chart.setData(repos[repo_name]);
    return chart.drawBubbles();
  };

}).call(this);
