const d3 = require('d3')

const h = 500
const w = 800
const padding = 60

const container = d3.select('.container')
    .style("background-color", "#fff")

const svg = d3.select('.container')
    .append('svg')
    .attr("height", h)
    .attr("width", w)

const toolTip = d3.select('.container')
    .append('div')
    .attr('id', 'toolTip')

svg.append('text')
.text(`Gross Domestic Product $'bn`)
.attr('y', 30)

svg.append('text')
.text(`Years`)
.attr('x', 382)
.attr('y', h - 10)

const createYears = (dataArr) => {    // ['1970 Q1', ...]
    return dataArr.map(item => {
        const year = item[0].slice(0, 4)
        const value = item[1]
        let qtr
        const mth = item[0].slice(5, 7)
        switch (mth) {
            case "01": qtr = "Q1"
                break;
            case "04": qtr = "Q2"
                break;
            case "07": qtr = "Q3"
                break;
            case "10": qtr = "Q4"
                break;
        }
        return year + ' ' + qtr
    })
}


fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
    .then(response => response.json())
    .then(data => {

        // Create x-axis
        const yearsDate = data.data.map(item => new Date(item[0]))
        const xMax = new Date(d3.max(yearsDate))
        xMax.setMonth(xMax.getMonth() + 3)
        const xScale = d3.scaleTime()
            .domain([d3.min(yearsDate), xMax])
            .range([padding, w - padding])
        const xAxis = d3.axisBottom(xScale)
        svg.append('g')
        .call(xAxis)
        .attr('transform', 'translate(0, ' + (h - padding) + ')')

        // Create y-axis
        const gdp = data.data.map(item => item[1])
        const yScale = d3.scaleLinear()
        .domain([0, d3.max(gdp)])
        .range([h - padding, padding])
        const yAxis = d3.axisLeft(yScale)
        svg.append('g')
        .call(yAxis)
        .attr('transform', 'translate(' + padding + ', 0)')

        // Create bars
        const years = createYears(data.data)
        const barScale = d3.scaleLinear() // Scale for bar height
        .domain([0, d3.max(gdp)])
        .range([0, h - 2 * padding])
        scaledGdp = gdp.map(item => barScale(item))
        svg.selectAll('rect')
        .data(scaledGdp)
        .enter()
        .append('rect')
        .attr('height', d => d)
        .attr('width', (w - 2 * padding)/gdp.length)
        .attr('x', (d, i) => xScale(yearsDate[i]))
        .attr('y', d => h - padding - d)
        .attr('id', 'bar')
        .on('mouseover', (e, d) => {
            console.log('triggerd')
            const index = scaledGdp.indexOf(d)
            toolTip.html(`<p>${years[index]}</p><p>$${gdp[index]} billion<p>`)
            toolTip.transition().duration(50).style('opacity', '0.9')
            .style('left', (xScale(yearsDate[index]) + 50) + 'px')
            .style('top', 400 + 'px')
        })
        .on('mouseout', () => {
            toolTip.transition().duration(50).style('opacity', '0')
        })
    })