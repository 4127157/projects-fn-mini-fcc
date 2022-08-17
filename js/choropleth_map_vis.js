window.addEventListener("DOMContentLoaded", () => {
    var visHolder = document.getElementById("visHolder");
    var topoMap,
        eduData,
        eduUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json',
        topoUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

    /*The order of the final promise resolution array is the same order as
     * provided as params in the top level function, regardless of how long it
     * takes for a url to resolve over the other, the order is preserved.*/
    Promise.all([topoUrl, eduUrl]
                .map((url) =>{ 
                    return fetch(url)
                                    .then((res)=> res.json())
                }))
            .then((data)=>
            {
                console.log();
                initSvg(...data);
            })
            .catch(err => 
            {
                visHolder.innerText = `There seems to be an error: ${err}`;
                console.log('error fetching data');
                console.log(err);
            });

    const initSvg = (map, data) => {

        let height = 900*0.7,
            width = 1600*0.7,
            padding = (height/3)*0.1,
            minValue = d3.min(data, d => d.bachelorsOrHigher),
            maxValue = d3.max(data, d => d.bachelorsOrHigher),
            legendDivs = 9;

        const tooltip = d3
            .select('body')
            .append('div')
            .attr('id', 'tooltip')
            .style('opacity', 0);

        const colorScale = d3
            .scalePow()
            .exponent([0.5])
            .domain([minValue, maxValue])
            .range(['#E1F5FE','#303F9F'])
            .clamp(true);

        console.log(colorScale(19.6));
        const svg = d3
            .select(`#visHolder`)
            .append("svg")
            .attr(`preserveAspectRatio`, `xMinYMin meet`)
            .attr(`viewBox`, `0 0 ${width} ${height}`);

        /*TODO: 
         * 1) Make the data attr value fetching more efficient utilising
         * memoization or some other means.
         * 2) Fix legend
         * 3) Fix positioning
         * 4) Get chart size to adjust to be lesser than overall svg to make
         * space for the legend that never overlaps
         * 5) Make working tooltips 
         */

        var mapDrawCounties = svg
            .append('g')
            .attr('class', 'counties')
            .selectAll('path')
            .data(topojson.feature(map, map.objects.counties).features)
            .enter()
            .append('path')
            .attr('class', 'county')
            .attr('fill', (d) => 
                {
                    let temp = data.filter(i => i.fips === d.id);
                    return colorScale(temp[0].bachelorsOrHigher);
                })
            .attr('data-fips', (d) =>
                {
                    return data.filter(i => i.fips === d.id)[0].fips;
                })
            .attr('data-education', (d) => 
                {
                    return data.filter(i => i.fips === d.id)[0].bachelorsOrHigher;
                })
            .attr('d', d3.geoPath()); 

        var mapDrawStates = svg
            .append('path')
            .datum(topojson.mesh(map, map.objects.states, (a,b) => a !== b))
            .attr('class', 'states')
            .attr('d', d3.geoPath());
        
        const legendDomain = () => {
            let tempArr = [];
            let max = Math.ceil(maxValue);
            let min = Math.ceil(minValue);

            let temp = 0;
            for(let i = legendDivs; i>0; i--){
                if(i == legendDivs || i == 1){
                    if(i == legendDivs){
                        temp = min;
                    } else {
                        temp = max;
                    }
                } else {
                    temp += max/legendDivs;
                }
                tempArr.push(Math.round(temp));
            }
            return tempArr;
        }

        const legendScale = d3
            .scaleBand()
            .domain(legendDomain())
            .range([(width-(width/3.25)),width-15])
            .paddingInner(0.01)
            .paddingOuter(0.25)
            .round(true);

        var legend = svg
            .append('g')
            .attr('id', 'legend')
            .attr("transform", `translate(${Math.ceil(width*0.01)}, 0)`);

        var legendRect = legend
            .append('g')
            .selectAll('rect')
            .data(legendDomain())
            .enter()
            .append('rect')
            .attr('x', d => legendScale(d))
            .attr('y', d => height-(legendScale.bandwidth()*5.5))
            .attr('height', legendScale.bandwidth()*0.2)
            .attr('width', legendScale.bandwidth())
            .style('fill', d => colorScale(d));

        var legendAxis = d3
            .axisBottom()
            .scale(legendScale)
            .tickValues(legendDomain());

        legend
            .append('g')
            .call(legendAxis)
            .attr('id', 'legend-axis')
            .attr("transform", `translate( 0,${height-(legendScale.bandwidth()*5.2)})`);

        mapDrawCounties
            .on("mouseover", (e, d) => {
                const[x, y] = d3.pointer(e,svg);
                let temp = data.filter(i => i.fips === d.id);
                let area = temp[0].area_name;
                let edu = temp[0].bachelorsOrHigher;

                tooltip
                    .transition()
                    .duration(200)
                    .style('position', 'absolute')
                    .style("opacity", 0.9)
                    .style('left', `${(x)}px`)
                    .style('top', `${(y)-40}px`)
                    .style('background', '#80CBC4')
                    .style('padding', '10px');

                tooltip
                    .html(`
                    ${area}<br>
                    ${edu}%<br>
                `)
                    .attr('data-education', `${edu}`);

                e.target.style.stroke = 'black';
            })
            .on("mouseout", (e,d)=>{
                e.target.style.stroke = '';
                tooltip
                    .transition()
                    .duration(400)
                    .style('opacity', 0);
            });
                        

    }
});
