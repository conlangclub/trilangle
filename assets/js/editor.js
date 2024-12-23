const input = document.getElementById("input");
const preview = document.getElementById("preview");

const editor = document.getElementById("fancy-editor");
const editorTriangle = document.getElementById("editor-triangle");
const editorSubtriangle = document.getElementById("editor-subtriangle");

let trilangleCode = input.value;

input.addEventListener("input", () => {
  render(trilangleCode);
  updateEditor(trilangleCode);
});
render(trilangleCode);
updateEditor(trilangleCode);

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

    updateEditorField(triangleElem, triangleNbr, 'word', triangle.word);
    updateEditorField(triangleElem, triangleNbr, 'color', triangle.color);
    updateEditorField(triangleElem, triangleNbr, 'level', triangle.level);

    if (triangle.color === 'blue') {
      updateEditorField(triangleElem, triangleNbr, 'dot', triangle.dot);
    } else {
      const dot = triangleElem.querySelector('.editor-dot');
      dot.style.display = 'none';
    }

    editor.appendChild(triangleElem);
  }
}

function updateEditorField(triangleElem, triangleNbr, fieldName, value) {
  const [label, input] = triangleElem.querySelector(`.editor-${fieldName}`).children;
  label.setAttribute('for', `${fieldName}-${triangleNbr}`);
  input.setAttribute('name', `${fieldName}-${triangleNbr}`);
  input.value = value;
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