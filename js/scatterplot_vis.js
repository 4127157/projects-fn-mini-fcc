/*TODO: 1) Make formatting changes
 *      2) Make legend interactive by click
 *      3) Clean tooltip, make modern
 *      4) Clean up code
 *      */

window.addEventListener("DOMContentLoaded", () => {
    
    var visHolder = document.getElementById('visHolder');

    fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
        .then((response)=>{
            if(response.ok){
                response.json().then((data)=>{
                   initSvg(data); 
                });
            } else {
                console.log("There was a problem with the response: " 
                    + response.status 
                    + " " 
                    + response.statusText);
                visHolder.innerText = "There seems to be an error: "
                                    + response.status
                                    + " "
                                    + response.statusText;
            }
        })
        .catch((err)=>{
                console.log("There was a problem with the response: " + err);
                visHolder.innerText = "Sorry there seems to be an error: " 
                                    + err;
        });

    const initSvg = (data) => {

        const tooltip = d3
            .select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("opacity", 0);

        var height = 450,
            width = 600, 
            padding = (height/3)*0.1,
            rectHeight = height*0.03,
            rectWidth = width*0.03;
            
        const xScale = d3
            .scaleTime()
            .domain([d3.min(data, d => d.Year-1), d3.max(data, d => d.Year+1) ])
            .range([padding*2.5, width-padding*2])
            .nice();

        const xScaleAxis = d3
            .scaleTime()
            .domain([new Date(d3.min(data, d => d.Year)-1,0,0), new Date(d3.max(data, d => d.Year)+1,0,0)])
            .range([padding*4, width-padding*2]);

        var maxYearScale = d3.max(data, d => {return xScale(d.Year)});
            console.log(maxYearScale);

        const yScale = d3
            .scaleTime()
            .domain(d3.extent(data, d => new Date(1970,0,1,0, d.Time.split(":")[0], d.Time.split(":")[1])))
            .range([padding*1.5, height-padding*2])
            .nice();


        const svg = d3
            .select('#visHolder')
            .append('svg')
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .attr("viewBox", `0 0 ${width} ${height}`);

        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("r", 5)
            .attr("cx", d => xScale(d.Year))
            .attr("cy", (d) => {
                    return yScale(new Date(1970,0,1,0, d.Time.split(":")[0], d.Time.split(":")[1]));
            })
            .attr("data-xvalue", d => d.Year)
            .attr("data-yvalue", d => new Date(1970,0,1,0, d.Time.split(":")[0], d.Time.split(":")[1]))
            .style("opacity", 0.7)
            .style("fill", (d) => {
                            if(d.Doping == "")
                                return '#4CAF50';
                            else
                                return '#3F51B5';
            })
            .style("stroke", "goldenrod")
            .style("stroke-width", "1px")
            .on("mouseover", (e,d)=>{
                let directionHorizontal = () => {
                                if(xScale(d.Year) > maxYearScale*0.65)
                                    return (x)-140+"px";
                                else
                                    return (x)+20+"px";
                };
                e.target.style.opacity = 0.9;
                const[x,y] = d3.pointer(e, svg);
                tooltip
                    .transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltip
                    .html(`
                        ${d.Name} : ${d.Nationality}<br/>
                        Year : ${d.Year}<br/>
                        Time : ${d.Time}<br/>
                        ${d.Doping}
                        `)
                    .attr("data-year", `${d.Year}`)
                    .style("left",directionHorizontal())
                    .style("top", (y)+20+"px");
            })
            .on("mouseout", (e,d)=>{
                svg.selectAll(".dot")
                    .style("opacity", 0.7);
                tooltip
                    .transition()
                    .duration(400)
                    .style("opacity", 0);
            });

        var xAxis = d3.axisBottom().scale(xScaleAxis);
        svg
            .append("g")
            .call(xAxis)
            .attr("id", "x-axis")
            .attr("transform", `translate(0, ${height-padding*1.5})`);

        var yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));

        svg
            .append("g")
            .call(yAxis)
            .attr("id", "y-axis")
            .attr("transform", `translate(${padding*3.5}, 0)`);

        let flipBool = true;

        var legend = svg
                        .append('g')
                        .attr("id", "legend")
                        .selectAll("#legend")
                        .data([`No Doping Allegations`, `Riders With Doping Allegations`])
                        .enter()
                        .append('g')
                        .attr("class", `legend_text`)
                        .attr(`transform`, (d,i)=>{
                                                return `translate(0, ${height/2-i*20})`;
                                            });

        legend
            .append('rect')
            .attr('x', width-padding*2.5)
            .attr('width', rectWidth)
            .attr('height', rectHeight)
            .style('fill', (d,i)=>{
                if(i==0){
                    return `#4caf50`;
                } else {
                    return '#3f51b5';
                }
            });

        legend
            .append('text')
            .attr('x', width-padding*2.7)
            .attr('y', 6)
            .attr('dy', '0.3em')
            .style('text-anchor', 'end')
            .text((d,i) => d);

    }
});
