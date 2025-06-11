document.addEventListener('DOMContentLoaded', () => {
    // Lógica para alternar entre formulários PF e PJ
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
                    if (form.id === `beneficiary-form-${formId}`) form.classList.add('active');
                    else form.classList.remove('active');
                });
            });
        });
    }

    // Lógica para adicionar membros da família
    const addFamiliarBtn = document.getElementById('add-familiar-btn');
    if (addFamiliarBtn) {
        addFamiliarBtn.addEventListener('click', () => {
            const wrapper = document.getElementById('composicao-familiar-wrapper');
            const familiarItem = wrapper.querySelector('.familiar-item').cloneNode(true);
            familiarItem.querySelectorAll('input, select').forEach(input => input.value = '');
            wrapper.appendChild(familiarItem);
        });
    }

    // Função para mostrar feedback visual no formulário
    const showFeedback = (form, message, type) => {
        let feedbackEl = form.querySelector('.feedback');
        if (!feedbackEl) {
            feedbackEl = document.createElement('div');
            form.prepend(feedbackEl);
        }
        feedbackEl.className = `feedback ${type}`;
        feedbackEl.textContent = message;
    };

    // Função para validar um formulário
    const validateForm = (form) => {
        let isValid = true;
        form.querySelectorAll('[required]').forEach(input => {
            let hasError = (input.type === 'checkbox') ? !input.checked : !input.value.trim();
            if (hasError) {
                isValid = false;
                input.style.borderColor = 'red';
            } else {
                input.style.borderColor = '';
            }
        });
        return isValid;
    };
    
    // Função para lidar com o envio de formulário
    const handleFormSubmit = async (event, formType) => {
        event.preventDefault();
        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');

        if (!validateForm(form)) {
            showFeedback(form, 'Por favor, preencha todos os campos obrigatórios (*).', 'error');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        showFeedback(form, 'Aguarde, enviando seu cadastro...', 'loading');

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        payload.dataEnvio = new Date().toLocaleString('pt-BR');

        // LÓGICA CORRIGIDA PARA "COMPOSIÇÃO FAMILIAR"
        if (formType === 'pf') {
            const familiares = Array.from(document.querySelectorAll('#composicao-familiar-wrapper .familiar-item'))
                .map(item => {
                    const nome = item.querySelector('[name="familiar-nome[]"]').value;
                    if (!nome) return null; // Ignora linhas de familiares vazias
                    
                    // Cria um objeto para cada familiar
                    return {
                        nome: nome,
                        parentesco: item.querySelector('[name="familiar-parentesco[]"]').value,
                        idade: item.querySelector('[name="familiar-idade[]"]').value,
                        deficiencia: item.querySelector('[name="familiar-deficiencia[]"]').value,
                        renda: item.querySelector('[name="familiar-renda[]"]').value
                    };
                })
                .filter(item => item !== null); // Remove as linhas vazias da lista

            // Converte a lista de objetos em um texto JSON formatado
            payload.composicaoFamiliar = JSON.stringify(familiares, null, 2);

            // Remove os campos individuais que já foram agrupados no JSON
            delete payload['familiar-nome[]'];
            delete payload['familiar-parentesco[]'];
            delete payload['familiar-idade[]'];
            delete payload['familiar-deficiencia[]'];
            delete payload['familiar-renda[]'];
        }
        
        try {
            const response = await fetch('/.netlify/functions/submit-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    sheetName: `beneficiarios_${formType}`,
                    payload: payload 
                }),
            });

            if (!response.ok) {
                throw new Error('O servidor respondeu com um erro.');
            }

            showFeedback(form, 'Cadastro enviado com sucesso! Seus dados foram salvos.', 'success');
            form.reset();
            if (formType === 'pf') {
                const wrapper = document.getElementById('composicao-familiar-wrapper');
                while(wrapper.children.length > 1) {
                    wrapper.removeChild(wrapper.lastChild);
                }
            }
        } catch (error) {
            console.error('Erro no envio:', error);
            showFeedback(form, 'Ocorreu um erro ao enviar o cadastro. Tente novamente mais tarde.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Cadastro';
        }
    };

    // Adiciona os listeners para ambos os formulários
    document.getElementById('beneficiary-form-pf')?.addEventListener('submit', (e) => handleFormSubmit(e, 'pf'));
    document.getElementById('beneficiary-form-pj')?.addEventListener('submit', (e) => handleFormSubmit(e, 'pj'));
});
