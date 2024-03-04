const input = document.getElementById("input");
const preview = document.getElementById("preview");

input.addEventListener("input", () => render(input.value));
render(input.value);

function render(code) {
  console.log("Asdf")
  let template = document.createElement("template");
  template.innerHTML = code;
  
  let sentence = document.createElement("trilangle-sentence");
  sentence.append(template);
  
  preview.innerHTML = "";
  preview.append(sentence);
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