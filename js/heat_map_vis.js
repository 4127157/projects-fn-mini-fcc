/*TODO: 1) Code optimisation(maybe utilise canvas instead?) and cleanup
 *      2) Add labels
 *      3) Improve legend to better represent the colour range on the
 *      chart(take average of below 0 and above and make calculations on that)
 * */

window.addEventListener("DOMContentLoaded", () => {
    var visHolder = document.getElementById(`visHolder`);

    fetch(`https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json`)
        .then((res)=>{
            if(res.ok){
                res.json().then((data)=>{
                    initSvg(data);
                });
            } else {
                visHolder.innerText 
                    = `There seems to be an error: ${res.status} ${res.statusText}`;
            }
        })
        .catch ((err)=>{
                visHolder.innerText = `There seems to be an error: ${err}`;
        });

    const initSvg = (data) => {
        
        let height = 900*0.6,
            width = 1600*0.6, 
            padding = (height/3)*0.1,
            rectHeight = padding,
            rectWidth = padding/2,
            maxVariance = d3.max(data.monthlyVariance, d => d.variance),
            minVariance = d3.min(data.monthlyVariance, d => d.variance),
            minYear = d3.min(data.monthlyVariance, d => d.year),
            maxYear = d3.max(data.monthlyVariance, d=> d.year),
            legSplitArr = [4,0,4]

        const tooltip = d3
            .select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("opacity", 0);

        const svg = d3
            .select(`#visHolder`)
            .append(`svg`)
            .attr(`preserveAspectRatio`, `xMinYMin meet`)
            .attr(`viewBox`, `0 0 ${width} ${height}`);

        const xScale = d3
            .scaleBand()
            .domain(Array.from(data.monthlyVariance, d=> d.year))
            .range([padding*4, (width-padding)]);

        const yScale = d3
            .scaleBand()
            .domain(Array.from(data.monthlyVariance, d => d.month)
                .map((d,i)=> {
                        return d-1;
                    
                }))
            .range([padding,height-padding*7]);

        const exprColrScale = d3
            .scalePow()
            .exponent([0.2])
            .domain([minVariance, 
                    (Math.round((minVariance-(minVariance+0.07))*100)/100), 
                    0,
                    (Math.round((maxVariance-(maxVariance-0.07))*100)/100),
                    maxVariance])
            .range(['#002e66', '#a8cfff', '#81C784', '#ffbb9e', '#802600'])
            .clamp(true);

        svg
            .selectAll(".cell")
            .data(data.monthlyVariance)
            .enter()
            .append("rect")
            .attr(`class`, `cell`)
            .attr(`x`, d => xScale(d.year))
            .attr(`y`, d => yScale(d.month-1))
            .style(`fill`, d => {
                return exprColrScale(d.variance);
            })
            .attr(`height`, yScale.bandwidth()+(yScale.bandwidth()*0.015))
            .attr(`width`, xScale.bandwidth()+(xScale.bandwidth()*0.18))
            .attr('data-month', d=> d.month-1)
            .attr('data-year', d => d.year)
            .attr('data-temp', d => {
                    return data.baseTemperature+(d.variance);
            })
            .on("mouseover", (e, d)=> {
                const[x,y] = d3.pointer(e,svg);
                
                let date = new Date(0);
                date.setUTCMonth(d.month);
                let format = d3.timeFormat(`%B`);

                tooltip
                    .transition()
                    .duration(200)
                    .style("opacity", 0.9);

                tooltip
                    .html(`
                        ${d.year} - ${format(date)}<br/>
                        ${Math.round((data.baseTemperature+(d.variance)+Number.EPSILON)*100)/100}C<br/>
                        ${d.variance <0 ? d.variance+"C" : d.variance > 0 ? "+"+d.variance+"C" : d.variance }`)
                    .attr("data-year", `${d.year}`);
                    
                tooltip
                    .style("left", `${(x)+5}px`)
                    .style("top", `${(y)-75}px`);

                e.target.setAttribute("width", xScale.bandwidth());
                e.target.style.stroke = "black";
                e.target.style.stroke_width = xScale.bandwidth()*0.04;
            })
            .on("mouseout", (e, d) => {
                e.target.style.stroke = '';
                e.target.style.stroke_width = '';
                e.target.setAttribute("width", xScale.bandwidth()+(xScale.bandwidth()*0.18));

                tooltip
                    .transition()
                    .duration(400)
                    .style("opacity", 0);
            });

        var yearTicks = []; 
        yearTicks = Array.from(data.monthlyVariance, d => {
                        return d.year;
                    })
                    .filter(d => {
                        if(d%12 ==0 
                            || d == minYear
                            || d == maxYear) {
                            if(yearTicks.indexOf(d) == -1)
                            {
                                yearTicks.push(d);
                                return true;   
                            }
                        }
                    });

        var xAxis = d3
            .axisBottom()
            .scale(xScale)
            .tickValues(yearTicks);

        svg
            .append("g")
            .call(xAxis)
            .attr("id", "x-axis")
            .attr("transform", `translate(0, ${height-padding*6.5})`);
        
        var yAxis = d3
            .axisLeft()
            .scale(yScale)
            .tickValues(yScale.domain())
            .tickFormat((month)=>{
                        let date = new Date(0);
                        date.setUTCMonth(month);
                        let format = d3.timeFormat(`%B`);
                        return format(date);
                    });

        svg
            .append("g")
            .call(yAxis)
            .attr("id", "y-axis")
            .attr("transform", `translate(${padding*3.5}, 0)`);

        const legendDomain = () => {
            let tempArr = [];
            for(let i=0; i<legSplitArr.length; i++){
                if(legSplitArr[i] == 0){
                    tempArr.push(0);
                } else {
                    for(let j=0; j<legSplitArr[i]; j++){
                        if(i == 0){
                            tempArr.push(Math.round(minVariance/(j+1)*100)/100);
                        } else if(i == 2){
                            tempArr.push("+"+(Math.round((maxVariance/(legSplitArr[i]-j))*100)/100));
                        }
                    }
                }
            }

            return tempArr;
        };

        const legendScale = d3
                        .scaleBand()
                        .domain(legendDomain())
                        .range([0, width/3.15])
                        .paddingInner(0.02)
                        .paddingOuter(0.5);

        var legend = svg
                        .append("g")
                        .attr("id", "legend")
                        .attr("transform", `translate(${padding*3}, 0)`);

        legend
            .append("g")
            .selectAll("rect")
            .data(legendDomain())
            .enter()
            .append("rect")
            .attr("x", d => legendScale(d))
            .attr("y", height-(legendScale.bandwidth()*2))
            .attr("height", legendScale.bandwidth())
            .attr("width", legendScale.bandwidth())
            .style("fill",d => exprColrScale(d));
        
        var legendAxis = d3
                            .axisBottom()
                            .scale(legendScale)
                            .tickValues(legendDomain());

        legend
                .append("g")
                .call(legendAxis)
                .attr("id", "legend-axis")
                .attr("transform", `translate(0, ${height-(legendScale.bandwidth()*0.9)})`);

        document.getElementById('fromYr').innerText = data.monthlyVariance[0].year;  
        document.getElementById('toYr').innerText = data.monthlyVariance[data.monthlyVariance.length-1].year;
        document.getElementById('baseTemp').innerText = data.baseTemperature+"C";
    }
});
