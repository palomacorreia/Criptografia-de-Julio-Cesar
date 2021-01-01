const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const FormData = require('form-data');


const decifra = (string, shift) => {
  let deciphered = '';

  for (let i = 0; i < string.length; i++) {
    const value = string[i].charCodeAt();
    if (value >= 97 && value <= 122) {
      const index = (value - 97 - shift) % 26;
      if (index < 0) deciphered += String.fromCharCode(123 + index);
      else deciphered += String.fromCharCode(index + 97);
    } else {
      deciphered += String.fromCharCode(value);
    }
  }

  return deciphered;
};

console.log("Começa requisição...");
axios.get("https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=71012e1e56512f689b2a992c31fb361dd2c25e12")
  .then(ret => {
    const message = ret.data;

    message.decifrado = decifra(message.cifrado, message.numero_casas);
    console.log("DECIFRADO", message.decifrado);
    message.resumo_criptografico = crypto.createHash('sha1').update(message.decifrado).digest('hex');

    console.log("Cria arquivo answer.json");
    fs.writeFileSync("answer.json", JSON.stringify(message));
    console.log(message);
    console.log("MESSAGE", message.decifrado);
    console.log("Fazendo post de answer");

    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    const answer = new FormData();
    answer.append('answer', fs.createReadStream('answer.json'));
    console.log("aswer", answer);
    return axios.post(
      'https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=71012e1e56512f689b2a992c31fb361dd2c25e12',
      answer,
      { headers: answer.getHeaders(), },
    );
  })
  .then(_ => {
    console.log("Post realizado com sucesso");
  })
  .catch(err => {
    console.log(err);
  })
  .then(_ => {
    console.log("Apaga arquivo answer.json");
    fs.unlinkSync("answer.json");
    console.log("Fim do Programa!");
  })
