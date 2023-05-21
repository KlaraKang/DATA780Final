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
height = window.innerHeight*.7,
margin = {top:20, bottom:20, left:20, right:20};

let radius = (Math.min(width, height)/2)-10;
let data, arcGen, mouseArc, legendArc, colorSeq, colors;

d3.csv('./Dataset/GIRA.csv', d3.autoType)
.then(rawdata => {
  
  // sum by groups and sub-groups
  let data1 = Array.from(d3.rollups(rawdata, v=>d3.sum(v, d=>d.Deaths),
                                 d=>d.Intent, d=>d.Gender, d=>d.Age, d=>d.Race),
                                 ([key1, value1])=>({key:key1, children:value1
                                  .map(([key2, value2])=>({key:key2, children:value2
                                  .map(([key3, value3])=>({key:key3, children:value3
                                  .map(([key4, value4])=>({key:key4, value:value4
                                  }))}))}))}))
  data = {"key": "Profile", "children":data1}
  
  colorSeq = d3.scaleSequential(d3.interpolatePurples).domain([10, 19000]);
  colors = {
    "Accident":"orange",
    "undetermined":"gray",
    "Assault":"red",
    "Suicide":"#58FAF4",
    "Male":"#2E64FE",
    "Female":"hotpink",
    "Black or African American":"darkred",
    "American Indian or Alaska Native":"#3288bd",
    "Asian":"#fc8d59",
    "White":"#99d594",
    "More than one race":"#fee08b",
    "Age":"#8258FA"
  }           

  arcGen = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => Math.sqrt(d.y0))
            .outerRadius(d => Math.sqrt(d.y1)-1);

  mouseArc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => Math.sqrt(d.y0))
            .outerRadius(radius);
  
  // CREATE SVG ELEMENT
  const svg = d3.select("#container")
          .append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", `translate(${width/2},${height/2})`)
          
  const label = svg.append("text")
                  .attr("text-anchor", "middle")
                  .attr("fill", "#fff")
                  .style("visibility", "hidden");

  const legend = d3.select("#container")
                   .append("svg")
                   .attr("width", width*0.2)
                   .attr("height", height*0.8)

  // CENTER LABEL ELEMENT
  label.append("tspan")
        .attr("class", "percentage")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", "-0.1em")
        .attr("font-size", "2em")
        .style("stroke", "white")
        .text("");

  label.append("tspan")
        .attr("class", "profile")
        .attr("x", 0)
        .attr("y", 20)
        .attr("dy", "-0.1em")
        .attr("font-size", "12px")
        .style("fill", "white")
        .text("");

  // Find the root node
  let root = d3.hierarchy(data)
           .sum(d=> d.value)
      //     .sort((a,b) => b.value - a.value);       
 
  // organize the data into the sunburst pattern for a hierarchcial viz
  let partition = d3.partition().size([2*Math.PI, radius*radius]);  
  
  partition(root);

  const totalSize = root.descendants()[0].value;

  const path = svg
        .selectAll("path")
        .data(partition(root).descendants().slice(1))
        .join("path")
        .attr("d", arcGen)
        .attr("stroke", "none")
        .attr("fill", function(d){
          if(d.depth ===3){
            return colorSeq(d.value);
          } else {
            return colors[d.data.key];
          }
        })

  svg.append("g")
      .attr("fill","none")
      .attr("pointer-events", "all")
      .on("mouseleave", ()=>{
        path.attr("fill-opacity", 1);
        label.style("visibility", "hidden");
      })
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
      .attr("d", mouseArc)
      .on("mouseenter", (event, d)=>{
         const sequence = d.ancestors().reverse().slice(1);
         let seq = sequence.map(d=>d.data.key).join(", ");
         
         path.attr("fill-opacity", node=> sequence.indexOf(node) >=0 ? 1.0: 0.3);
         const percentage = (100 * d.value / totalSize).toPrecision(3)+"%";
         label.style("visibility", "visible")
              .select(".percentage")
              .text(`${percentage}`)
         label.select(".profile")
              .text(`by ${seq}`)             
      })

  let size = 15, space = 6, offset = 20;
  let legendNames = d3.keys(colors);
  let legendColors = d3.values(colors); 
//  console.log(legendNames)
  console.log([colors])

  let legendColor = d3.scaleOrdinal()
                  .domain(legendNames)
                  .range(legendColors)                
    
  legend.selectAll("svg").data(legendNames)
        .enter()
        .append("g")
        .append("rect")
        .attr("class","legend")
        .attr("width", size)
        .attr("height", size)
        .style("fill", legendColor)
        .attr("transform", (d, i) => {
              return `translate(${0},${offset+ (size+space)*i})` 
        })
        
  legend.selectAll("g").append("text")
          .attr("transform", (d, i) => {
            return `translate(${size+5},${offset+ (size+space)*i+13})` 
      })
        .text(d => d)
        .attr("stroke","none")
        .style("fill",legendColor)
        .style("font-size", "11px")
        .attr("text-anchor", "left")

  
})
