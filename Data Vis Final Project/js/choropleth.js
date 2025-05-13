
  

class ChoroplethMap {

    constructor(_config) {
      this.config = {
        parentElement : _config.parentElement,
        topoJSON      : _config.topoJSON,
        data          : _config.data,      // [{code:"USA", total:123, …}, …]
        width         : 960,
        height        : 550,
        margin        : { t:0, r:0, b:0, l:0 }
      };
      this.data = _config.data;
      this.initVis();
    }
  
    initVis() {
      const { width, height } = this.config;
      this.svg = d3.select(this.config.parentElement)
                   .append('svg')
                   .attr('width',  width)
                   .attr('height', height);
  
      this.g = this.svg.append('g');
  
      this.projection = d3.geoNaturalEarth1()
                          .scale(width / 6.4)
                          .translate([width/2, height/2]);
  
      this.path = d3.geoPath().projection(this.projection);
  
      // Tooltip div (can reuse a global one if you already made it)
      this.tooltip = d3.select('body')
                       .append('div')
                       .attr('class', 'tooltip')
                       .attr('width', '150px');
    }
  

    /** Join data → geometry and draw */
    updateVis() {
      const { topoJSON, data } = this.config;

      /* helper */
    function makeHTML(country, foods) {
        if (!foods) {                       // no entry → “No data”
        return `<strong>${country}</strong><br><em>No data</em>`;
        }
    
        // keep only food names, or append rank if you like
        const list = foods
            .sort((a,b) => d3.ascending(a.rank, b.rank))      // optional
            .map(d => `${d.food} <span style="opacity:.6">(rank ${d.rank})</span>`)
            .join('<br>');   // bullet list → one per line
    
        return `<strong>${country}</strong><br><u>Food:</u><br>${list}`;
    }

      function showTip(evt, d, fromFocus = false){
        // get the foods array you rolled up earlier
        const foods = valueByCode.get(d.id);
      
        // build tooltip HTML
        const html = makeHTML(d.properties.name, foods);   // same helper as before
      
        // Co-ordinates: mouse gives pageX/pageY; focus doesn’t,
        // so we fall back to element’s bounding box centre.
        let x, y;
        if(fromFocus){
          const box = evt.currentTarget.getBoundingClientRect();
          x = box.x + box.width / 2 + window.scrollX;
          y = box.y + box.height / 2 + window.scrollY;
        } else {
          x = evt.pageX; y = evt.pageY;
        }
      
        self.tooltip
            .html(html)
            .style('left',  `${x + 10}px`)
            .style('top',   `${y - 28}px`)
            .transition().duration(150)
            .style('opacity', 0.9);
      }
      
      function hideTip(){
        self.tooltip.transition().duration(300).style('opacity', 0);
      }

      // Fast look-ups
    const valueByCode = d3.rollup(
        this.data,                                    
        v => v.map(d => ({ food: d.food, rank: d.rank })), 
        d => d.iso_n3 );
    console.log("Mapped: ", valueByCode);

      const colourByCode = new Map(
        data.map(d => [d.iso_n3, d3.interpolateRainbow(Math.random())])
      );
  
      // Convert TopoJSON → GeoJSON once
      const countries = topojson.feature(
          topoJSON, topoJSON.objects.countries).features;
  
      // ----- DRAW -----
      const self = this;
      this.countries = this.g
        .selectAll('path.country')
        .data(countries, d => d.id)          // d.id == ISO-3 code in world-atlas
        .join('path')
          .attr('class', 'country')
          .attr('d', this.path)
          .attr('fill', d => colourByCode.get(d.id) ?? '#e0e0e0')
          .attr('stroke', '#888')
          .on('mouseover', (event, d) => {
            const foods = valueByCode.get(d.id);        // array [{food, rank}, …] or undefined
            this.tooltip
                .html( makeHTML(d.properties.name, foods) )  // ← formatted
                .style('left', `${event.pageX+10}px`)
                .style('top',  `${event.pageY-28}px`)
                .transition().duration(150).style('opacity', 0.9);
          })
          .on('mouseout', () =>
            self.tooltip.transition().duration(300).style('opacity',0));

    this.g.selectAll('path.country')
        .data(countries, d => d.id)
    .join('path')
        .attr('class', 'country')
        .attr('d', this.path)
        .attr('fill', d => colourByCode.get(d.id) ?? '#e0e0e0')
        .attr('stroke', '#888')
    
         /* ── keyboard accessibility ───────────────────────────── */
          .attr('tabindex', 0)                               // ← now tabbable
          .attr('role', 'img')
          .attr('aria-label', d =>
              `${d.properties.name}. Press Enter or Space for details.`)
      
         /* ── existing mouse interactions (keep yours) ─────────── */
          .on('mouseover', (event, d) => showTip(event, d))
          .on('mouseout',  hideTip)
      
         /* ── keyboard equivalents ─────────────────────────────── */
          .on('focus',  (event, d) =>   // tab-focus behaves like mouseover
              showTip(event, d, /*fromFocus=*/true))
          .on('blur',   hideTip)
          .on('keydown', (event, d) => {
              if (event.key === 'Enter' || event.key === ' ') {
                  // optional: treat as a click if you have one
              }
          });
    }
  }
  