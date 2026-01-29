/**
 * Обработка функционала страницы контактов для Django
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeContactForm();
    initializeModal();
});

function initializeMap() {
    if (typeof ymaps === 'undefined' || !document.getElementById('map')) {
        return;
    }

    ymaps.ready(function() {
        const map = new ymaps.Map('map', {
            center: [59.9386, 30.3141],
            zoom: 11,
            controls: ['zoomControl']
        }, {
            suppressMapOpenBlock: true
        });

        const coverageAreaCoords = [[59.815936, 30.378236], [59.816428, 30.382851], [59.818053, 30.398876],
            [59.818410, 30.401977], [59.818866, 30.404879], [59.819486, 30.407937], [59.820541, 30.412807],
            [59.821703, 30.417818], [59.824469, 30.429950], [59.824469, 30.429950], [59.825325, 30.433192],
            [59.825681, 30.434282], [59.826087, 30.435217], [59.826515, 30.436151], [59.827263, 30.437524],
            [59.830257, 30.441630], [59.837347, 30.451157], [59.838993, 30.452913], [59.841130, 30.454937],
            [59.844132, 30.456911], [59.845814, 30.458052], [59.846892, 30.459290], [59.846431, 30.461337],
            [59.822652, 30.525012], [59.804402, 30.576847], [59.809853, 30.594042], [59.813664, 30.590212],
            [59.817331, 30.582267], [59.820665, 30.572668], [59.823070, 30.562737], [59.824805, 30.559651],
            [59.826900, 30.557571], [59.832994, 30.558469], [59.833959, 30.558456], [59.834805, 30.557173],
            [59.835132, 30.555860], [59.834753, 30.552069], [59.834456, 30.551951], [59.831879, 30.540355],
            [59.831820, 30.537272], [59.832206, 30.532094], [59.835013, 30.521005], [59.841005, 30.509889],
            [59.842824, 30.499429], [59.842601, 30.498190], [59.842987, 30.495417], [59.844977, 30.489353],
            [59.847901, 30.488027], [59.847901, 30.488027], [59.853986, 30.489937], [59.854230, 30.496352],
            [59.854807, 30.504449], [59.855946, 30.508429], [59.864411, 30.525866], [59.873230, 30.522762],
            [59.870023, 30.513976], [59.872398, 30.511995], [59.886431, 30.500933], [59.892482, 30.523998],
            [59.892482, 30.523998], [59.916168, 30.525361], [59.916168, 30.525361], [59.922988, 30.528223],
            [59.924729, 30.518925], [59.945589, 30.521437], [59.945869, 30.511642], [59.970675, 30.513577],
            [59.975327, 30.537782], [59.980999, 30.518067], [59.983158, 30.500223], [59.986274, 30.490732],
            [59.991011, 30.482374], [59.998861, 30.476596], [60.007508, 30.475990], [60.013852, 30.470177],
            [60.021010, 30.454993], [60.034853, 30.441099], [60.040520, 30.438411], [60.044787, 30.447213],
            [60.033890, 30.485078], [60.034399, 30.496001], [60.078820, 30.496683], [60.080493, 30.462229],
            [60.071431, 30.456139], [60.069998, 30.424137], [60.049633, 30.417643], [60.056107, 30.395061],
            [60.060752, 30.389026], [60.084645, 30.377657], [60.090387, 30.370770], [60.093590, 30.360892],
            [60.097119, 30.306013], [60.099589, 30.281401], [60.091356, 30.243099], [60.083864, 30.209716],
            [60.081580, 30.197369], [60.077129, 30.184349], [60.066121, 30.167696], [60.060621, 30.153285],
            [60.059055, 30.143981], [60.044459, 30.152345], [60.039181, 30.164179], [60.037357, 30.178828],
            [60.021489, 30.219129], [60.013272, 30.202690], [60.008077, 30.199761], [59.994044, 30.192356],
            [59.989726, 30.184574], [59.989726, 30.184574], [59.981685, 30.193021], [59.979252, 30.203889],
            [59.973221, 30.209947], [59.969314, 30.213546], [59.964717, 30.214765], [59.960287, 30.187933],
            [59.952465, 30.183243], [59.944348, 30.178250], [59.931515, 30.192932], [59.928420, 30.202382],
            [59.928075, 30.210569], [59.905632, 30.206860], [59.885417, 30.175740], [59.864510, 30.146522],
            [59.862612, 30.124619], [59.848814, 30.125000], [59.853041, 30.090670], [59.833789, 30.091763],
            [59.830257, 30.104304], [59.827118, 30.122540], [59.825195, 30.142576], [59.823628, 30.183802],
            [59.799208, 30.156075], [59.799574, 30.160783], [59.801462, 30.170590], [59.807954, 30.179984],
            [59.810713, 30.189238], [59.812701, 30.199674], [59.812701, 30.199674], [59.824109, 30.226441],
            [59.834571, 30.269707], [59.834649, 30.274251], [59.833929, 30.280342], [59.830287, 30.287251],
            [59.813931, 30.260692], [59.815983, 30.286687], [59.803929, 30.323207], [59.803929, 30.323207],
            [59.793628, 30.351937], [59.798415, 30.404622], [59.815314, 30.371611], [59.815936, 30.378236],
        ];

        const coveragePolygon = new ymaps.Polygon([coverageAreaCoords], {}, {
            strokeColor: "#d2a8e1",
            strokeWidth: 3,
            fillColor: "rgba(210, 168, 225, 0.8)",
            fillOpacity: 0.8,
        });

        const placemark = new ymaps.Placemark([59.9386, 30.3141], {
            hintContent: 'Возможны встречи в любых районах Санкт-Петербурга',
            balloonContent: 'Санкт-Петербург'
        }, {
            iconLayout: 'default#image',
            iconImageHref: '/static/images/map-marker.svg',
            iconImageSize: [25, 25],
            iconImageOffset: [-12, -25]
        });

        map.geoObjects.add(coveragePolygon);
        map.geoObjects.add(placemark);

        map.setBounds(map.geoObjects.getBounds(), {
            checkZoomRange: true,
            zoomMargin: 50
        });
    });
}

function initializeContactForm() {
    const form = document.getElementById('contact-form');

    if (!form) return;

    // Валидация поля контакта
    const contactInput = form.querySelector('[name="contact"]');
    if (contactInput) {
        contactInput.addEventListener('input', function() {
            validateContactField(this);
        });
    }

    // AJAX отправка формы
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm(form)) {
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        setButtonLoadingState(submitBtn, true);

        try {
            const formData = new FormData(form);
            const response = await submitFormData(formData);

            if (response.success) {
                showSuccessModal(response.message || 'Сообщение отправлено успешно!');
                form.reset();
            } else {
                showError(response.message || 'Ошибка отправки формы');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            showError('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.');
        } finally {
            setButtonLoadingState(submitBtn, false, originalText);
        }
    });
}

function validateContactField(input) {
    const value = input.value.trim();
    const pattern = /^(?:@\w{5,32}|[^@\s]+@[^@\s]+\.[^@\s]+)$/;

    if (value && !pattern.test(value)) {
        input.setCustomValidity('Введите Telegram (@username) или Email');
        input.reportValidity();
        return false;
    } else {
        input.setCustomValidity('');
        return true;
    }
}

function validateForm(form) {
    const contactInput = form.querySelector('[name="contact"]');
    if (contactInput && !validateContactField(contactInput)) {
        return false;
    }

    return form.checkValidity();
}

async function submitFormData(formData) {
    // Добавляем CSRF токен для Django
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    if (csrfToken) {
        formData.append('csrfmiddlewaretoken', csrfToken);
    }

    const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

function setButtonLoadingState(button, isLoading, originalText = null) {
    if (isLoading) {
        button.disabled = true;
        button.textContent = 'Отправка...';
        button.classList.add('loading');
    } else {
        button.disabled = false;
        button.textContent = originalText || 'Отправить';
        button.classList.remove('loading');
    }
}

function showSuccessModal(message) {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showError(message) {
    alert(message);
}

function initializeModal() {
    const modal = document.getElementById('successModal');
    if (!modal) return;

    const closeModal = modal.querySelector('.modal-close');
    const confirmBtn = modal.querySelector('.modal-confirm');

    function closeModalHandler() {
        modal.style.display = 'none';
    }

    if (closeModal) {
        closeModal.addEventListener('click', closeModalHandler);
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', closeModalHandler);
    }

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModalHandler();
        }
    });
}

// Маска для телефона (если используется телефон)
function initializePhoneMask() {
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput) {
        const maskOptions = {
            mask: '+7 (000) 000-00-00'
        };
        // Здесь можно подключить библиотеку IMask
        // IMask(phoneInput, maskOptions);
    }
}