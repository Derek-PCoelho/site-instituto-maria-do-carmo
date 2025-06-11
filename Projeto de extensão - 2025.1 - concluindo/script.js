document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DO MENU MOBILE ---
    const navToggle = document.querySelector('.nav-toggle');
    const header = document.querySelector('header');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            header.classList.toggle('nav-open');
        });
    }

    // --- LÓGICA DO FORMULÁRIO DE CADASTRO ---
    
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
                    if (form.id === `beneficiary-form-${formId}`) {
                        form.classList.add('active');
                    } else {
                        form.classList.remove('active');
                    }
                });
            });
        });
    }

    // Lógica para adicionar membros da família dinamicamente
    const addFamiliarBtn = document.getElementById('add-familiar-btn');
    if (addFamiliarBtn) {
        addFamiliarBtn.addEventListener('click', () => {
            const wrapper = document.getElementById('composicao-familiar-wrapper');
            const familiarItem = wrapper.querySelector('.familiar-item').cloneNode(true);
            familiarItem.querySelectorAll('input, select').forEach(input => {
                input.value = '';
            });
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
            let hasError = (input.type === 'checkbox') ? !input.checked : !input.veclue.trim();
            if (hasError) {
                isValid = false;
                input.style.borderColor = 'red';
            } else {
                input.style.borderColor = '';
            }
        });
        return isValid;
    };
    
    // Função para lidar com o envio de formulário (apenas validação e feedback)
    const handleFormSubmit = (event) => {
        event.preventDefault(); 
        const form = event.target;

        if (validateForm(form)) {
            showFeedback(form, 'Formulário enviado com sucesso para demonstração!', 'success');
            console.log("Dados capturados:", Object.fromEntries(new FormData(form)));
            form.reset();
            
            if (form.id === 'beneficiary-form-pf') {
                const wrapper = document.getElementById('composicao-familiar-wrapper');
                while(wrapper.children.length > 1) {
                    wrapper.removeChild(wrapper.lastChild);
                }
            }
        } else {
            showFeedback(form, 'Por favor, preencha todos os campos obrigatórios (*).', 'error');
        }
    };

    // Adiciona o listener para ambos os formulários
    document.getElementById('beneficiary-form-pf')?.addEventListener('submit', handleFormSubmit);
    document.getElementById('beneficiary-form-pj')?.addEventListener('submit', handleFormSubmit);
});
