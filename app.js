// for first data visualization (area and line chart)
const first = d3.select(".first");

d3.text("./data/copy_book_works.json").then(function(text) { // get data 
    let data = text.trim().split('\n')
        .filter(line => line.trim() !== "") 
        .map(line => JSON.parse(line));
        data = data.filter(d => d.original_publication_year !== "");

    let yearCounts = d3.rollup(
        data,
        v => v.length,
        d => +d.original_publication_year // convert year to number
    );

    // convert map to sorted array and filter invalid years
    let yearData = Array.from(yearCounts, ([year, count]) => ({ year, count }))
                        .filter(d => !isNaN(d.year))
                        .sort((a, b) => d3.ascending(a.year, b.year));

    // set up the graph
    const svg = first.append("svg")
        .attr("width", 1500)
        .attr("height", 1000);

    const margin = {top: 20, right: 20, bottom: 70, left: 70};
    const graphWidth = 1500 - margin.left - margin.right;
    const graphHeight = 1000 - margin.top - margin.bottom;

    const firstGraph = svg.append("g")
        .attr("width", graphWidth)
        .attr("height", graphHeight)
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // create scales
    const x = d3.scaleLinear()
        .domain([1900, d3.max(yearData, d => d.year)])
        .range([0, graphWidth]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(yearData, d => d.count)])
        .range([graphHeight, 0]);

    // create area and line generators
    const areaChart = d3.area()
        .x(d => x(d.year))
        .y0(graphHeight)
        .y1(d => y(d.count));

    const valueLine = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.count));

    firstGraph.append("path")
        .datum(yearData)
        .attr("class", "line")
        .attr("d", valueLine)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    firstGraph.append("path")
        .datum(yearData)
        .attr("fill", "lightblue")
        .attr("class", "area")
        .attr("d", areaChart);

    // axes
    const xAxis = d3.axisBottom(x)
        .tickFormat(d3.format("d")); // plain year format

    const yAxis = d3.axisLeft(y)
        .ticks(5);

    firstGraph.append("g")
        .attr("transform", `translate(0, ${graphHeight})`)
        .call(xAxis);

    firstGraph.append("g")
        .call(yAxis);

    // circles on points 
    firstGraph.selectAll("circle")
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
        
    // x axis
    firstGraph.append("g")
    .attr("transform", `translate(0, ${graphHeight})`)
    .call(xAxis);

    // y axis
    firstGraph.append("g")
    .call(yAxis);

    // x axis label 
    firstGraph.append("text")
    .attr("x", graphWidth / 2)
    .attr("y", graphHeight + 50)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Publication Year");

    // y axis label
    firstGraph.append("text")
    .attr("x", -graphHeight / 2)
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("transform", "rotate(-90)")
    .text("Number of Books");

});

// select the second graph container
const second = d3.select(".second");

const svg = second.append("svg")
        .attr("width", 1500)
        .attr("height", 800);

const secondGraph = svg.append("g")
        .attr("width", 1500)
        .attr("height", 500)
        .attr("transform", `translate(100, 100)`);

d3.text("./data/copy_book_genres.json").then(function(text) { // load data 
    let data = text.trim().split('\n')
        .filter(line => line.trim() !== "")
        .map(line => JSON.parse(line));

    // find top genre for each book
    let topGenres = data.map(d => {
        let genres = d.genres;
        let topGenre = "";
        let topCount = -Infinity;
        for (let genre in genres) {
            if (genres[genre] > topCount) {
                topGenre = genre;
                topCount = genres[genre];
            }
        }
        return topGenre;
    });

    // count how many times each top genre appears
    let genreCounts = d3.rollup(
        topGenres,
        v => v.length,
        d => d
    );

    // convert to array for word cloud
    let wordCloudData = Array.from(genreCounts, ([genre, count]) => ({ text: genre, size: count }));

    // functions from https://d3-graph-gallery.com/graph/wordcloud_size.html
    var layout = d3.layout.cloud()
        .size([1500, 1000])
        .words(wordCloudData)
        .padding(0)
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .fontSize(function(d) { return 10 + Math.sqrt(d.size) * 2; })
        .on("end", draw);

    layout.start();

    function draw(words) {
      secondGraph.append("g")
          .attr("transform", "translate(700, 200)") 
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
          .style("font-size", function(d) { return d.size + "px"; })
          .style("fill", "#69b3a2")
          .attr("text-anchor", "middle")
          .style("font-family", "Impact")
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.text; });
    }

});
