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
      height = window.innerHeight*.6,
      margin = {top:0, bottom:0, left:20, right:20};

let angleGen, arcGen;
let w = 300, h = 300,
    outerRadius = w/2,
    innerRadius = 100;
let legendRectSize = 15,
    legendSpacing = 7,
    legendHeight = legendRectSize + legendSpacing;
let myData1, myData2;
let colorScale;
let svg1, svg2, legend1, legend2;

/* APPLICATION STATE */
let state = {
    data: [], 
    hover: null,
    selection: "All" //default selection
};

d3.csv('./Dataset/AgeIntent.csv', d3.autoType)
  .then(rawdata => {
    
  // group and sum the data
    let Grp = d3.flatRollup(rawdata, v=>d3.sum(v, d=>d.Death), 
                                      d=>d.Age, d=>d.Intent)
    let sums_Grp = Grp.map(([Age, Intent, Death]) =>({Age, Intent, Death}))
   
   state.data = sums_Grp;
   init();
  })

function init(){

  angleGen = d3.pie()
            .startAngle(0)
            .endAngle(2*Math.PI)
            .value(d=> +d.Death)
            .sort(null)
            .padAngle(.02);
 
  colorScale = d3.scaleOrdinal()
                .domain(["Accident","Assault","Suicide","Unspecified"])
                .range(["orange","red","#58FAF4","gray"]);

  arcGen = d3.arc()  
          .outerRadius(outerRadius)
          .innerRadius(innerRadius);
        
  svg1 = d3.select("#chart")
        .append("svg")
          .attr("width", width/2)
          .attr("height", height)
        .append("g")
         .attr("transform",`translate(${width/4},${height/2})`);

  svg2 = d3.select("#chart")
         .append("svg")
           .attr("width", width/2)
           .attr("height", height)
         .append("g")
          .attr("transform",`translate(${width/4+margin.right},${height/2})`);

  // manual drop-down menu for year selection
  const selectElement1 = d3.select("#dropdown1")
  const selectElement2 = d3.select("#dropdown2")
  // reordering selection menu array
  Array.prototype.move = function (from, to) {
      this.splice(to, 0, this.splice(from, 1)[0]);
  };

  let elementArr = [...new Set(state.data.map(d => d.Age).sort(d3.ascending))]
      elementArr.move(10,0);
      elementArr.move(6,2);

  selectElement1.selectAll("option") // "option" is a HTML element
                .data(elementArr)//
                .join("option")
                .attr("value", d => d) // what's on the data
                .text(d=> d) // what users can see

  selectElement2.selectAll("option") // "option" is a HTML element
                .data(elementArr)//
                .join("option")
                .attr("value", d => d) // what's on the data
                .text(d=> d) // what users can see
    
  // set up event listener to filter data based on dropdown menu selection
  selectElement1.on("change", event => {
      state.selection = event.target.value
      draw1(); 
  });

  selectElement2.on("change", event => {
    state.selection = event.target.value
    draw2(); 
  });

    draw1();
    draw2();  
}

