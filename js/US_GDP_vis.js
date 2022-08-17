window.addEventListener("DOMContentLoaded", () => {
    var winHeight = 0, 
		winWidth = 0, 
		timeout = false, 
		delay = 350;

    var actualData,
        dater;
    var height = 450,
        width = 600;

    var padding = (height/3)*0.1;

function setCoreDimensions(){
		winHeight = window.innerHeight;
		winWidth = window.innerWidth;
		console.log("Window height: " + winHeight);
		console.log("Window width: " + winWidth);
}

var tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);

/*This function exists for responsiveness reasons*/
window.addEventListener('resize', () => {
	/*Preventing excessive calls on resize from lagging the view on window resize due to any factor*/
		clearTimeout(timeout);
	
		timeout = setTimeout(setCoreDimensions, delay)
});

/*Changes bar graph to be vertical and have year 
 * values on Y and amount on X useful for when height 
 * is more than width like in mobile phones*/

function changeOrientation(){
	return 0;
}

/* Fetching JSON data for the graph*/
fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
    .then(function(response){
        if(!response.ok){
            console.log("There was an issue with the response: " + response.status + " " + response.statusText);
        } 
        return response.json();
    })
    .then(function(d){
        dater = d;
        actualData = dater.data;
        initSvg();
    })
    .catch(function(err){
        dater = "Unfortunately there was an error";
        return dater;
    });

const initSvg = () => {


let sourceText = document.getElementById("sourceText");
    sourceText.innerHTML = "<strong>Source: </strong>" 
                            + dater.source_name
                            + " "
                            + "<a href='" + dater.display_url + "'>" 
                            + "(" + dater.display_url + ")"  + "</a>";

    
    console.log("Entered initSvg");

    /* the extra 1 in data length helps in the elimination of the moire pattern
     * on the chart */
    let barWidth =  (width-padding*6)/actualData.map(d=>d[0]).length+1;

/*initialising SVG*/
const svg = d3.select("#visHolder")
              .append("svg")
              .attr("preserveAspectRatio", "xMinYMin meet")
              .attr("viewBox", '0 0 '+width+' '+height);

/*setting scales and axes*/
const xScale = d3.scaleTime()
    .domain(d3.extent(actualData, d => d[0])
        .map(item => new Date(item)))
    .range([padding*4, width-padding]);

const yScale = d3.scaleLinear()
    .domain([0,d3.max(actualData, d=> d[1])])
/*  This was causing inaccuracy in test */ 
    .range([ 0, height-(padding*3)]);


const yScaleAxis = d3.scaleLinear()
    .domain([0,d3.max(actualData, d=> d[1])])
    .range([ height-(padding*2), padding]);


const bandwidth = d3.scaleBand()
    .domain(actualData.map(d=> d[0]))
    .range([padding*4, width-padding+1]);

    console.log(bandwidth.step());

svg.selectAll("rect")
    .data(actualData)
    .enter()
    .append("rect")
    .attr("x", (d) => bandwidth(d[0]))
    .attr("y", (d) => ((height-padding*2)-yScale(d[1])))
    .attr("width", barWidth) 
    .attr("height", (d) => yScale(d[1]))
    .attr("class", "bar svgRect")
    .attr("data-date", (d)=> d[0])
    .attr("data-gdp", (d)=> d[1])
    .attr("fill", "navy")
    .on("mouseover", (e,d)=>{
        const[x,y] = d3.pointer(e, svg);
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0.9);
        tooltip
            .html("Date:<br/>" + d[0] + "<br/>" + "GDP: $" + d[1] + " B")
            .style("left", (x)+20+"px")
            .style("top", (y)+20+ "px");
            tooltip
            .attr("data-date", d[0]);
        })
        .on("mouseout", (e,d)=>{
            tooltip
            .transition()
            .duration(400)
            .style("opacity", 0);
        });
    
var xAxis = d3.axisBottom().scale(xScale);

    svg
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", "translate(0,"+(height-padding*1.5)+")");

var yAxis = d3.axisLeft().scale(yScaleAxis);

    svg
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", "translate("+padding*3.5+","+0+")");

    
}

});


