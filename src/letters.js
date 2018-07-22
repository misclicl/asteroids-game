const fs = require('fs');
const {letters} = require('./js/resources/letters');

const newLetters = {
  letters: {},
};

Object.keys(letters).map((letter) => {
  newLetters.letters[letter] = letters[letter].map((line) => {
    return [
      [Math.round(line[0][0] / 6), Math.round(line[0][1] / 6)],
      [Math.round(line[1][0] / 6), Math.round(line[1][1] / 6)],
    ];
  });
});

fs.writeFile('sybmolsSmall.json', JSON.stringify(newLetters, null, 2));
