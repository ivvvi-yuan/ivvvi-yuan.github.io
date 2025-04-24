// Global objects go here (outside of any functions)
const margin = {top: 5, right: 20, bottom: 20, left: 50};
const width = 500 - margin.left - margin.right;
const height = 200 - margin.top - margin.bottom;

const svg = d3.select('#chart').append('svg')
                .attr('width', 500)
                .attr('height', 120)
                .append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`);


const dispatcher = d3.dispatch('filterCategories');


let difficultyFilter = [];

/**
 * Load data from CSV file asynchronously and render charts
 */
let data, scatterplot, barchart; 


d3.csv('data/vancouver_trails.csv')
   .then(_data => {
     data = _data; // for safety, so that we use a local copy of data.

     // ... data preprocessing etc. ... TODO: you add code here for numeric
     // Be sure to examine your data to fully understand the code
     console.log(data);
     data.forEach(d => {
          d.time = +d.time;
          d.distance = +d.distance;
        })
     console.log(data);


     // Initialize scale
     // TODO: add an ordinal scale for the difficulty
     // See Lab 4 for help
     const diffLevel = data.map(d => d.difficulty);
     
     const colorScale = d3.scaleOrdinal()
                            .domain(['Easy', 'Intermediate', 'Difficult'])
                            .range(['palegreen', 'mediumseagreen', 'green']);
        
     scatterplot = new Scatterplot({parentElement: "#scatterplot", colorScale: colorScale}, data); //we will update config soon
     scatterplot.updateVis();

     barchart = new Barchart({parentElement: "#barchart", colorScale: colorScale}, dispatcher, data);
     barchart.updateVis();
   })
  .catch(error => console.error(error));



/**
 * Use bar chart as filter and update scatter plot accordingly
 */
dispatcher.on('filterCategories', selectedCategories => {
	if (selectedCategories.length == 0) {
		scatterplot.data = data;
	} else {
		scatterplot.data = data.filter(d => selectedCategories.includes(d.difficulty));
	}
	scatterplot.updateVis();
});
