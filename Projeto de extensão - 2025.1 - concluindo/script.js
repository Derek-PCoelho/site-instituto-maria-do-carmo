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
    
    // Coleta dados do formulário PF com os nomes corretos para a planilha
    const gatherPfData = (form) => {
        const familiares = Array.from(document.querySelectorAll('#composicao-familiar-wrapper .familiar-item'))
            .map(item => {
                const nome = item.querySelector('[name="familiar-nome[]"]').value;
                if (!nome) return null;
                return {
                    nome,
                    parentesco: item.querySelector('[name="familiar-parentesco[]"]').value,
                    idade: item.querySelector('[name="familiar-idade[]"]').value,
                    deficiencia: item.querySelector('[name="familiar-deficiencia[]"]').value,
                    renda: item.querySelector('[name="familiar-renda[]"]').value
                };
            })
            .filter(item => item !== null);

        // Mapeia os nomes do formulário para os nomes das colunas da planilha
        return {
            dataEnvio: new Date().toLocaleString('pt-BR'),
            nome: form['pf-name'].value,
            sexo: form['pf-sexo'].value,
            dataNascimento: form['pf-dob'].value,
            cpf: form['pf-cpf'].value,
            rg: form['pf-rg'].value,
            orgaoExpedidor: form['pf-orgao'].value,
            nis: form['pf-nis'].value,
            escolaridade: form['pf-escolaridade'].value,
            nomeMae: form['pf-mae'].value,
            nomePai: form['pf-pai'].value,
            celular: form['pf-celular'].value,
            telefoneFixo: form['pf-fixo'].value,
            profissao: form['pf-profissao'].value,
            nacionalidade: form['pf-nacionalidade'].value,
            rendaFamiliar: form['pf-renda'].value,
            estadoCivil: form['pf-civil'].value,
            outroMovel: form['pf-outro-movel'].value,
            cep: form['imovel-cep'].value,
            rua: form['imovel-rua'].value,
            bairro: form['imovel-bairro'].value,
            numero: form['imovel-numero'].value,
            quadra: form['imovel-quadra'].value,
            lote: form['imovel-lote'].value,
            matricula: form['imovel-matricula'].value,
            tempoMoradiaAnos: form['imovel-tempo'].value,
            valorVenal: form['imovel-valor'].value,
            tipologia: form['imovel-tipologia'].value,
            areaM2: form['imovel-area'].value,
            observacao: form['imovel-obs'].value,
            memorialDescritivo: form['imovel-memorial'].value,
            composicaoFamiliar: JSON.stringify(familiares, null, 2),
            nomePreenchedor: form['reporter-name'].value,
            cpfPreenchedor: form['reporter-cpf'].value
        };
    };

    // Coleta dados do formulário PJ com os nomes corretos
    const gatherPjData = (form) => {
        return {
            dataEnvio: new Date().toLocaleString('pt-BR'),
            razaoSocial: form['pj-razao-social'].value,
            nomeFantasia: form['pj-nome-fantasia'].value,
            cnpj: form['pj-cnpj'].value,
            enderecoSede: form['pj-address'].value,
            telefoneComercial: form['pj-phone'].value,
            nomeResponsavel: form['pj-responsavel'].value,
            motivoCadastro: form['pj-reason'].value,
        };
    };

    // Função principal para lidar com o envio de formulário
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
        
        const payload = (formType === 'pf') ? gatherPfData(form) : gatherPjData(form);
        
        try {
            const response = await fetch('/.netlify/functions/submit-form', {
                method: 'POST',
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
