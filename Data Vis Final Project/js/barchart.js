class StackedBarChart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 800,
      containerHeight: 500,
      margin: {top: 40, right: 40, bottom: 60, left: 60},
      //displayType: ['total']//TODO
      xTitle: "Continent",
      yTitle: "Street Food Count"
    }
    this.data = _data;
    this.currentCategories = []; // Track current categories for legend
    this.tooltip = d3.select('#barchart').append('div')
      .attr('class', 'tooltipbar')
      .style('opacity', 0);
    this.initVis();
  }
  
  /**
   * Initialize scales/axes and append static chart elements
   */
  initVis() {
    let vis = this;
    console.log(vis.data);

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.xScale = d3.scaleBand()
        .range([0, vis.width])
        .paddingInner(0.2)
        .paddingOuter(0.2);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);
    
    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
                    .tickSizeOuter(0);
    vis.yAxis = d3.axisLeft(vis.yScale).ticks(6)
                    .tickSizeOuter(0);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
    
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    // Append legend group
    vis.legend = vis.chart.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${vis.width - 150}, 0)`);

    vis.verTitle = vis.chart.append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - vis.config.margin.left + 10)
        .attr("x", 0 - (vis.height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(vis.config.yTitle);

    // Add X-axis title
    vis.horTitle = vis.chart.append("text")
        .attr("class", "axis-title")
        .attr("x", vis.width / 2)
        .attr("y", vis.height + vis.config.margin.bottom - 30)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(vis.config.xTitle);

    // Initialize stack generator and specify the categories or layers
    // that we want to show in the chart
    console.log(vis.containerHeight);
    vis.stack = d3.stack()
        .keys(d=>
              {if (document.getElementById("food-category").value == "hot-cold"){
              console.log(document.getElementById("food-category").value);
                return ['hot', 'cold'];
                } else if(document.getElementById("food-category").value == "total"){
                  console.log(document.getElementById("food-category").value);
                  return ['total'];
                } else {
                  return ['mainCourse', 'sideDish', 'snacks', 'dessert','drink'];
                }});
    vis.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    console.log(vis.data);

    // Determine which categories to show based on dropdown
    const categoryType = d3.select('#food-category').property('value');
    
    if (categoryType == "hot-cold") {
      vis.currentCategories = ['cold', 'hot'];
    } else if (categoryType == "total") {
      vis.currentCategories = ['total'];
    } else {
      vis.currentCategories = ['drink', 'dessert', 'snacks', 'sideDish', 'mainCourse'];
    }

    vis.xValue = d=>d.continent;
    vis.yValue = d=>d.total;

    vis.xScale.domain(vis.data.map(vis.xValue));
    vis.yScale.domain([0, d3.max(vis.data, vis.yValue)]);

    const stackData = data.map(row => {
      return {
        continent: row.continent,
        total: row.total, 
        hot: +row.hot,
        cold: +row.cold,
        mainCourse: +row.mainCourse,
        sideDish: +row.sideDish,
        snacks: +row.snacks,
        dessert: +row.dessert,
        drink: +row.drink
      };
    });
    
    // Initialize stack generator with current categories
    //vis.stack = d3.stack().keys(vis.currentCategories);
    vis.stackedData = vis.stack(stackData);
    /*// Call stack generator on the dataset
    vis.stackedData = vis.stack(stackData);*/
    //console.log(vis.stackedData);
    vis.renderVis();
  }

  /**
   * This function contains the D3 code for binding data to visual elements
   * Important: the chart is not interactive yet and renderVis() is intended
   * to be called only once; otherwise new psaths would be added on top
   */
  renderVis() {
    let vis = this;
    // Clear previous bars and legend
    vis.chart.selectAll('.category').remove();
    vis.legend.selectAll('*').remove();

    vis.chart.selectAll('category')
        .data(vis.stackedData)
      .join('g')
        .attr('class', d => `category cat-${d.key}`)
      .selectAll('rect')
        .data(d => d)
      .join('rect')
        .attr('x', d => vis.xScale(d.data.continent)/*vis.xScale(vis.xValue(d))*/)
        .attr('y', d => vis.yScale(d[1]))
        .attr('height', d => vis.yScale(d[0])-vis.yScale(d[1]))
        .attr('width', vis.xScale.bandwidth());
      
    // Update the axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
    console.log(vis.currentCategories);
    // Draw legend
    var legendItems = vis.legend.selectAll('.legend-item')
      .data(vis.currentCategories)
      .join('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 25})`);

    legendItems.append('rect')
      .attr('width', 70)
      .attr('height', 15)
      .attr('fill', d => {
        if (d == 'mainCourse') return '#7a3908';
        if (d == 'sideDish') return '#fffb00';
        if (d == 'hot') return '#c93623';
        if (d == 'cold') return '#85d0f3';
        if (d == 'total') return '#6f7580';
        if (d == 'snacks') return '#3fe861fe';
        if (d == 'drink') return '#62d1f9';
        else return '#fd79b3';
      })
      .attr('class', d => {
        console.log(`cat-${d} rect`)
        return `cat-${d} rect`});

    legendItems.append('text')
      .attr('x', 75)
      .attr('y', 7)
      .style('fill', 'black')
      .attr('dy', '0.35em')
      .text(d => {
        // Format the text for display
        if (d == 'mainCourse') return 'Main Course';
        if (d == 'sideDish') return 'Side Dish';
        return d.charAt(0).toUpperCase() + d.slice(1); // Capitalize first letter
      });
    
    // Add tooltip interactions to each rectangle
    vis.chart.selectAll('rect')
      .on('mouseover', function(event, d) {
        const [x, y] = d3.pointer(event, vis.chart.node());
        const category = d3.select(this.parentNode).datum().key;
        const value = d[1] - d[0];
        const continent = d.data.continent;
        
        vis.tooltip
          .style('opacity', 1)
          .html(`
            <div><strong>${continent}</strong></div>
            <div>${formatCategoryName(category)}: ${value}</div>
            <div>Total: ${d.data.total}</div>
          `)
          .style('left', `${x + vis.config.margin.left - 30}px`)
          .style('top', `${y + vis.config.margin.top - 10}px`);
        
        // Highlight the segment
        d3.select(this).style('opacity', 0.8);
      })
      .on('mousemove', function(event) {
        const [x, y] = d3.pointer(event, vis.chart.node());
        vis.tooltip
          .style('left', `${x + vis.config.margin.left + 10}px`)
          .style('top', `${y + vis.config.margin.top - 10}px`);
      })
      .on('mouseout', function() {
        vis.tooltip.style('opacity', 0);
        d3.select(this).style('opacity', 1);
      });

    // Helper function to format category names
    function formatCategoryName(category) {
      const names = {
        'hot': 'Hot Food',
        'cold': 'Cold Food',
        'mainCourse': 'Main Course',
        'sideDish': 'Side Dish',
        'snacks': 'Snacks',
        'dessert': 'Dessert',
        'drink': 'Drink',
        'total': 'Total'
      };
      return names[category] || category;
    }
  }
}
