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
        .attr("width", "100%")
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
        .domain([d3.min(yearData, d => d.year), d3.max(yearData, d => d.year)])
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
        .attr("fill", "skyblue")
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

    // Create the tooltip
    const tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(d => `<strong>${d.year}:</strong> <span style='color:lightyellow'>${d.count} books</span>`);

    // Call the tooltip on the SVG
    svg.call(tip);

    // circles on points 
    firstGraph.selectAll("circle")
        .data(yearData)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.count))
        .attr("r", 4)
        .attr("fill", "darkcyan")
        .on("mouseover", function(event, d) {
            tip.show(d, this);
        })
        .on("mouseout", function(event, d) {
            tip.hide(d, this);
        });

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
        .attr("width", "100%")
        .attr("height", 500);

const secondGraph = svg.append("g")
        .attr("width", "100%")
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
          .style("fill", "whitesmoke")
          .style("font-weight", "bold")
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.text; });
    }

});

// third visualization 
const third = d3.select(".third");

const mapSvg = third.append("svg")
    .attr("width", 1200)
    .attr("height", 650);

const mapGraph = mapSvg.append("g")
    .attr("width", 1200)
    .attr("height", 650);

// Map of 3-letter language codes to ISO3 country codes
// This helps us visualize languages on a map
const iso3LanguageToCountry = {
    'eng': 'USA', // English -> USA
    'ger': 'DEU', // German -> Germany
    'deu': 'DEU', // German (alternative code) -> Germany
    'spa': 'ESP', // Spanish -> Spain
    'fra': 'FRA', // French -> France
    'ita': 'ITA', // Italian -> Italy
    'jpn': 'JPN', // Japanese -> Japan
    'zho': 'CHN', // Chinese -> China
    'rus': 'RUS', // Russian -> Russia
    'por': 'PRT', // Portuguese -> Portugal
    'kor': 'KOR', // Korean -> South Korea
    'ara': 'SAU', // Arabic -> Saudi Arabia
    'hin': 'IND', // Hindi -> India
    'nld': 'NLD', // Dutch -> Netherlands
    'swe': 'SWE', // Swedish -> Sweden
    'fin': 'FIN', // Finnish -> Finland
    'nor': 'NOR', // Norwegian -> Norway
    'dan': 'DNK', // Danish -> Denmark
    'pol': 'POL', // Polish -> Poland
    'tur': 'TUR', // Turkish -> Turkey
    'ces': 'CZE', // Czech -> Czech Republic
    'ell': 'GRC', // Greek -> Greece
    'hun': 'HUN', // Hungarian -> Hungary
    'heb': 'ISR', // Hebrew -> Israel
    'tha': 'THA', // Thai -> Thailand
    'ukr': 'UKR', // Ukrainian -> Ukraine
    'ind': 'IDN', // Indonesian -> Indonesia
    'vie': 'VNM', // Vietnamese -> Vietnam
    'fas': 'IRN', // Persian/Farsi -> Iran
    'ron': 'ROU', // Romanian -> Romania
    'ben': 'BGD'  // Bengali -> Bangladesh
};

// Map of language codes to full language names
const languageCodeToName = {
    'eng': 'English',
    'ger': 'German',
    'deu': 'German',
    'spa': 'Spanish',
    'fra': 'French',
    'ita': 'Italian',
    'jpn': 'Japanese',
    'zho': 'Chinese',
    'rus': 'Russian',
    'por': 'Portuguese',
    'kor': 'Korean',
    'ara': 'Arabic',
    'hin': 'Hindi',
    'nld': 'Dutch',
    'swe': 'Swedish',
    'fin': 'Finnish',
    'nor': 'Norwegian',
    'dan': 'Danish',
    'pol': 'Polish',
    'tur': 'Turkish',
    'ces': 'Czech',
    'ell': 'Greek',
    'hun': 'Hungarian',
    'heb': 'Hebrew',
    'tha': 'Thai',
    'ukr': 'Ukrainian',
    'ind': 'Indonesian',
    'vie': 'Vietnamese',
    'fas': 'Persian',
    'ron': 'Romanian',
    'ben': 'Bengali'
};

