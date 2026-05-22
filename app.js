/**
 * Écurie du Val d'Or - Core Javascript Library (Multi-page Edition)
 * Handles: Sticky Header, Mobile Navigation, Filters, Dynamic Horse Modals,
 * URL-parameter prefilling, Contact Form, and dynamic rendering from localStorage.
 *
 * ADMIN PANEL: Horses are managed via control-panel.html and stored in localStorage.
 * This file reads that data and renders the catalog dynamically on sales.html & index.html.
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize Lucide Icons (Universal)
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ==========================================================================
    // STICKY HEADER SCROLL EFFECT (Universal)
    // ==========================================================================
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ==========================================================================
    // MOBILE NAV MENU (Universal)
    // ==========================================================================
    const mobileMenuBtn    = document.querySelector('.mobile-menu-btn');
    const mobileMenuClose  = document.querySelector('.mobile-menu-close');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileLinks      = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn && mobileMenuClose && mobileNavOverlay) {
        const openMobileMenu  = () => { mobileNavOverlay.classList.add('open');    document.body.style.overflow = 'hidden'; };
        const closeMobileMenu = () => { mobileNavOverlay.classList.remove('open'); document.body.style.overflow = ''; };

        mobileMenuBtn.addEventListener('click', openMobileMenu);
        mobileMenuClose.addEventListener('click', closeMobileMenu);
        mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
    }

    // ==========================================================================
    // DEFAULT HORSE DATASET (Seed for localStorage on first visit)
    // ==========================================================================
    const DEFAULT_HORSES = {
        celeste: {
            id: "celeste", name: "Céleste du Val",
            category: "Sport / CSO", tagClass: "category-sport",
            breed: "Selle Français", gender: "Jument", color: "Gris",
            age: 7, height: "1m68",
            level: "Amateur Elite (Galop 6/7)", discipline: "CSO / Dressage",
            price: "18 000 €",
            image: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=800",
            father: "Diamant de Semilly", mother: "Ocarina du Val (par Almé)",
            temperament: "Volontaire, courageuse, respectueuse des barres, sang très bien équilibré.",
            description: "Céleste est une fille de Diamant de Semilly avec beaucoup de chic. Dotée d'un excellent coup de saut, d'une grande intelligence de la barre et de trois belles allures, elle est idéale pour un cavalier amateur encadré souhaitant se faire plaisir sur des épreuves de 1m15 à 1m25. Très facile au quotidien, voyage très bien, tondue sans soucis."
        },
        helios: {
            id: "helios", name: "Hélios d'Or",
            category: "Loisir / Extérieur", tagClass: "category-loisir",
            breed: "Origine Constatée (palomino)", gender: "Hongre", color: "Palomino",
            age: 9, height: "1m62",
            level: "Tout niveau (idéal à partir de Galop 2/3)", discipline: "Randonnée / Loisir polyvalent",
            price: "7 500 €",
            image: "https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=800",
            father: "Inconnu (Étalon agréé)", mother: "Bella d'Or (par Anglo-Arabe)",
            temperament: "Doux, extrêmement franc, serein, passe-partout, curieux et affectueux.",
            description: "Hélios est le cheval de famille par excellence. Avec sa robe dorée magnifique, il brille autant par sa beauté que par sa gentillesse. Très franc, il sort seul ou en groupe en extérieur, passe dans l'eau, traverse les ponts et ne craint pas la circulation. Il possède également de bonnes bases sur le plat et adore travailler à pied."
        },
        symphonie: {
            id: "symphonie", name: "Symphonie Silver",
            category: "Poney", tagClass: "category-poney",
            breed: "Connemara (Papiers pleins)", gender: "Jument", color: "Gris",
            age: 4, height: "1m46",
            level: "Jeune poney prometteur (Galop 5 encadré)", discipline: "CSO Poney / CCE / Loisir",
            price: "9 500 €",
            image: "https://images.unsplash.com/photo-1485727749890-40be00dcd250?auto=format&fit=crop&q=80&w=800",
            father: "Silver Shadow", mother: "Melody de l'Éden (par Dexter Leam Pondi)",
            temperament: "Très intelligente, agile, appliquée, avec un très bon tempérament.",
            description: "Symphonie est une superbe jeune ponette Connemara. Fille du célèbre Silver Shadow, elle présente un geste à l'obstacle exceptionnel et une grande souplesse. Débourrée à l'automne dernier, elle est très respectueuse de l'homme, apprend très vite et montre d'excellentes dispositions pour le CSO ou le CCE poney."
        },
        zephyr: {
            id: "zephyr", name: "Zéphyr de Vandel",
            category: "Reconversion", tagClass: "category-reconversion",
            breed: "Trotteur Français (Réformé des courses)", gender: "Hongre", color: "Bai",
            age: 5, height: "1m64",
            level: "Cavalier régulier (Niveau Galop 4 minimum)", discipline: "Loisir / Balade / Travail sur le plat",
            price: "3 800 €",
            image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&q=80&w=800",
            father: "Love You", mother: "Tzigane de Vandel",
            temperament: "Sociable, proche de l'homme, à l'écoute, apprend le galop avec beaucoup de bonne volonté.",
            description: "Zéphyr est un adorable trotteur réformé n'ayant jamais résumé d'aptitude en course. Très serein, il a suivi notre programme complet de reconversion de 4 mois. Il a validé le débourrage de selle, la désensibilisation en extérieur et les bases de travail sur le plat. Très attachant."
        }
    };

    const ACTIVITIES_INFO = {
        "centre-equestre": {
            subject: "Inscription / Renseignements - Centre Équestre",
            message: "Bonjour,\n\nJe souhaiterais obtenir des informations concernant les cours, les tarifs ou les stages proposés par votre centre équestre.\n\nMon profil :\n- Nombre de cavaliers : [Ex: 1]\n- Âge(s) : [Ex: Adulte ou Enfant 8 ans]\n- Niveau équestre : [Ex: Débutant ou Galop 4]\n\nMerci de me recontacter pour m'indiquer les créneaux disponibles. Cordialement."
        },
        "randonnee": {
            subject: "Réservation - Balade ou Randonnée équestre",
            message: "Bonjour,\n\nJe souhaiterais réserver une promenade équestre au sein de votre domaine forestier.\n\nDétails de ma demande :\n- Activité souhaitée : [Ex: Balade 2h ou Randonnée journée]\n- Nombre de participants : [Ex: 2 personnes]\n- Niveau équestre des participants : [Ex: Débutants ou Cavaliers réguliers]\n- Date souhaitée : [Ex: Samedi prochain]\n\nMerci de m'indiquer vos disponibilités. Cordialement."
        },
        "elevage": {
            subject: "Renseignement - Élevage de Prestige",
            message: "Bonjour,\n\nJe m'intéresse à votre élevage de chevaux de sport et poneys Connemara. Je souhaiterais en savoir plus sur :\n[Indiquez si vous recherchez un poulain au sevrage, un jeune cheval en cours d'élevage, ou si vous souhaitez en savoir plus sur une lignée spécifique].\n\nMerci pour vos conseils. Cordialement."
        },
        "reconversion": {
            subject: "Renseignement - Programme de Reconversion",
            message: "Bonjour,\n\nJe m'intéresse de près à votre programme d'éthique et de reconversion pour chevaux réformés des courses (Trotteurs/Pur-sangs).\n\nJe souhaiterais obtenir plus de détails concernant :\n[Indiquez si vous souhaitez confier un cheval à la reconversion, ou si vous recherchez un réformé rééduqué pour du loisir].\n\nMerci pour votre retour. Cordialement."
        }
    };

    // ==========================================================================
    // LOCALSTORAGE HELPERS
    // ==========================================================================
    function getHorsesFromStorage() {
        try {
            const data = localStorage.getItem('ecurie_horses_data');
            if (!data) {
                localStorage.setItem('ecurie_horses_data', JSON.stringify(DEFAULT_HORSES));
                return DEFAULT_HORSES;
            }
            return JSON.parse(data);
        } catch (e) {
            return DEFAULT_HORSES;
        }
    }

    function getCategorySlug(category) {
        if (!category) return 'sport';
        if (category.includes('Loisir'))       return 'loisir';
        if (category.includes('Poney'))        return 'poney';
        if (category.includes('Reconversion')) return 'reconversion';
        return 'sport';
    }

    function getAgeCategory(age) {
        const n = parseInt(age);
        if (n < 5)  return 'jeune';
        if (n <= 10) return 'adulte';
        return 'experience';
    }

    function getPriceCategory(priceStr) {
        const num = parseInt(String(priceStr).replace(/[^0-9]/g, ''));
        if (num < 8000)  return 'low';
        if (num <= 15000) return 'medium';
        return 'high';
    }

    function truncate(str, max) {
        if (!str) return '';
        return str.length > max ? str.substring(0, max) + '...' : str;
    }

    /**
     * Builds the HTML for a horse card.
     * @param {Object} horse - Horse data object
     * @param {boolean} withFilters - Whether to add data-category/age/price attributes (sales page only)
     * @param {boolean} isLink - If true, "Voir la fiche" is an <a> tag linking to sales.html; otherwise a <button>
     */
    function buildHorseCard(horse, withFilters, isLink) {
        const catSlug  = getCategorySlug(horse.category);
        const ageCat   = getAgeCategory(horse.age);
        const priceCat = getPriceCategory(horse.price);
        const excerpt  = truncate(horse.description, 135);

        const filterAttrs = withFilters
            ? `data-category="${catSlug}" data-age-cat="${ageCat}" data-price-cat="${priceCat}"`
            : '';

        const levelShort = horse.level ? horse.level.split('(')[0].trim() : '';

        const cta = isLink
            ? `<a href="sales.html?horse=${horse.id}" class="btn btn-outline btn-sm">Voir la fiche</a>`
            : `<button class="btn btn-outline btn-sm view-details-btn" data-id="${horse.id}">Voir la fiche</button>`;

        return `
            <div class="horse-card" ${filterAttrs} data-id="${horse.id}">
                <div class="horse-image-wrapper">
                    <img src="${horse.image}" alt="${horse.name}" class="horse-img" loading="lazy">
                    <span class="horse-tag ${horse.tagClass || getCategorySlug(horse.category)}">${horse.category}</span>
                </div>
                <div class="horse-content">
                    <h3 class="horse-name">${horse.name}</h3>
                    <span class="horse-breed">${horse.breed} • ${horse.gender} ${horse.color}</span>
                    <div class="horse-meta">
                        <span class="meta-item"><i data-lucide="calendar"></i> ${horse.age} ans</span>
                        <span class="meta-item"><i data-lucide="arrow-up-right"></i> ${horse.height}</span>
                        ${withFilters ? `<span class="meta-item"><i data-lucide="shield"></i> ${levelShort}</span>` : ''}
                    </div>
                    <p class="horse-excerpt">${excerpt}</p>
                    <div class="horse-footer">
                        <span class="horse-price">${horse.price}</span>
                        ${cta}
                    </div>
                </div>
            </div>`;
    }

    // ==========================================================================
    // RENDER SALES PAGE — Dynamic catalog from localStorage (sales.html)
    // ==========================================================================
    const horsesGrid = document.getElementById('horses-grid');

    if (horsesGrid) {
        const horses     = getHorsesFromStorage();
        const horseList  = Object.values(horses);

        if (horseList.length === 0) {
            horsesGrid.innerHTML = `
                <div class="no-results" style="display:flex;">
                    <i data-lucide="inbox" class="no-results-icon"></i>
                    <h3>Aucun cheval disponible en ce moment</h3>
                    <p>Notre catalogue est régulièrement mis à jour. N'hésitez pas à revenir prochainement ou à nous contacter directement.</p>
                </div>`;
        } else {
            horsesGrid.innerHTML = horseList.map(h => buildHorseCard(h, true, false)).join('');
        }

        if (typeof lucide !== 'undefined') lucide.createIcons({ node: horsesGrid });

        // ------------------------------------------------------------------
        // FILTER SYSTEM (works via event delegation — cards are dynamic)
        // ------------------------------------------------------------------
        const filterButtons  = document.querySelectorAll('.filter-btn');
        const ageSelect      = document.getElementById('filter-age');
        const priceSelect    = document.getElementById('filter-price');
        const noResults      = document.getElementById('no-results');
        const resetFiltersBtn = document.getElementById('reset-filters-btn');

        let activeCategory = 'all';
        let activeAge      = 'all';
        let activePrice    = 'all';

        const applyFilters = () => {
            let count = 0;
            horsesGrid.querySelectorAll('.horse-card').forEach(card => {
                const ok =
                    (activeCategory === 'all' || card.dataset.category === activeCategory) &&
                    (activeAge      === 'all' || card.dataset.ageCat    === activeAge)      &&
                    (activePrice    === 'all' || card.dataset.priceCat  === activePrice);
                card.classList.toggle('hidden', !ok);
                if (ok) count++;
            });
            if (noResults) noResults.classList.toggle('hidden', count > 0);
        };

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.getAttribute('data-filter');
                applyFilters();
            });
        });

        if (ageSelect)   ageSelect.addEventListener('change',   e => { activeAge   = e.target.value; applyFilters(); });
        if (priceSelect) priceSelect.addEventListener('change', e => { activePrice = e.target.value; applyFilters(); });

        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                activeCategory = 'all'; activeAge = 'all'; activePrice = 'all';
                filterButtons.forEach(b => { b.classList.remove('active'); if (b.dataset.filter === 'all') b.classList.add('active'); });
                if (ageSelect)   ageSelect.value   = 'all';
                if (priceSelect) priceSelect.value = 'all';
                applyFilters();
            });
        }
    }

    // ==========================================================================
    // RENDER HOME FEATURED HORSES (index.html) — Shows first 2 horses
    // ==========================================================================
    const featuredGrid = document.getElementById('featured-horses-grid');

    if (featuredGrid) {
        const horses    = getHorsesFromStorage();
        const featured  = Object.values(horses).slice(0, 2);

        if (featured.length === 0) {
            featuredGrid.innerHTML = `<p style="color:rgba(250,249,245,0.6);text-align:center;grid-column:1/-1;padding:40px 0;">
                Aucun cheval disponible en ce moment. Revenez bientôt !</p>`;
        } else {
            featuredGrid.innerHTML = featured.map(h => buildHorseCard(h, false, true)).join('');
        }

        if (typeof lucide !== 'undefined') lucide.createIcons({ node: featuredGrid });
    }

    // ==========================================================================
    // HORSE DETAILS MODAL (sales.html)
    // ==========================================================================
    const modal         = document.getElementById('horse-modal');
    const modalContent  = document.getElementById('modal-content-target');
    const modalCloseBtn = document.querySelector('.modal-close-btn');

    if (modal && modalContent && modalCloseBtn) {

        const openHorseModal = (horseId) => {
            const allHorses = getHorsesFromStorage();
            const horse = allHorses[horseId];
            if (!horse) return;

            modalContent.innerHTML = `
                <div class="modal-grid">
                    <div class="modal-gallery-side">
                        <img src="${horse.image}" alt="${horse.name}" class="modal-main-img">
                    </div>
                    <div class="modal-info-side">
                        <span class="modal-tag ${horse.tagClass || getCategorySlug(horse.category)}">${horse.category}</span>
                        <h2 class="modal-title">${horse.name}</h2>
                        <span class="modal-subtitle">${horse.breed} • ${horse.gender} ${horse.color}</span>

                        <div class="modal-price-box">
                            <span class="price-label">Prix de vente conseillé</span>
                            <span class="price-value">${horse.price}</span>
                        </div>

                        <h4 class="modal-desc-title">Description &amp; Aptitudes</h4>
                        <p class="modal-desc">${horse.description}</p>

                        <div class="modal-specs">
                            <div class="spec-item">
                                <span class="spec-icon"><i data-lucide="calendar"></i></span>
                                <div class="spec-text"><strong>Âge</strong><span>${horse.age} ans</span></div>
                            </div>
                            <div class="spec-item">
                                <span class="spec-icon"><i data-lucide="arrow-up-right"></i></span>
                                <div class="spec-text"><strong>Taille</strong><span>${horse.height}</span></div>
                            </div>
                            <div class="spec-item">
                                <span class="spec-icon"><i data-lucide="shield"></i></span>
                                <div class="spec-text"><strong>Niveau requis</strong><span>${horse.level}</span></div>
                            </div>
                            <div class="spec-item">
                                <span class="spec-icon"><i data-lucide="activity"></i></span>
                                <div class="spec-text"><strong>Discipline</strong><span>${horse.discipline}</span></div>
                            </div>
                        </div>

                        <div class="modal-specs" style="grid-template-columns:1fr;border:none;margin-bottom:20px;padding:0;">
                            <div class="spec-item" style="align-items:flex-start;">
                                <span class="spec-icon"><i data-lucide="git-merge"></i></span>
                                <div class="spec-text">
                                    <strong>Origines / Pedigree</strong>
                                    <span>Père : ${horse.father}<br>Mère : ${horse.mother}</span>
                                </div>
                            </div>
                            <div class="spec-item" style="align-items:flex-start;margin-top:12px;">
                                <span class="spec-icon"><i data-lucide="smile"></i></span>
                                <div class="spec-text"><strong>Tempérament</strong><span>${horse.temperament}</span></div>
                            </div>
                        </div>

                        <button class="btn btn-primary btn-block inquiry-btn" data-horse-id="${horse.id}">
                            <i data-lucide="mail"></i> Se renseigner sur ${horse.name}
                        </button>
                    </div>
                </div>`;

            if (typeof lucide !== 'undefined') {
                lucide.createIcons({ attrs: { class: 'lucide' }, nameAttr: 'data-lucide', node: modalContent });
            }

            modalContent.querySelector('.inquiry-btn').addEventListener('click', () => {
                closeModal();
                window.location.href = `contact.html?horse=${horse.id}`;
            });

            modal.setAttribute('aria-hidden', 'false');
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        };

        const closeModal = () => {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        // Event delegation — works with dynamically rendered cards
        if (horsesGrid) {
            horsesGrid.addEventListener('click', (e) => {
                const btn = e.target.closest('.view-details-btn');
                if (btn) {
                    const card = btn.closest('[data-id]');
                    if (card) openHorseModal(card.getAttribute('data-id'));
                }
            });
        }

        modalCloseBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
        window.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

        // Auto-open if ?horse=id is in the URL (deep link from home page or direct share)
        const urlParams  = new URLSearchParams(window.location.search);
        const horseParam = urlParams.get('horse');
        if (horseParam) {
            setTimeout(() => openHorseModal(horseParam), 500);
        }
    }

    // ==========================================================================
    // CONTACT FORM SMART PREFILLS (contact.html)
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        const subjectInput    = document.getElementById('subject');
        const messageTextarea = document.getElementById('message');
        const nameInput       = document.getElementById('name');
        const formSuccessAlert = document.getElementById('form-success');

        const urlParams  = new URLSearchParams(window.location.search);
        const horseId    = urlParams.get('horse');
        const activityId = urlParams.get('activity');

        if (horseId) {
            const allHorses = getHorsesFromStorage();
            const horse     = allHorses[horseId];
            if (horse) {
                subjectInput.value    = `Demande d'information : ${horse.name}`;
                messageTextarea.value = `Bonjour,\n\nJe souhaiterais obtenir plus d'informations concernant le cheval "${horse.name}" (${horse.breed}, ${horse.age} ans) disponible à la vente.\nMon projet équestre est le suivant :\n[Décrivez ici votre niveau équestre, Galop, et ce que vous recherchez].\n\nMerci de me recontacter pour organiser une éventuelle visite au domaine.`;
                setTimeout(() => { nameInput.focus(); }, 400);
            }
        }

        if (activityId && ACTIVITIES_INFO[activityId]) {
            const act = ACTIVITIES_INFO[activityId];
            subjectInput.value    = act.subject;
            messageTextarea.value = act.message;
            setTimeout(() => { nameInput.focus(); }, 400);
        }

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name    = nameInput.value;
            const email   = document.getElementById('email').value;
            const consent = document.getElementById('consent').checked;

            if (!name || !email || !consent) {
                alert("Veuillez renseigner tous les champs obligatoires (*).");
                return;
            }

            // Afficher l'état de chargement sur le bouton
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Envoi en cours...';
            submitBtn.disabled = true;

            // Récupération de la configuration EmailJS depuis admin-config.js
            let serviceId = 'VOTRE_SERVICE_ID_ICI';
            let templateId = 'VOTRE_TEMPLATE_ID_ICI';
            
            if (typeof EMAILJS_CONFIG !== 'undefined') {
                serviceId = EMAILJS_CONFIG.SERVICE_ID;
                templateId = EMAILJS_CONFIG.TEMPLATE_ID;
            }

            // Vérification de sécurité pour la démo
            if (serviceId === 'VOTRE_SERVICE_ID_ICI' || templateId === 'VOTRE_TEMPLATE_ID_ICI') {
                alert("Le formulaire n'est pas encore relié. Veuillez renseigner vos identifiants EmailJS dans le fichier admin-config.js.");
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                return;
            }

            // Envoi via EmailJS
            emailjs.sendForm(serviceId, templateId, contactForm)
                .then(() => {
                    // Restauration du bouton
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;

                    if (formSuccessAlert) {
                        formSuccessAlert.classList.remove('hidden');
                        formSuccessAlert.style.animation = 'fadeIn 0.5s ease-out';
                    }

                    contactForm.reset();

                    if (window.history.pushState) {
                        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                        window.history.pushState({ path: cleanUrl }, '', cleanUrl);
                    }

                    setTimeout(() => { if (formSuccessAlert) formSuccessAlert.classList.add('hidden'); }, 8000);
                }, (error) => {
                    // En cas d'erreur
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    alert("Une erreur est survenue lors de l'envoi. Veuillez réessayer plus tard.\nErreur: " + JSON.stringify(error));
                });
        });
    }

});
