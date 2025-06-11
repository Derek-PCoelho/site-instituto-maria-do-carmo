const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async (event) => {
  // Permite apenas requisições do tipo POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);

    // Autenticação com as credenciais salvas no Netlify
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo(); // Carrega as informações e abas da planilha

    const data = JSON.parse(event.body);
    const sheet = doc.sheetsByTitle[data.sheetName]; // Seleciona a aba correta ('beneficiarios_pf' ou 'beneficiarios_pj')

    if (!sheet) {
      throw new Error(`Aba da planilha "${data.sheetName}" não encontrada.`);
    }

    // Adiciona uma nova linha com os dados recebidos do formulário
    await sheet.addRow(data.payload);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Dados enviados com sucesso!" }),
    };
  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Ocorreu um erro interno ao salvar os dados." }),
    };
  }
};