// Load the book data and world map data
Promise.all([
    d3.text("./data/copy_books.json"),
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
]).then(function([bookText, worldData]) {
    // Process book data
    let bookData = bookText.trim().split('\n')
        .filter(line => line.trim() !== "")
        .map(line => JSON.parse(line));
    
    // Count books by language
    const languageCounts = {};
    bookData.forEach(book => {
        // Only process books with a valid language code
        if (book.language_code && book.language_code !== "") {
            const languageCode = book.language_code.toLowerCase();
            languageCounts[languageCode] = (languageCounts[languageCode] || 0) + 1;
        }
    });
    
    console.log("Book counts by language:", languageCounts);
    
    // Transform language data to country data for visualization
    const countryData = {};
    for (const [langCode, count] of Object.entries(languageCounts)) {
        const iso3 = iso3LanguageToCountry[langCode];
        if (iso3) {
            // If a country already has a count (multiple languages map to one country),
            // add to its total
            countryData[iso3] = (countryData[iso3] || 0) + count;
        }
    }
    
    // Create a threshold scale instead of a sequential scale for better visibility
    // This will group the data into ranges rather than a continuous scale
    const colorScale = d3.scaleThreshold()
        .domain([1, 5, 10, 20, 50, 100]) // Simplified thresholds ending at 100
        .range(d3.schemeBlues[7]); // Use Blues color scheme with 7 colors (one less than domains+1)
    
    // Create projection
    const projection = d3.geoNaturalEarth1()
        .scale(200)
        .center([0, 0])
        .translate([600, 350]);
    
    // Create path generator
    const path = d3.geoPath().projection(projection);
    
    // Draw map
    mapGraph.selectAll("path")
        .data(worldData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", d => {
            const iso3 = d.id;
            return countryData[iso3] ? colorScale(countryData[iso3]) : "#eee";
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .on("mouseover", function(event, d) {
            mapTip.show(d, this);
        })
        .on("mouseout", function(event, d) {
            mapTip.hide(d, this);
        });

    // Add a custom legend for the threshold scale

    // Create a vertical legend using d3-legend
    const colorLegend = d3.legendColor()
    .labelFormat(d3.format("d"))
    .scale(colorScale)
    .shapeWidth(30)
    .shapeHeight(30)
    .shapePadding(5)
    .orient('vertical')
    .labels(({ i }) => {
        const labelPairs = ["0", "1-4", "5-9", "10-19", "20-49", "50-99", "100+"];
        return labelPairs[i];
    })    
    .title("# of Books Published")
    .titleWidth(100);

    // Append it to the SVG
    mapSvg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(1100, 30)`) // (x, y) position to the right side
    .call(colorLegend);

    // Create d3-tip for map
    const mapTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(d => {
        const iso3 = d.id;
        const count = countryData[iso3] || 0;
        return `<strong>${d.properties.name}:</strong> <span style='color:lightyellow'>${count} books</span>`;
    });

    // Attach tip to SVG
    mapSvg.call(mapTip);

    // Add language code legend to show mapping between languages and countries
    const languageLegend = mapSvg.append("g")
        .attr("transform", `translate(0, 50)`);
    
    // Get top languages for the legend (to avoid overcrowding)
    const topLanguages = Object.entries(languageCounts)
        .filter(([code]) => iso3LanguageToCountry[code]) // Only include mappable languages
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    languageLegend.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Top Languages:");
    
    // Add language entries
    topLanguages.forEach((langData, i) => {
        const langCode = langData[0];
        const count = langData[1];
        const fullName = languageCodeToName[langCode] || langCode;
        
        languageLegend.append("text")
            .attr("x", 0)
            .attr("y", i * 20 + 10)
            .style("font-size", "14px")
            .text(`${fullName} (${langCode}): ${count} books`);
    });

}).catch(function(error) {
    console.log("Error loading data:", error);
});