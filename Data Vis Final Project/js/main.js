let stackedBarChart, data
/**
 * Load data from food_arregated.csv
 */
d3.csv('data/food_aggregated-2.csv')
  .then(_data => {
    _data.forEach(d => {
      d.total = +d.total;
      d.hot = +d.hot;
      d.cold = +d.cold;
      d.mainCourse = +d.mainCourse;
      d.sideDish = +d.sideDish;
      d.snacks = +d.snacks;
      d.dessert = +d.dessert;
      d.drink = +d.drink;
    });
    data = _data;
    console.log("Read data: ", data);
    
    // Initialize charts
    stackedBarChart = new StackedBarChart({parentElement: '#barchart'}, data);
    
    // Show chart
    stackedBarChart.updateVis();
  })
  .catch(error => console.error(error));

/**
 * Select box event listener
 */
d3.select('#food-category').on('change', function() {
  // Get selected display type and update chart
  //stackedBarChart.config.displayType[0] = d3.select(this).property('value');
  //console.log(stackedBarChart.config.displayType);
  stackedBarChart.updateVis();
});

let choroplethMap;


Promise.all([

  d3.csv('data/food_iso.csv', d => ({
    iso_n3 : d.iso_n3.trim(),         
    food   : d.FoodName,
    rank  : +d.PopularityRank  
  })),

  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
])
.then(([rawMapData, worldTopo]) => {

  const mapData = rawMapData.filter(d => d.iso_n3);

  choroplethMap = new ChoroplethMap({
    parentElement : '.worldmap',
    topoJSON      : worldTopo,
    data          : mapData         
  });

  choroplethMap.updateVis();
  
})
.catch(err => console.error('Map-load error:', err));


