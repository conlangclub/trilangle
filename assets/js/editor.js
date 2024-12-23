const input = document.getElementById("input");
const preview = document.getElementById("preview");

const editor = document.getElementById("fancy-editor");
const editorTriangle = document.getElementById("editor-triangle");
const editorSubtriangle = document.getElementById("editor-subtriangle");

let trilangleCode = input.value;

input.addEventListener("input", () => {
  updateEverything();
});
updateEverything();

function updateEverything() {
  render(trilangleCode);
  updateEditor(trilangleCode);
}

function render(code) {
  let template = document.createElement("template");
  template.innerHTML = code;
  
  let sentence = document.createElement("trilangle-sentence");
  sentence.append(template);
  
  preview.innerHTML = "";
  preview.append(sentence);
}

function updateEditor(code) {
  const sentence = JSON.parse(code);
  editor.innerHTML = '';

  for (let [triangleNbr, triangle] of sentence.entries()) {
    const triangleElem = editorTriangle.content.cloneNode(true);

    updateEditorField(sentence, triangleElem, triangleNbr, 'word');
    updateEditorField(sentence, triangleElem, triangleNbr, 'color');
    updateEditorField(sentence, triangleElem, triangleNbr, 'level');
    updateEditorField(sentence, triangleElem, triangleNbr, 'dot');

    if (triangle.color !== 'blue') {
      const dot = triangleElem.querySelector('.editor-dot');
      dot.style.display = 'none';
    }

    const [subtriangleLabel, subtriangleList] = triangleElem.querySelector(`.editor-subtriangle-list`).children;
    subtriangleLabel.setAttribute('for', `subtriangles-${triangleNbr}`);
    subtriangleList.setAttribute('name', `subtriangles-${triangleNbr}`);
    for (let [subtriangleNbr, subtriangle] of triangle.triangles.entries()) {
      const subtriangleElem = editorSubtriangle.content.cloneNode(true);

      updateSubtriangleField(sentence, subtriangleElem, triangleNbr, subtriangleNbr, 0);
      updateSubtriangleField(sentence, subtriangleElem, triangleNbr, subtriangleNbr, 1);
      updateSubtriangleField(sentence, subtriangleElem, triangleNbr, subtriangleNbr, 2);

      subtriangleList.appendChild(subtriangleElem);
    }

    editor.appendChild(triangleElem);
  }
}

function updateEditorField(sentence, triangleElem, triangleNbr, fieldName) {
  const [label, input] = triangleElem.querySelector(`.editor-${fieldName}`).children;
  label.setAttribute('for', `${fieldName}-${triangleNbr}`);
  input.setAttribute('name', `${fieldName}-${triangleNbr}`);
  input.value = sentence[triangleNbr][fieldName];

  input.addEventListener('change', (e) => {
    sentence[triangleNbr][fieldName] = (input.type === 'number') ? e.target.valueAsNumber : e.target.value;
    trilangleCode = JSON.stringify(sentence);
    updateEverything();
  });
}

function updateSubtriangleField(sentence, subtriangleElem, triangleNbr, subtriangleNbr, fieldName) {
  const [label, input] = subtriangleElem.querySelector(`.editor-${fieldName}`).children;
  label.setAttribute('for', `${fieldName}-${triangleNbr}-${subtriangleNbr}`);
  input.setAttribute('name', `${fieldName}-${triangleNbr}-${subtriangleNbr}`);
  input.value = sentence[triangleNbr].triangles[subtriangleNbr][fieldName];

  input.addEventListener('change', (e) => {
    sentence[triangleNbr].triangles[subtriangleNbr][fieldName] = e.target.valueAsNumber;
    trilangleCode = JSON.stringify(sentence);
    updateEverything();
  });
}

input.addEventListener('keydown', function(e) {
  if (e.key == 'Tab') {
    e.preventDefault();
    var start = this.selectionStart;
    var end = this.selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    this.value = this.value.substring(0, start) +
      "  " + this.value.substring(end);

    // put caret at right position again
    this.selectionStart =
      this.selectionEnd = start + 1;
  }
});