// DRAW FUNCTION 
function draw1() {
      
  const filteredData1 = state.data
         .filter(d => state.selection === d.Age)

  myData1 = angleGen(filteredData1); 

  svg1.selectAll("path.arc")
      .data(myData1, d=>d.id)
      .join(
        enter=>enter
          .append("path")
          .attr("d", d=>arcGen(d))
          .attr("fill", d=>colorScale(d.data.Intent))
          .attr("stroke", "none")
          .attr("stroke-width", 1)
          .call(
            enter => enter
              .transition()              
              .ease(d3.easeCircle)
              .duration(1000)
              .attrTween("d", function(d) {
                let interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d)                
                return t => arcGen(interpolate(t));
                })
            ),
            // + HANDLE UPDATE SELECTION
            update => update
            ,
            // + HANDLE EXIT SELECTION
            exit => exit
            .transition()
            .attrTween("d", d=>d.null) // NOT SURE!!!!! 
            .remove("path")  
        ) 
  
  let rest = function() {
     
    svg1.selectAll("text.newText")
        .data(myData1, d=>d.id)
        .join(
            enter=>enter
            .append("text")
            .attr("class","newText")
            .call (
                enter=>enter
                .transition()
                .duration(200)
                .attr("transform", d=>`translate(${arcGen.centroid(d)})`)
                .attr("dy", ".4em")
                .attr("text-anchor", "middle")
                .text(d=>((d.endAngle-d.startAngle)/(2*Math.PI)*100).toFixed(1)+"%")//)         
                .style("fill", "#190707")
                .style("font-size", "14px")
                .style("font-weight", "bold")
            ) ,
            update=>update
            ,
            exit => exit
            .transition()
            .duration(50)
            .attr("x", 0)
            .remove("newText")   
        )

    legend1 = svg1.selectAll(".legend")
              .data(myData1)
              .enter()          
              .append("g")
              .attr("class","legend")
              .attr("transform", (d,i) => `translate(-45,${((i*legendHeight)-40)})`) 

    legend1.append("rect")      
          .attr("width", legendRectSize)
          .attr("height", legendRectSize)
          .attr("rx", 5)
          .attr("ry", 5)
          .style("fill", colorScale)
          .style("stroke", colorScale)

    legend1.append("text")
          .attr("x", 30)
          .attr("y", 15)
          .text(d=> d.data.Intent)
          .style("fill", "#EFFBFB")
          .style("font-size", "14px")      
             
       } 
    setTimeout(rest,1000);    
};

function draw2() {
      
  const filteredData2 = state.data
         .filter(d => state.selection === d.Age)

  myData2 = angleGen(filteredData2); 

  svg2.selectAll("path.arc")
      .data(myData2, d=>d.id)
      .join(
        enter=>enter
          .append("path")
          .attr("d", d=>arcGen(d))
          .attr("fill", d=>colorScale(d.data.Intent))
          .attr("stroke", "none")
          .attr("stroke-width", 1)
          .call(
            enter => enter
              .transition()              
              .ease(d3.easeCircle)
              .duration(1000)
              .attrTween("d", function(d) {
                let interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d)                
                return t => arcGen(interpolate(t));
                })
            ),
            // + HANDLE UPDATE SELECTION
            update => update
            ,
            // + HANDLE EXIT SELECTION
            exit => exit
            .transition()
            .attrTween("d", d=>d.null) // NOT SURE!!!!! 
            .remove("path")  
        ) 
  
  let rest = function() {
     
    svg2.selectAll("text.newText")
        .data(myData2, d=>d.id)
        .join(
            enter=>enter
            .append("text")
            .attr("class","newText")
            .call (
                enter=>enter
                .transition()
                .duration(200)
                .attr("transform", d=>`translate(${arcGen.centroid(d)})`)
                .attr("dy", ".4em")
                .attr("text-anchor", "middle")
                .text(d=>((d.endAngle-d.startAngle)/(2*Math.PI)*100).toFixed(1)+"%")//)         
                .style("fill", "#190707")
                .style("font-size", "14px")
                .style("font-weight", "bold")
            ) ,
            update=>update
            ,
            exit => exit
            .transition()
            .duration(50)
            .attr("x", 0)
            .remove("newText")   
        )

    legend2 = svg2.selectAll(".legend")
              .data(myData2)
              .enter()          
              .append("g")
              .attr("class","legend")
              .attr("transform", (d,i) => `translate(-45,${((i*legendHeight)-40)})`) 

    legend2.append("rect")      
          .attr("width", legendRectSize)
          .attr("height", legendRectSize)
          .attr("rx", 5)
          .attr("ry", 5)
          .style("fill", colorScale)
          .style("stroke", colorScale)

    legend2.append("text")
          .attr("x", 30)
          .attr("y", 15)
          .text(d=> d.data.Intent)
          .style("fill", "#EFFBFB")
          .style("font-size", "14px")      
             
       } 
    setTimeout(rest,1000);    
};