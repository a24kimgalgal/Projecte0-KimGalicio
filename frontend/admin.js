if (sessionStorage.getItem('isAdmin') !== 'true') {
    window.location.href = 'index.html';
}

const ADMIN_EMAIL = 'admin@gmail.com';
const adminState = {
    editingId: null,
    questions: []
};

const adminQuestionsBody = document.getElementById('admin-questions-body');
const adminQuestionForm = document.getElementById('admin-question-form');
const adminFormTitle = document.getElementById('admin-form-title');
const adminSubmitBtn = document.getElementById('admin-submit-btn');
const adminCancelBtn = document.getElementById('admin-cancel-btn');
const btnNovaPregunta = document.getElementById('btn-nova-pregunta');
const btnVolverJuego = document.getElementById('btn-volver-juego');

function resetFormulariAdmin() {
    if (!adminQuestionForm) return;

    adminQuestionForm.reset();
    adminState.editingId = null;
    adminFormTitle.textContent = 'Crear pregunta';
    adminSubmitBtn.textContent = 'Guardar pregunta';
    document.getElementById('question-id').value = '';
    const primerRadio = document.querySelector('input[name="correcta"][value="0"]');
    if (primerRadio) primerRadio.checked = true;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function carregarPreguntesAdmin() {
    try {
        const response = await fetch('/api/questions');
        if (!response.ok) {
            throw new Error('Error carregant preguntes');
        }

        const questions = await response.json();
        adminState.questions = Array.isArray(questions) ? questions : [];
        renderPreguntesAdmin();
    } catch (error) {
        console.error(error);
        if (adminQuestionsBody) {
            adminQuestionsBody.innerHTML = '<tr><td colspan="3">No s’han pogut carregar les preguntes.</td></tr>';
        }
    }
}

function renderPreguntesAdmin() {
    if (!adminQuestionsBody) return;

    if (!adminState.questions.length) {
        adminQuestionsBody.innerHTML = '<tr><td colspan="3">No hi ha preguntes disponibles.</td></tr>';
        return;
    }

    adminQuestionsBody.innerHTML = adminState.questions.map((pregunta) => {
        const imatgeHtml = pregunta.imatge
            ? `<img src="${pregunta.imatge}" alt="Imatge de la pregunta" class="admin-thumb">`
            : '<span>No</span>';

        return `
            <tr>
                <td class="question-cell">${escapeHtml(pregunta.pregunta || '')}</td>
                <td>${imatgeHtml}</td>
                <td>
                    <div class="admin-actions">
                        <button type="button" class="btn btn-outline-primary btn-edit" data-id="${pregunta.id}">Editar</button>
                        <button type="button" class="btn btn-danger btn-delete" data-id="${pregunta.id}">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    adminQuestionsBody.querySelectorAll('.btn-edit').forEach((button) => {
        button.addEventListener('click', () => prepararEdicioPregunta(Number(button.dataset.id)));
    });

    adminQuestionsBody.querySelectorAll('.btn-delete').forEach((button) => {
        button.addEventListener('click', () => esborrarPregunta(Number(button.dataset.id)));
    });
}

async function esborrarPregunta(id) {
    const pregunta = adminState.questions.find((item) => Number(item.id) === Number(id));
    if (!pregunta) return;

    const confirmar = window.confirm(`Vols eliminar la pregunta: "${pregunta.pregunta}"?`);
    if (!confirmar) return;

    try {
        const response = await fetch(`/api/questions/${id}`, {
            method: 'DELETE',
            headers: {
                'x-admin-email': ADMIN_EMAIL
            }
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.error || 'No s’ha pogut eliminar la pregunta');
        }

        alert(data.message || 'Pregunta eliminada correctament');
        carregarPreguntesAdmin();
        if (adminState.editingId === id) {
            resetFormulariAdmin();
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function prepararEdicioPregunta(id) {
    const pregunta = adminState.questions.find((item) => Number(item.id) === Number(id));
    if (!pregunta) return;

    adminState.editingId = Number(id);
    document.getElementById('question-id').value = String(id);
    document.getElementById('pregunta-text').value = pregunta.pregunta || '';

    const options = [
        pregunta.resposta_correcta,
        ...(pregunta.respostes_incorrectes || [])
    ];

    const correctAnswer = pregunta.resposta_correcta || options[0];

    document.getElementById('opcio-1').value = options[0] || '';
    document.getElementById('opcio-2').value = options[1] || '';
    document.getElementById('opcio-3').value = options[2] || '';
    document.getElementById('opcio-4').value = options[3] || '';

    const correctIndex = options.findIndex((option) => option === correctAnswer);
    const radioIndex = correctIndex >= 0 ? correctIndex : 0;
    const radioToSelect = document.querySelector(`input[name="correcta"][value="${radioIndex}"]`);
    if (radioToSelect) radioToSelect.checked = true;

    adminFormTitle.textContent = 'Editar pregunta';
    adminSubmitBtn.textContent = 'Guardar canvis';
    document.getElementById('question-image').value = '';
}

adminQuestionForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const pregunta = document.getElementById('pregunta-text').value.trim();
    const opcions = [
        document.getElementById('opcio-1').value.trim(),
        document.getElementById('opcio-2').value.trim(),
        document.getElementById('opcio-3').value.trim(),
        document.getElementById('opcio-4').value.trim()
    ];

    const correcteValue = Number(document.querySelector('input[name="correcta"]:checked')?.value ?? 0);
    if (!pregunta || opcions.some((option) => !option)) {
        alert('Tots els camps són obligatoris');
        return;
    }

    const respostaCorrecta = opcions[correcteValue];
    const respostesIncorrectes = opcions.filter((_, index) => index !== correcteValue);

    const formData = new FormData();
    formData.append('pregunta', pregunta);
    formData.append('resposta_correcta', respostaCorrecta);
    formData.append('respostes_incorrectes', JSON.stringify(respostesIncorrectes));

    const imageInput = document.getElementById('question-image');
    if (imageInput && imageInput.files && imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    const method = adminState.editingId ? 'PUT' : 'POST';
    const url = adminState.editingId ? `/api/questions/${adminState.editingId}` : '/api/questions';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'x-admin-email': ADMIN_EMAIL
            },
            body: formData
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.error || 'No s’ha pogut guardar la pregunta');
        }

        alert(data.message || 'Pregunta guardada correctament');
        resetFormulariAdmin();
        carregarPreguntesAdmin();
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});

if (btnNovaPregunta) {
    btnNovaPregunta.addEventListener('click', () => {
        resetFormulariAdmin();
        document.getElementById('pregunta-text').focus();
    });
}

if (adminCancelBtn) {
    adminCancelBtn.addEventListener('click', () => {
        resetFormulariAdmin();
    });
}

if (btnVolverJuego) {
    btnVolverJuego.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

resetFormulariAdmin();
carregarPreguntesAdmin();
