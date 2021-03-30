const educationData = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countyData = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

let store = {};


function loadData() {
  return Promise.all([
  d3.json(educationData),
  d3.json(countyData)]).

  then(datasets => {
    store.educationData = datasets[0];
    store.countryData = datasets[1];
    return store;
  });
}


function showData() {
  let edu = store.educationData;
  let us = store.countryData;

  // get data range from educationData
  let min = d3.min(edu, d => d.bachelorsOrHigher);
  let max = d3.max(edu, d => d.bachelorsOrHigher);
  let median = d3.median(edu, d => d.bachelorsOrHigher);

  // Threshold Scale
  let threshold = d3.range(min, max, (max - min) / 8);
  let cScale = d3.
  scaleThreshold().
  domain(threshold).
  range(d3.schemePurples[9]);

  // set up svg
  d3.select("#container").
  append("svg").
  attr("width", 1000).
  attr("height", 630);

  // set up tooltip
  let tooltip = d3.select("#container").
  append("div").
  attr("id", "tooltip").
  style("opacity", 0.1);

  // set up map
  let path = d3.geoPath();
  let map = d3.select("svg");

  // draw map
  map.selectAll("path").
  data(topojson.feature(us, us.objects.counties).features).
  enter().
  append("path").
  attr("d", path).
  attr("class", "county").
  attr("data-fips", d => d.id).
  attr("data-education", (d) =>
  getEducationValue(edu, d.id) ?
  getEducationValue(edu, d.id) :
  "no data").
  attr("fill", (d) =>
  getEducationValue(edu, d.id) ?
  cScale(getEducationValue(edu, d.id)) :
  "white").
  on("mouseover", (event, d) => {
    tooltip.transition().
    duration(200).
    style("opacity", 0.9).
    attr("data-education", getEducationValue(edu, d.id));
    tooltip.text(getCounty(edu, d.id) + ": " +
    getEducationValue(edu, d.id) + "%").
    style("left", event.pageX + "px").
    style("top", event.pageY + "px");
  }).on("mouseout", (event, d) => {
    tooltip.transition().
    duration(500).
    style("opacity", 0);
  });

  // set up legend
  let legend = d3.select("svg").
  append("g").
  attr("id", "legend").
  attr("transform", "translate(570,20)");

  let rectWidth = 35;
  let rectHeight = 13;

  legend.selectAll("rect").
  data(threshold).
  enter().
  append("rect").
  attr("width", rectWidth).
  attr("height", rectHeight).
  attr("x", (d, i) => i * rectWidth).
  attr("fill", d => cScale(d));

  let xScale = d3.scaleLinear().
  domain([min, max]).
  range([0, threshold.length * rectWidth]);
  let xAxis = d3.axisBottom(xScale).
  tickSize(13).
  tickValues([...threshold, max]).
  tickFormat(d => Math.round(d) + "%");
  d3.select("#legend").
  append("g").
  attr("id", "xAxis").
  call(xAxis);

}

loadData().then(showData);


// helper functions
function getEducationValue(data, id) {
  let county = data.filter(item => item.fips === id);
  return county[0].bachelorsOrHigher;
}

function getCounty(data, id) {
  let county = data.filter(item => item.fips === id);
  let fullCountyName = county[0].area_name + ", " + county[0].state;
  return fullCountyName;
}