const canvas = d3.select(".canva");

// Load NDJSON (line-separated JSON)
d3.text("./data/copy_book_works.json").then(function(text) {
    console.log("RAW text from file:", text);  // <--- ADD THIS
    // Step 1: Parse each non-empty line into an object
    let data = text.trim().split('\n')
        .filter(line => line.trim() !== "") // <- NEW
        .map(line => JSON.parse(line));
        data = data.filter(d => d.original_publication_year !== "");

    // Step 2: Process data to count books per year
    let yearCounts = d3.rollup(
        data,
        v => v.length,
        d => +d.original_publication_year // convert year to number
    );

    // Step 3: Convert map to sorted array and filter invalid years
    let yearData = Array.from(yearCounts, ([year, count]) => ({ year, count }))
                        .filter(d => !isNaN(d.year))
                        .sort((a, b) => d3.ascending(a.year, b.year));

    // Step 4: Set up the graph
    const svg = canvas.append("svg")
        .attr("width", 1500)
        .attr("height", 1000);

    const margin = {top: 20, right: 20, bottom: 70, left: 70};
    const graphWidth = 1500 - margin.left - margin.right;
    const graphHeight = 1000 - margin.top - margin.bottom;

    const mainCanvas = svg.append("g")
        .attr("width", graphWidth)
        .attr("height", graphHeight)
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Step 5: Create scales
    const x = d3.scaleLinear()
        .domain([1900, d3.max(yearData, d => d.year)])
        .range([0, graphWidth]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(yearData, d => d.count)])
        .range([graphHeight, 0]);

    // Step 6: Create area and line generators
    const areaChart = d3.area()
        .x(d => x(d.year))
        .y0(graphHeight)
        .y1(d => y(d.count));

    const valueLine = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.count));

    // Step 7: Append paths
    mainCanvas.append("path")
        .datum(yearData)
        .attr("class", "line")
        .attr("d", valueLine)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    mainCanvas.append("path")
        .datum(yearData)
        .attr("fill", "lightblue")
        .attr("class", "area")
        .attr("d", areaChart);

    // Step 8: Axes
    const xAxis = d3.axisBottom(x)
        .tickFormat(d3.format("d")); // plain year format

    const yAxis = d3.axisLeft(y)
        .ticks(5);

    mainCanvas.append("g")
        .attr("transform", `translate(0, ${graphHeight})`)
        .call(xAxis);

    mainCanvas.append("g")
        .call(yAxis);

    // Step 9: Circles on points (optional)
    mainCanvas.selectAll("circle")
        .data(yearData)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.count))
        .attr("r", 4)
        .attr("fill", "tomato");

        console.log("Loaded Data:", data);
        console.log("Processed Year Data:", yearData);    
        
        // X Axis
mainCanvas.append("g")
.attr("transform", `translate(0, ${graphHeight})`)
.call(xAxis);

// Y Axis
mainCanvas.append("g")
.call(yAxis);

// X Axis Label
mainCanvas.append("text")
.attr("x", graphWidth / 2)
.attr("y", graphHeight + 50)
.attr("text-anchor", "middle")
.attr("font-size", "14px")
.text("Publication Year");

// Y Axis Label
mainCanvas.append("text")
.attr("x", -graphHeight / 2)
.attr("y", -50)
.attr("text-anchor", "middle")
.attr("font-size", "14px")
.attr("transform", "rotate(-90)")
.text("Number of Books");

}).catch(function(error){
    console.error("Error loading the data:", error);
});


