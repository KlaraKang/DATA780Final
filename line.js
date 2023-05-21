// Event Listener for Page Transition Effecct
window.transitionToPage = function(href) {
  document.querySelector('body').style.opacity = 0
  setTimeout(function() { 
      window.location.href = href
  }, 500)
}

document.addEventListener('DOMContentLoaded', function(event) {
  document.querySelector('body').style.opacity = 1
})

// chart
const margin = {top: 50, right: 50, bottom: 50, left: 70},
      width = window.innerWidth * .9,
      height = window.innerHeight * .6;

  let svg, tooltip;
  let xScale, yScale, colorScale;
  let xAxis, yAxis;
  let xAxisGroup, yAxisGroup;
  let lineGen;
  let intent, byIntent;

  /* LOAD DATA */
  d3.csv('./Dataset/MonthlyByIntent.csv', d => {
    return {
      Date: new Date(d.Date),
      Assault: +d.Assault,
      Suicide: +d.Suicide,
      Accident: +d.Accident,
      Unknown: +d.Unknown
    }
  })
    .then(data => {      
      intent = data.columns.slice(1).map(function(id) {
        return {
          id: id,
          values: data.map(function(d) {
            return {date: d.Date, death: +d[id] };
          })
        };
      });
    console.log(intent)
    console.log(data)

    // SCALES
    xScale = d3.scaleTime()
            .domain(d3.extent(data, d=>d.Date))
            .range([margin.left, width - margin.left - margin.right])
    
    yScale = d3.scaleLinear()
            .domain([d3.min(intent, d=>d3.min(d.values, i=>i.death)), 
                     d3.max(intent, d=> d3.max(d.values, i=>i.death))])
            .range([height - margin.top - margin.bottom, margin.bottom])
    
    colorScale = d3.scaleOrdinal()
                   .domain(intent.map(d=>d.id))
                   .range(["orange", "#58FAF4", "red", "gray"])

    // AXES
    xAxis = d3.axisBottom(xScale)
            .ticks(20)

    yAxis = d3.axisLeft(yScale)
            .ticks(20)

    // CREATE SVG ELEMENT 
    const container = d3.select("#container")
                    .style("position","relative");

    svg = container.append("svg")
          .attr("width", width)
          .attr("height", height) 

    g = svg.append("g")
           .attr("transform", `translate(${0}, ${margin.top})`);      

    // CALL AXES
    g.append("g")
            .attr("class","xAxis")
            .attr("transform", `translate(${0},${height-margin.top-margin.bottom})`)
            .call(xAxis)
            .append("text")
              .attr("y", margin.bottom)
              .attr("x", width/2)
              .attr("text-anchor", "end")
              .attr("fill","#fff")
              .style("font-size", "14px")
              .text("<Year>");  

    g.append("g")
            .attr("class","yAxis")
            .attr("transform", `translate(${margin.left},${0})`)
            .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", -50)
              .attr("text-anchor", "end")
              .attr("fill","#fff")
              .style("font-size", "14px")
              .text("<Death>");  

    // LINE GENERATOR FUNCTION
    lineGen = d3.line()
                .curve(d3.curveBasis)
                .x(d => xScale(d.date))
                .y(d => yScale(d.death))          

    // DRAW LINES
    byIntent = g.selectAll(".intent")
              .data(intent)
              .enter()
                .append("g")
                .attr("class", "intent")
                
    byIntent.append("path")
            .attr("class","line")
            .attr("d", d => lineGen(d.values))
            .style("stroke", d => colorScale(d.id))
            .call(enter => enter
              .transition()
                .duration(9500)
                .attrTween("stroke-dasharray", function(){
                  const l = this.getTotalLength(),
                    i = d3.interpolateString("0,"+l, l+","+l);
                    return function(t){return i(t)};
                })
                .on("end", ()=>{d3.select(this).transition();})
              );   

    // ADD LINE LABEL -- MAKE THEM ENTER FROM RIGHT
    byIntent.append("text")            
            .datum(function(d) {return {id: d.id, value: d.values[d.values.length -1]};})
            .call(
              enter => enter
              .transition()
                //.delay(7000)
                .duration(9000)
                .attr("transform", function(d) { 
                      return "translate(" + xScale(d.value.date) + "," + yScale(d.value.death) + ")"; 
                      })
                .attr("x", margin.right-30)
                .attr("dy", "0.5em")
                .style("font", "14px sans-serif")
                .style("fill", d => colorScale(d.id))
                .text(function(d) { return d.id; })            
            );

    

});