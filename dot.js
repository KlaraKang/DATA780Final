// EventListener for Page Transition Effecct
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
const width = window.innerWidth*.8,
height = window.innerHeight*.65,
margin = {top: 20, bottom: 40, left:50, right:30},
radius = 2.5;

// global empty variables
let xScale, yScale, colorScale;
let svg, tooltip, legend;

/* APPLICATION STATE */
let state = {
data: [],  
hover: null,
selection: "All" //default selection
};

/* LOAD DATA */
// DATA PATH
d3.csv("./Dataset/PovertyDeath.csv", d => {
    return {
    PovertyRate: +d.PovertyRate,
    Intent: d.Intent,
    Deaths: +d.Deaths,
    Year: d.Year,
    County: d.County
    }
}).then(raw_data => {

    // save the summed data to application state
    state.data = raw_data;

    state.data.forEach((d,i) => {d.id = i+1;});
    console.log("state", state.data)
    init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
// SCALES
    xScale = d3.scaleLinear()
          .domain(d3.extent(state.data, d =>d.PovertyRate)) //extent gets min and max at the same time.
          .range([margin.left, width-margin.right])          
        //  .nice()

    yScale = d3.scaleLinear()
          .domain(d3.extent(state.data, d=>d.Deaths))
          .range([height-margin.bottom, margin.top])

    colorScale = d3.scaleOrdinal().domain(["Assault","Suicide"])
            .range(["red","#58FAF4"])

    // AXES
    const xAxis = d3.axisBottom(xScale).ticks(20).tickFormat(d=>d3.format(".1f")(d))
    const yAxis = d3.axisLeft(yScale)

    // UI ELEMENT SETUP
    /*manual drop-down menu */
    const selectElement = d3.select("#dropdown")

    selectElement.selectAll("option") // "option" is a HTML element
            .data(["All",
                  ...new Set(state.data.map(d => d.Intent).sort(d3.ascending))]) 
            .join("option")
            .attr("value", d => d) // what's on the data
            .text(d=> d) // what user can see

    /* set up event listener to filter data based on dropdown menu selection*/
    selectElement.on("change", event => {
    state.selection = event.target.value
    draw();
    });

    // SVG ELEMENT
    const container = d3.select("#container")
                      .style("position","relative");

    svg = container.append("svg")
      .attr("width", width)
      .attr("height", height)

    tooltip = container.append("div")
      .attr("class", "tooltip")
      .style("visibility", "hidden")

    legend = d3.select("#container").append("svg")
      .attr("width", width*0.2)
      .attr("height", height*0.8)
      .attr("transform", `translate(${0},${margin.top-margin.bottom})`)

    // CALL AXES to draw Axis lines
    const xAxisGroup = svg.append("g")
    .attr("class","xAxis")
    .attr("transform", `translate(${0},${height-margin.bottom})`)
    .call(xAxis)
    .append("text")
        .attr("y", margin.bottom)
        .attr("x", width/2)
        .attr("fill", "#fff")
        .attr("font-size","14px")
        .attr("text-anchor", "middle")
        .text("<Poverty Rates, %>"); 

    const yAxisGroup = svg.append("g")
    .attr("class","yAxis")
    .attr("transform", `translate(${margin.left},${0})`)
    .call(yAxis)
    .append("text")
        .attr("y", margin.top-5)
        .attr("x", margin.left-30)
        .attr("fill", "#fff")
        .attr("font-size","14px")
        .attr("text-anchor", "middle")
        .text("<Gun Death>"); 

    draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this every time there is an update to the data/state
function draw() {

    // FILTER DATA BASED ON STATE
    const filteredData = state.data
    .filter(d => state.selection === "All" || 
                  state.selection === d.Intent)
    console.log(filteredData)

    svg.selectAll("circle.dot")
    .data(filteredData, d=>d.id) // to match data to unique id
    .attr("id", (d,i)=>i)
    .join(
    // HANDLE ENTER SELECTION
    enter => enter
    .append("circle")
    .attr("class","dot")      
    .attr("r", radius)
    .attr("cx", d=> xScale(d.PovertyRate))
    .attr("cy", 0)
    .attr("fill", "black")
      .on("mouseover", function(event, d, i){
        tooltip
          .html(`<div>${d.County}</div>
                <div>Year: ${d.Year}</div>
                <div>${d.Deaths} deaths</div>
                <div>by ${d.Intent}</div>`)
          .style("visibility", "visible")
      })
      .on("mousemove", function(event){
        tooltip
          .style("top", event.pageY - 160 + "px")
          .style("left", event.pageX + 0 + "px")
      })
      .on("mouseout", function(event, d) {
        tooltip
          .html(``)
          .style("visibility", "hidden");
      })
    .call(
      enter => enter
      .transition()
      .delay((d,i) => i*3)
      .duration(1000)
      .attr("r", radius*1.5)
      .attr("cy", d => yScale(d.Deaths))
      .attr("fill", d => colorScale(d.Intent))
      .style("stroke", "#000")      
      .attr("opacity", 0.7)
      )
    ,
    // HANDLE UPDATE SELECTION
    update => update,

    // HANDLE EXIT SELECTION
    exit => exit
      .transition()
      .duration(500)
     // .delay(150)
      .attr("cy", height)
      .remove("dot")
    ) 
    const legendNames = ["Assault","Suicide"]
    //legend
    
    legend.selectAll(".legend")
          .data(legendNames) 
          .enter()         
          .append("circle") 
            .attr("r", 7)
            .attr("cx", 25)
            .attr("cy",(d,i)=>100+i*25)
            .style("stroke","none")
            .style("fill",colorScale);

    legend.selectAll(".label")
          .data(legendNames)
          .enter()
          .append("text")              
              .attr("x",40)
              .attr("y", (d,i)=>107+i*25)
              .text(d=>d)
              .style("fill", colorScale)
              .style("font-size","11px")
              .attr("text-anchor","left")              
              .style("alignment-baseline", "middle")
};