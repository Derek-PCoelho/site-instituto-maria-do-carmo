document.addEventListener('DOMContentLoaded', () => {
    // Lógica para alternar abas
    const tabLinks = document.querySelectorAll('.tab-link');
    const beneficiaryForms = document.querySelectorAll('.beneficiary-form');
    if (tabLinks.length > 0) {
        tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                const formId = link.dataset.form;
                tabLinks.forEach(item => item.classList.remove('active'));
                link.classList.add('active');
                beneficiaryForms.forEach(form => {
                    form.style.display = form.id === `beneficiary-form-${formId}` ? 'block' : 'none';
                });
            });
        });
    }

    // Função para mostrar feedback
    const showFeedback = (form, message, type) => {
        let feedbackEl = form.querySelector('.feedback');
        if (!feedbackEl) {
            feedbackEl = document.createElement('div');
            form.prepend(feedbackEl);
        }
        feedbackEl.className = `feedback ${type}`;
        feedbackEl.textContent = message;
    };

    // Função principal de envio (VERSÃO DETETIVE)
    const handleFormSubmit = async (event, formType) => {
        event.preventDefault();
        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        
        console.clear(); // Limpa o console para um novo teste
        showFeedback(form, "Iniciando envio... Verifique o console (F12).", "loading");
        console.log("Iniciando envio do formulário...");

        const payload = { dataEnvio: new Date().toLocaleString('pt-BR'), nome: "Teste" }; // Dados de teste simples
        const sheetName = `beneficiarios_${formType}`;

        try {
            const endpoint = '/.netlify/functions/submit-form';
            console.log(`Tentando fazer 'fetch' para o endpoint: ${endpoint}`);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sheetName, payload }),
            });

            console.log("--- RESPOSTA DO SERVIDOR RECEBIDA ---");
            console.log(`Status da Resposta: ${response.status} ${response.statusText}`);
            console.log(`Resposta OK? (response.ok): ${response.ok}`);
            
            const responseBody = await response.text();
            console.log("Corpo da Resposta (o que o servidor enviou de volta):");
            console.log(responseBody);

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            showFeedback(form, 'Sucesso! Resposta recebida do servidor. Verifique a planilha.', 'success');

        } catch (error) {
            console.error("--- ERRO DETALHADO NO ENVIO ---", error);
            showFeedback(form, `Falha na conexão. Veja o console (F12) para detalhes. Erro: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
        }
    };

    // Adiciona os listeners
    document.getElementById('beneficiary-form-pf')?.addEventListener('submit', (e) => handleFormSubmit(e, 'pf'));
    document.getElementById('beneficiary-form-pj')?.addEventListener('submit', (e) => handleFormSubmit(e, 'pj'));
});
