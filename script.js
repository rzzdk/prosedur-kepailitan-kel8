// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const allNavLinkTypes = document.querySelectorAll('.nav-link, .mobile-nav-link, .nav-link-header, .nav-link-action');
    const contentSections = document.querySelectorAll('.content-section');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const prosesCards = document.querySelectorAll('.proses-card');
    const subContentSections = document.querySelectorAll('.sub-content-section');
    const accordionHeaderButtons = document.querySelectorAll('.accordion-header-button');
    const mainContent = document.getElementById('main-content');
    const headerElement = document.querySelector('header');
    let lastFocusedElement = null;

    // Fitur Baru: Back to Top Button
    const backToTopButton = document.getElementById('back-to-top');

    // Fitur Baru: Search
    const searchInputDesktop = document.getElementById('search-input-desktop');
    const searchButtonDesktop = document.getElementById('search-button-desktop');
    const searchInputMobile = document.getElementById('search-input-mobile');
    const searchButtonMobile = document.getElementById('search-button-mobile');
    const searchResultsContainer = document.getElementById('search-results-container');
    const searchableContentContainer = document.getElementById('searchable-content');
    let originalContentState = new Map(); // To store original innerHTML for reverting highlights

    /**
     * Mengatur section mana yang aktif dan terlihat.
     */
    function setActiveSection(targetId, isMobileContext = false, scrollToTarget = true, focusTarget = true) {
        contentSections.forEach(section => {
            const isActive = section.id === targetId;
            section.classList.toggle('active', isActive);
            section.setAttribute('aria-hidden', String(!isActive));
        });

        navLinks.forEach(link => {
            const isActive = link.dataset.target === targetId;
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
        mobileNavLinks.forEach(link => {
            const isActive = link.dataset.target === targetId;
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
        
        if (mobileMenu.classList.contains('block')) {
            mobileMenu.classList.remove('block');
            mobileMenu.classList.add('hidden');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            if (lastFocusedElement) lastFocusedElement.focus();
        }

        if (scrollToTarget) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const headerHeight = headerElement ? headerElement.offsetHeight : 70;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerHeight - 20;

                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                
                if (focusTarget) {
                    const sectionHeading = targetElement.querySelector('h2');
                    if (sectionHeading) {
                        sectionHeading.setAttribute('tabindex', '-1');
                        sectionHeading.focus();
                    }
                }
            }
        }
    }

    allNavLinkTypes.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;
            if (targetId) {
                const isMobile = link.classList.contains('mobile-nav-link');
                setActiveSection(targetId, isMobile);
                if (link.closest('.content-section') && !isMobile) {
                     navLinks.forEach(navL => {
                        const isActive = navL.dataset.target === targetId;
                        navL.classList.toggle('active', isActive);
                        navL.setAttribute('aria-current', isActive ? 'page' : 'false');
                    });
                }
            }
        });
    });

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            lastFocusedElement = document.activeElement;
            const isExpanded = mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('block', !isExpanded);
            mobileMenuButton.setAttribute('aria-expanded', String(!isExpanded));
            if (!isExpanded) {
                mobileMenu.querySelector('a, button')?.focus();
            }
        });
    }
    
    /**
     * Menangani toggle untuk kartu proses dan sub-kontennya.
     */
    function toggleProsesCard(cardElement, scrollTo = true, focusOnContent = true) {
        const subTargetId = cardElement.dataset.subtarget;
        const targetSubSection = document.getElementById(subTargetId);
        let wasActive = targetSubSection ? targetSubSection.classList.contains('active') : false;

        subContentSections.forEach(subSection => {
            if (subSection.id !== subTargetId) {
                subSection.classList.remove('active');
                subSection.setAttribute('aria-hidden', 'true');
            }
        });
        prosesCards.forEach(c => {
            if (c !== cardElement) {
                c.classList.remove('selected');
                c.setAttribute('aria-expanded', 'false');
            }
        });
        
        document.querySelectorAll('.accordion-item.active').forEach(openItem => {
            const accordionButton = openItem.querySelector('.accordion-header-button');
            openItem.classList.remove('active');
            if (accordionButton) {
                 accordionButton.setAttribute('aria-expanded', 'false');
            }
        });

        if (targetSubSection) {
            if (wasActive) {
                targetSubSection.classList.remove('active');
                targetSubSection.setAttribute('aria-hidden', 'true');
                cardElement.classList.remove('selected');
                cardElement.setAttribute('aria-expanded', 'false');
            } else {
                targetSubSection.classList.add('active');
                targetSubSection.setAttribute('aria-hidden', 'false');
                cardElement.classList.add('selected');
                cardElement.setAttribute('aria-expanded', 'true');
                
                if (scrollTo) {
                    const headerHeight = headerElement ? headerElement.offsetHeight : 70;
                    const elementPosition = targetSubSection.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - headerHeight - 20;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
                if (focusOnContent) {
                    const subSectionHeading = targetSubSection.querySelector('h4');
                    if(subSectionHeading) {
                        subSectionHeading.focus();
                    }
                }
            }
        }
    }
    
    prosesCards.forEach(card => {
        card.addEventListener('click', () => toggleProsesCard(card));
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault(); 
                toggleProsesCard(card);
            }
        });
    });

    /**
     * Menangani toggle untuk item akordeon.
     */
    function toggleAccordionItem(button) {
        const item = button.closest('.accordion-item');
        const isCurrentlyExpanded = button.getAttribute('aria-expanded') === 'true';

        const parentContainer = item.closest('.sub-content-section, .content-section');
        if (parentContainer) {
            parentContainer.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    const otherButton = otherItem.querySelector('.accordion-header-button');
                    otherItem.classList.remove('active');
                    if (otherButton) otherButton.setAttribute('aria-expanded', 'false');
                }
            });
        }
        
        item.classList.toggle('active', !isCurrentlyExpanded);
        button.setAttribute('aria-expanded', String(!isCurrentlyExpanded));
        if (!isCurrentlyExpanded) { // If opening
            // Optional: scroll to accordion header if it's not fully visible
            // button.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    accordionHeaderButtons.forEach(button => {
        button.addEventListener('click', () => toggleAccordionItem(button));
    });

    const initialTargetId = window.location.hash ? window.location.hash.substring(1) : 'beranda';
    const sectionExists = Array.from(contentSections).some(s => s.id === initialTargetId);
    setActiveSection(sectionExists ? initialTargetId : 'beranda', false, false, false);

    window.addEventListener('popstate', () => {
        const targetId = window.location.hash ? window.location.hash.substring(1) : 'beranda';
        const sectionExistsPop = Array.from(contentSections).some(s => s.id === targetId);
        setActiveSection(sectionExistsPop ? targetId : 'beranda', false, true, true);
    });

    // --- Fitur Back to Top ---
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.remove('hidden');
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.add('hidden');
                backToTopButton.classList.remove('visible');
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Fitur Pencarian Konten ---
    function clearHighlights() {
        originalContentState.forEach((originalHTML, element) => {
            element.innerHTML = originalHTML;
        });
        originalContentState.clear();
    }

    function performSearch(query) {
        clearHighlights();
        searchResultsContainer.innerHTML = ''; // Clear previous results

        if (!query || query.trim().length < 2) { // Minimum 2 karakter untuk mencari
            if (query.trim().length > 0 && query.trim().length < 2) {
                 searchResultsContainer.innerHTML = '<p class="text-sm text-gray-600">Masukkan minimal 2 karakter untuk memulai pencarian.</p>';
            }
            return;
        }

        const searchTerm = query.trim().toLowerCase();
        let resultsFound = 0;
        let firstMatchElement = null;

        const elementsToSearch = searchableContentContainer.querySelectorAll('p, li, h2, h3, h4, h5, td, th');

        elementsToSearch.forEach(element => {
            // Store original content if not already stored
            if (!originalContentState.has(element)) {
                originalContentState.set(element, element.innerHTML);
            }

            const textContent = element.textContent.toLowerCase();
            if (textContent.includes(searchTerm)) {
                const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'); // Escape special chars for regex
                let newHTML = originalContentState.get(element).replace(regex, match => `<mark class="search-highlight">${match}</mark>`);
                
                if (newHTML !== originalContentState.get(element)) {
                    element.innerHTML = newHTML;
                    resultsFound++;
                    if (!firstMatchElement) {
                        firstMatchElement = element;

                        // Reveal parent sections if hidden
                        const parentContentSection = element.closest('.content-section');
                        if (parentContentSection && !parentContentSection.classList.contains('active')) {
                            setActiveSection(parentContentSection.id, false, false, false); // Don't scroll yet, don't focus yet
                        }

                        const parentSubContent = element.closest('.sub-content-section');
                        if (parentSubContent && !parentSubContent.classList.contains('active')) {
                            const card = document.querySelector(`.proses-card[data-subtarget="${parentSubContent.id}"]`);
                            if (card) toggleProsesCard(card, false, false); // Don't scroll, don't focus
                        }
                        
                        const parentAccordionItem = element.closest('.accordion-item');
                        if (parentAccordionItem && !parentAccordionItem.classList.contains('active')) {
                            const accordionButton = parentAccordionItem.querySelector('.accordion-header-button');
                            if (accordionButton) toggleAccordionItem(accordionButton);
                        }
                    }
                }
            }
        });

        if (resultsFound > 0) {
            searchResultsContainer.innerHTML = `<p class="text-green-700 bg-green-50 p-3 rounded-md">Ditemukan ${resultsFound} hasil untuk "<strong>${query}</strong>".</p>`;
            if (firstMatchElement) {
                // Scroll to the first match after a short delay to allow content to reveal
                setTimeout(() => {
                    const headerHeight = headerElement ? headerElement.offsetHeight : 70;
                    const elementPosition = firstMatchElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - headerHeight - 20;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    firstMatchElement.focus({ preventScroll: true }); // Fokus ke elemen tanpa scroll tambahan
                }, 300); // Adjust delay if needed
            }
        } else {
            searchResultsContainer.innerHTML = `<p class="text-red-700 bg-red-50 p-3 rounded-md">Tidak ada hasil ditemukan untuk "<strong>${query}</strong>".</p>`;
        }
    }

    function handleSearchEvent(inputElement) {
        const query = inputElement.value;
        performSearch(query);
    }

    if (searchInputDesktop && searchButtonDesktop) {
        searchButtonDesktop.addEventListener('click', () => handleSearchEvent(searchInputDesktop));
        searchInputDesktop.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission if it's in a form
                handleSearchEvent(searchInputDesktop);
            }
        });
        searchInputDesktop.addEventListener('input', () => { // Clear results if input is empty
            if (searchInputDesktop.value.trim() === '') {
                clearHighlights();
                searchResultsContainer.innerHTML = '';
            }
        });
    }
    if (searchInputMobile && searchButtonMobile) {
        searchButtonMobile.addEventListener('click', () => handleSearchEvent(searchInputMobile));
        searchInputMobile.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchEvent(searchInputMobile);
            }
        });
         searchInputMobile.addEventListener('input', () => {
            if (searchInputMobile.value.trim() === '') {
                clearHighlights();
                searchResultsContainer.innerHTML = '';
            }
        });
    }


    // Update tahun di footer
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});