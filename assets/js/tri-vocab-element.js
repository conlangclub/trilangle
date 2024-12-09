const orthography = {
  'e': 'ᐁ', 'i': 'ᐃ', 'o': 'ᐅ', 'a': 'ᐊ', 
  'ke': 'ᑫ', 'ki': 'ᑭ', 'ko': 'ᑯ', 'ka': 'ᑲ', 
  'tse': 'ᒉ', 'tsi': 'ᒋ', 'tso': 'ᒍ', 'tsa': 'ᒐ', 
  'me': 'ᒣ', 'mi': 'ᒥ', 'mo': 'ᒧ', 'ma': 'ᒪ', 
  'ne': 'ᓀ', 'ni': 'ᓂ', 'no': 'ᓄ', 'na': 'ᓇ', 
  'se': 'ᓭ', 'si': 'ᓯ', 'so': 'ᓱ', 'sa': 'ᓴ', 
  'je': 'ᔦ', 'ji': 'ᔨ', 'jo': 'ᔪ', 'ja': 'ᔭ', 
  'tʼe': 'ᗢ', 'tʼi': 'ᗣ', 'tʼo': 'ᗤ', 'tʼa': 'ᗧ', 
  'we': 'ᗐ', 'wi': 'ᗑ', 'wo': 'ᗒ', 'wa': 'ᗕ', 
  'k': 'ᐠ', 'ts': 'ᐨ', 'm': 'ᒾ', 'n': 'ᐣ', 's': 'ᐢ', 'j': 'ᐧ', 'tʼ': 'ᐟ', 'w': 'ᐤ', 'r': 'ᕑ'
}

class TriVocab extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const orthographic = this.textContent.split(' ')
      .map(char => orthography[char])
      .join('');
    this.textContent = orthographic;
  }
}

customElements.define("tri-vocab", TriVocab);