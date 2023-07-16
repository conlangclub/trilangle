import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as clipperLib from "https://cdn.jsdelivr.net/npm/js-angusj-clipper@1.1.0/web/index.js/+esm";

const clipper = await clipperLib.loadNativeClipperLibInstanceAsync(
  // let it autodetect which one to use, but also available WasmOnly and AsmJsOnly
  clipperLib.NativeClipperLibRequestedFormat.WasmWithAsmJsFallback
);

// styling constants
const SCALE_FACTOR = 100;
const OFFSET = 0; // padding from top right edge of SVG

// clipper only support integer coordinates as inputs
// so we take our float coords, multiply them with a big number
// so there's no fractional part, and divide them down again
// when we get our output from clipper
const CLIPPER_GLOBAL_SCALING = 10000;

class TrilangleSentence extends HTMLElement {
  constructor() {
    super();

    let tokensJSON = this.querySelector("template").innerHTML;
    let tokens = JSON.parse(tokensJSON);

    let {width, height, viewbox} = this.dataset;

    this.append(renderSentence(tokens, width, height, viewbox));
  }
}

customElements.define("trilangle-sentence", TrilangleSentence);

function renderSentence(tokens, width, height, viewbox) { 
  let container = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", viewbox)
  
  container.selectAll("g")
    .data(tokens.map(d => {
      // compute some values that are used for rendering only.
      // storing the values here reduces redundancy
      // e.g. if we need to call the same function for
      // the values of two separate SVG attributes x and y
      d.level = d.level ?? 0;
      d.polarity = d.polarity ?? "pos";
      return {
        ...d,
        _vertices: tokenToVertices({...d, level: d.level + .3}, SCALE_FACTOR, OFFSET),
        _dotPosition: tokenToVertices({...d, level: d.level + 2}, SCALE_FACTOR, OFFSET)[(d.triangles[0][2] == 1 ? d.dot + 2 : d.dot) % 3],
        _textAnchor: tokenTextAnchor(d, SCALE_FACTOR, OFFSET),
      };
    }))
    .join(
      (enter) => {
        const g = enter.append("g");
        
        g.append("polygon")
          .attr("points", d => d._vertices)
          .style("fill", d => { 
            let color = d3.color(d.color);
            color.opacity = 0.1;
            return color;
          })
          .style("stroke", d => d.color)
          .style("stroke-width", 1.5)
          .style("stroke-dasharray", d => {
            return {pos: "none", unk: 10, neg: 2}[d.polarity]
          })
        
        g.append("text")
          .text(d => d.word)
          .attr("x", d => d._textAnchor[0])
          .attr("y", d => d._textAnchor[1])
          .style("text-anchor", "middle")
          .style("dominant-baseline", "middle")
          .style("fill", d => d.color)
          .style("font-family", "sans-serif")
          .style("font-size", "10pt")

        g.filter(d => d.color === "blue")
          .append("circle")
          .attr("cx", d => d._dotPosition[0])
          .attr("cy", d => d._dotPosition[1])
          .attr("r", 3)
          .style("fill", d => d.color)
        
        return g;
      }
    );
  
  return container.node();
}

/* Get the vertices for a triangle on the triangle grid */
function triangleToVertices(triangle, scaleFactor, offset) {
  const height = .866; // The base of the equilateral triangle is 1 unit long, so the height is  sqrt(3)/2 = .866 (cf. 30-60-90 triangles)
  const [q, r, u] = triangle;
  let vertices;

  if (u === 1) {
    vertices = [
      [.5+q+1, r*height + height],
      [.5+q+.5, r * height],
      [.5+q, r*height + height]
    ];
  } else {
    vertices = [
      [.5+q, r*height + height],
      [.5+q-.5, r*height],
      [.5+q+.5, r*height]
    ];
  }
  
  // horizontally stagger odd rows
  if (r % 2 != 0) vertices = vertices.map(point => [point[0]+.5, point[1]]);
  
  return vertices.map(point => point.map(component => offset + component * scaleFactor));
}

/* Convert a simple list of [x, y] polygon points to polygons understood by clipper */
function polyPointsToClipperPoly(polyPoints) {
  const vertices = polyPoints.map(vertex => { return {x: vertex[0] * CLIPPER_GLOBAL_SCALING, y: vertex[1] * CLIPPER_GLOBAL_SCALING} });
  return {data: vertices, closed: true};
}

function clipperPolyResultToPolyPoints(polyResult) {
  return polyResult[0].map(vertex => [vertex.x / CLIPPER_GLOBAL_SCALING, vertex.y / CLIPPER_GLOBAL_SCALING]);
}

/* Convert a Triangle token to polygon vertices */
function tokenToVertices(token, scaleFactor, offset) {
  const triangles = token.triangles.map(triangle => triangleToVertices(triangle, scaleFactor, offset));

  const union = clipper.clipToPaths({
    clipType: clipperLib.ClipType.Union,
    subjectInputs: triangles.map(polyPointsToClipperPoly),
    subjectFillType: clipperLib.PolyFillType.EvenOdd,
  });

  const inset = clipper.offsetToPaths({
    delta: -56000 * token.level,
    offsetInputs: [{
      data: union[0],
      joinType: clipperLib.JoinType.Miter,
      endType: clipperLib.EndType.ClosedPolygon
    }],
  });

  return clipperPolyResultToPolyPoints(inset);
}

/* Get the [x, y] of the text anchor point for a given Trilangle token */
function tokenTextAnchor(token, scaleFactor, offset) {
  const height = .866; // The base of the equilateral triangle is 1 unit long, so the height is  sqrt(3)/2 = .866 (cf. 30-60-90 triangles)
  const [q, r, u] = token.triangles[0];
  let anchor;
  if (u === 1) {
    anchor = [.5+q+.5, r*height + 2*height/3];
  } else {
    anchor = [.5+q, r*height + height/3];
  }

  // horizontally stagger odd rows
  if (r % 2 != 0) anchor[0] += .5;
  
  return anchor.map(component => offset + component * scaleFactor);
}