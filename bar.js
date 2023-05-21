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

//Typewriter Effect
let messageArray = [" Gun-related death rates are higest in the young adults, 15 to 34 age groups. They are 42.2% of all gun deaths."]
        let textPosition = 0;
        let speed = 100; //in millisecond. lower number = higher speed
        typewriter = () => {
          document.querySelector("#message").
          innerHTML = messageArray[0].substring(0, textPosition) + "<span>\u25ae<span>";
          if(textPosition++ != messageArray[0].length)
          setTimeout(typewriter, speed);  
        }
        window.addEventListener("load", typewriter);

// chart
const width = window.innerWidth*.8,
      height = window.innerHeight*.65,
      margin = {top:20, bottom:50, left:100, right:70};

let xScale, yScale;
let yAxis, yAxisGroup;
let colorScale;
let svg, tooltip;

  /* APPLICATION STATE */
let state = {
    barData: [], 
    hover: null,
    selectYear: 2021 //default selection
};

  /* LOAD DATA */
d3.csv('./Dataset/AgeG.csv', d3.autoType)
  .then(rawdata => {
    // group and sum the data
    let sum = d3.flatRollup(rawdata, v=>d3.sum(v, d=>d.Death), 
                                d=>d.Age, d=>d.Year)
    sums_bar = sum.map(([Age, Year, Death])=>({Age, Year, Death}))

    // ADD "ID" VALUES TO "sums_bar"
    sums_bar.forEach((d,i) => {d.id = i+1;});
    
    // save the summed data to application state
    state.barData = sums_bar;   
    console.log(state.barData) 
   
    init();
  });          

  /* INITIALIZING FUNCTION */
  function init() {
    
    // xScale for Number of Deaths - linear
    xScale = d3.scaleLinear()
              .domain(d3.extent(state.barData, d=>d.Death))
              .range([margin.left, width-margin.right])
              
    // yScale for Age Group - categorical
    yScale = d3.scaleBand()
              .domain(state.barData.map(d=> d.Age))
              .range([margin.bottom, height-margin.top])
              .padding(.3)          

    // color scale for Bar Chart
    colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([10,10000]);
    /*
    colorScale = d3.scaleOrdinal().domain(state.barData.map(d=> d.Age))
                .range(["#FBF5EF","#F8ECE0","#F6E3CE","#F5D0A9","#F7BE81",
                          "#FAAC58","#FE9A2E","#FF8000","#DF7401","#B45F04","#FBF5EF"])*/
                /*.range(["#EAF2F8","#D4E6F1","#A9CCE3","#7FB3D5","#5499C7",
                          "#2980B9","#2471A3","#1F618D","#1A5276","#154360","#d9d9d9"]) */  

    // AXES 
    yAxis = d3.axisLeft(yScale)

    // CREATE SVG ELEMENT
    const container = d3.select("#container")
                      .style("position", "relative");

    svg = container
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .style("position", "relative");
  
    tooltip = container
          .append("div")
          .attr("class", "tooltip")
          .style("visibility", "hidden")

    // CALL AXES to draw Axis lines
    yAxisGroup = svg.append("g")
      .attr("class","yAxis")
      .attr("transform", `translate(${margin.left},${0})`)
      .call(yAxis)      

    // UI ELEMENT SETUP
    // manual drop-down menu for year selection
    const selectElement = d3.select("#dropdown")

    selectElement.selectAll("option") // "option" is a HTML element
                  .data(["Select Year",
                  ...new Set(state.barData.map(d => d.Year).sort(d3.descending))]) 
                  .join("option")
                  .attr("value", d => d) // what's on the data
                  .text(d=> d) // what users can see
    
    // set up event listener to filter data based on dropdown menu selection
    selectElement.on("change", event => {
      state.selectYear = +event.target.value
      draw(); 
      });

    draw();  
  }

  // DRAW FUNCTION 
  function draw() {
    // FILTER DATA BASED ON STATE
    const filteredData = state.barData
        .filter(d => state.selectYear === d.Year)
     //   .sort((a,b)=>d3.descending(a.Death, b.Death))
    console.log(filteredData)

    // UPDATE DOMAINS
    yScale.domain(filteredData.map(d=> d.Age))

    // UPDATE AXIS/AXES
    yAxisGroup
        .transition()
        .duration(500)
        .call(yAxis)
   
    svg.selectAll("rect.bar")
        .data(filteredData, d => d.id)
        .join(
        // + HANDLE ENTER SELECTION
        enter => enter
          .append("rect")
          .attr("class","bar")
          .attr("width", 0)
          .attr("height", yScale.bandwidth())
          .attr("x", margin.left)
          .attr("y", d=>yScale(d.Age))
          .attr("fill", d=>colorScale(d.Death))
            .on("mouseover", function(event, d, i){
                tooltip
                  .html(`<div>Age group: ${d.Age}</div>
                        <div>${d.Death} deaths</div>`)
                  .style("visibility", "visible")
              })
            .on("mousemove", function(event){
                tooltip
                  .style("top", event.pageY - 350  +"px")
                  .style("left", event.pageX + 100 + "px")
              })
            .on("mouseout", function(event, d) {
                tooltip
                  .html(``)
                  .style("visibility", "hidden");
              })
          .call(
            enter => enter
            .transition()
            .duration(500)
            .attr("width", (d,i)=> xScale(d.Death)-margin.left)
            .attr("fill", d=>colorScale(d.Death))
          )
          ,
          // + HANDLE UPDATE SELECTION
          update => update
          ,
          // + HANDLE EXIT SELECTION
          exit => exit
            .transition()
            .duration(50)
            .attr("x", xScale(0))
            .attr("width", 0)
            .remove("bar")  
        )   

    svg.selectAll("text.bar-label")
      .data(filteredData, d => d.id)
      .join(
        enter=>enter
          .append("text")
          .attr("class","bar-label")
          .text(d=>d.Death)
          .attr("y", (d, i) => yScale(d.Age)+yScale.bandwidth())
          .attr("x", d=>xScale(d.Death)+15)
          .attr("text-anchor", "middle+15")
          .style("stroke","#00FFFF")
          .style("fill","#00FFFF")
        ,
        update=>update
        ,
        exit => exit
        .transition()
        .duration(50)
        .attr("x", 0)
        .remove("bar-label")   
        )
    
  };