const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

// Set the dimensions of the SVG container
const margin = {top: 60, right: 40, bottom: 60, left: 60};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Append SVG to the body with margins
const svg = d3.select("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

// Fetch data and create the scatterplot
d3.json(url).then(data => {
    data.forEach(d => {
        d.Year = new Date(d.Year, 0); // Create Date objects for Year
        const parsedTime = d.Time.split(':');
        d.Time = new Date(Date.UTC(1970, 0, 1, 0, parsedTime[0], parsedTime[1])); // Parse time to Date objects
    });

    // Set scales
    const xScale = d3.scaleTime()
                     .domain(d3.extent(data, d => d.Year))
                     .range([0, width]);

    const yScale = d3.scaleTime()
                     .domain(d3.extent(data, d => d.Time))
                     .range([0, height]);

    // Add X axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat('%Y'));
    svg.append("g")
       .attr("id", "x-axis")
       .attr("transform", `translate(0, ${height})`)
       .call(xAxis);

    // Add Y axis
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));
    svg.append("g")
       .attr("id", "y-axis")
       .call(yAxis);

    // Create dots
    svg.selectAll(".dot")
       .data(data)
       .enter()
       .append("circle")
       .attr("class", "dot")
       .attr("cx", d => xScale(d.Year))
       .attr("cy", d => yScale(d.Time))
       .attr("r", 6)
       .attr("data-xvalue", d => d.Year.getFullYear())
       .attr("data-yvalue", d => d.Time.toISOString())
       .attr("fill", d => d.Doping ? "red" : "steelblue")
       .on("mouseover", (event, d) => {
           d3.select("#tooltip")
             .style("visibility", "visible")
             .style("left", `${event.pageX + 10}px`)
             .style("top", `${event.pageY - 28}px`)
             .attr("data-year", d.Year.getFullYear())
             .html(`${d.Name}: ${d.Nationality}<br>Year: ${d.Year.getFullYear()}, Time: ${d3.timeFormat("%M:%S")(d.Time)}<br>${d.Doping ? d.Doping : "No doping"}`);
       })
       .on("mouseout", () => {
           d3.select("#tooltip").style("visibility", "hidden");
       });

    // Add legend
    const legend = svg.append("g")
                      .attr("id", "legend")
                      .attr("transform", `translate(${width - 150},${margin.top})`);

    // Legend items
    const legendData = [
        {label: "Riders with doping", color: "red"},
        {label: "No doping", color: "steelblue"}
    ];

    legend.selectAll(".legend-item")
          .data(legendData)
          .enter()
          .append("g")
          .attr("class", "legend-item")
          .attr("transform", (d, i) => `translate(0, ${i * 20})`)
          .each(function(d, i) {
              d3.select(this).append("circle")
                  .attr("cx", 10)
                  .attr("cy", 0)
                  .attr("r", 6)
                  .attr("fill", d.color);
              d3.select(this).append("text")
                  .attr("x", 20)
                  .attr("y", 5)
                  .text(d.label);
          });
}).catch(error => {
    console.error('Error loading or parsing data:', error);
});