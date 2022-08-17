window.addEventListener("DOMContentLoaded", () => {
    var visHolder = document.getElementById(`visHolder`);

    const FILE_URL = 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json';

    fetch(FILE_URL)
        .then((res) => {
            res.json()
                .then((data)=> {
                    initSvg(data);
                })
        })
        .catch((err) => {
            console.log('There has been an error:');
            console.log(err);
            visHolder.innerText = `There was an error in the request: ${err}`;
        });

    const initSvg = (data) => {
        let height = 900*0.6,
            width = 1600*0.6,
            padding = (height/3)*0.1,
            treeHeight = +height*0.8,
            parentStore = [],
            colorStore = new Object(),
            randStore = [];

        let root = d3.hierarchy(data)
            .eachBefore((d) => {
                d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
            })
            .sum((d) => d.value)
            .sort((a,b) => b.height - a.height || b.value - a.value);

        const svg = d3
            .select('#visHolder')
            .append('svg')
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('viewBox', `0 0 ${width} ${height}`);

        let treemap = d3
            .treemap()
            .size([width, height-padding])
            .paddingInner(1);
        treemap.tile(d3.treemapBinary);
        treemap(root);
        
        const tooltip = d3
            .select('body')
            .append('div')
            .attr('id', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute');
    
        const getCol = (num) => {
            num = num+1;
            let h,
                s=90,
                l=55;

            h = Math.sqrt(num*137.508)*29;
            let h2 = num*137.508;
            let h3 = (360/(num*137.508))*360;

            return `hsl(${h}, ${s}%, ${l-num*1.87}%)`;

        }

        const getFill = (info) => {
            if(parentStore.indexOf(info)=== -1){
                parentStore.push(info);
            } 

            if(!colorStore.hasOwnProperty(info)){
                colorStore[info] = getCol(parentStore.indexOf(info));
            }
                return colorStore[info];
        }

        const loggerHead = (item) => {
            console.log(item);
        }

        let treeNode = svg
            .selectAll('g')
            .data(root.leaves())
            .join('g')
            .attr('transform', d=> `translate(${[d.x0, d.y0]})`)

        treeNode
            .on('mouseover', (e,d) => {
                e.target.parentNode.style.opacity = 0.7;
            })
            .on('mousemove', (e,d)=>{
                const[x,y] = d3.pointer(e, svg);

                tooltip
                    .transition()
                    .duration(200)
                    .style('opacity', 0.9);

                tooltip
                    .html(`
                    ${d.data.name}<br/>
                    Platform - ${d.parent.data.name}<br/>
                    Value - ${d.data.value}
                    `)
                    .attr('data-value', `${d.data.value}`)
                    .style('left', x+20+'px')
                    .style('top', y-40+'px');

            })
            .on('mouseout', (e,d) => {
                e.target.parentNode.style.opacity = '';
                tooltip
                    .transition()
                    .duration(300)
                    .style('opacity', 0);
            });

        let treeRects = treeNode
            .append('rect')
            .style('opacity', 0.4)
            .style('fill',d=> getFill(d.parent.data.name))
            .classed('tile', true)
            .attr('data-name', d => d.data.name)
            .attr('data-category', d=> d.data.category)
            .attr('data-value', d => d.data.value)
            /* .attr('x', d => d.x0)
            * .attr('y', d => d.y0)
            * There is no need to provide this because of the parent element
            * containing this information
            * */
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0);


        let treeText = treeNode
            .append('foreignObject')
            .attr('dx', 4)
            .attr('dy', 14)
            .attr('width',d=>d.x1-d.x0)
            .attr('height', d=> d.y1-d.y0)
            .append('xhtml:div')
            .style('font-size', '0.45em')
            .style('padding', '3px')
            .text(d => d.data.name);

        let legend = d3
            .select('#visHolder')
            .append('div')
            .attr('id', 'legend');

        let legendBox = legend
            .selectAll('div')
            .data(parentStore)
            .join('div')
            .classed('legend-div', true);

        let legendFact = legendBox
            .append('svg')
            .attr('height', height*0.05)
            .attr('width', height*0.05);

        let legendRect = legendFact
            .append('rect')
            .classed('legend-item', true)
            .attr('height', height*0.05)
            .attr('width', height*0.05)
            .style('fill', d=> getFill(d))
            .style('opacity', 0.4);

        let legendText = legendBox
            .append('text')
            .text(d => d.toString())
            .classed('legend-div-text', true);
        
        /*TODO:
         * 1) use a different treemap style for the legend to implement
         * it would be ideal since we do need the items to spillover like a
         * hierarchical data would. Could be accomplished by creating a leaf
         * node hierarchy with built in functions. 
         * 2) Have to look up better legend implementations that flow over
         * items onto the next line whenever necessary.
         * 3) Flex is the most plausible answer from a devtime and perf pov
         * - set preferable col and row style and media queries for each legend
         *   item which is a nested div in a flex div. There is no calculation
         *   for this and is expandable elegantly even beyond the top fold.
         * 4) The same method could be applied to a wrapping treemap if
         * possible.
         * */
        
        /*root.each((d) => {
            if(d.height >0 && d.height <2)
                console.log(d.data.name);
        });*/




        //Experiments below
        /*Tree Layout Experiment*/
        /*
        var treeLayout = d3.tree().size([width-10, height-10]);
        treeLayout(root);

        var exprNodes = svg
            .selectAll('circle.node')
            .data(root.descendants())
            .join('circle')
            .classed('node', true)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y+4)
            .attr('r', 4);

        var exprLinks = svg
            .selectAll('line.link')
            .data(root.links())
            .join('line')
            .classed('link', true)
            .style('stroke', 'black')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        //https://imgur.com/nYAjGh1/ <- result for tree
        */

        /*Cluster Layout Experimenmt*/
        /*
        var clusterLayout = d3.cluster().size([width, height-10]);
        clusterLayout(root);

        var exprNodes = svg
            .selectAll('circle.node')
            .data(root.descendants())
            .join('circle')
            .classed('node', true)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y+4)
            .attr('r', 4);

        var exprLinks = svg
            .selectAll('line.link')
            .data(root.links())
            .join('line')
            .classed('link', true)
            .style('stroke', 'black')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        //https://imgur.com/5kMrqYC/ <- result for cluster
        */

        /*Pack Layout Experiment*/
        /*
        var packLayout = d3.pack().size([width, height-10]);
        packLayout(root);

        var packCircles = svg
            .selectAll('circle')
            .data(root.descendants())
            .join('circle')
            // .style('fill', '#333')
            .style('opacity', 0.3)
            .style('stroke', 'white')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => d.r);
        //https://imgur.com/JTVEsXw <- result for packed circles
        */
        
        /*Partition Layout Experiment*/
        /*
        var partitionLayout = d3.partition().size([width, height-10]).padding(1);
        partitionLayout(root);

        var partRects = svg
            .selectAll('rect')
            .data(root.descendants())
            .join('rect')
            .attr('x', d => d.x0)
            .attr('y', d => d.y0)
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0);
        //https://imgur.com/RPMLnGO <- result for partition in default
        //orientation
        */

        /*Sunburst Layout Experiment*/
        /*
        var radius = Math.min(width, height) / 2;
        var sBurstLayout = d3.partition().size([2*Math.PI, radius]);
        
        var arcGenerator = d3
            .arc()
            .startAngle(d=> d.x0)
            .endAngle(d=> d.x1)
            .innerRadius(d=> d.y0)
            .outerRadius(d=> d.y1);

        sBurstLayout(root);

        var portionsBurst = svg
            .append('g')
            .selectAll('path')
            .data(root.descendants())
            .join('path')
            .attr('transform', `translate(${width/2}, ${height/2})`)
            .attr('d', arcGenerator);
        //https://imgur.com/vtDIqIU <- result for sunburst
        */
    }

});
