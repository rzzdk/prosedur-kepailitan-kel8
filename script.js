// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements for general page functionality
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const allNavLinkTypes = document.querySelectorAll('.nav-link, .mobile-nav-link, .nav-link-header, .nav-link-action');
    const contentSections = document.querySelectorAll('.content-section');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const prosesCards = document.querySelectorAll('.proses-card');
    const subContentSections = document.querySelectorAll('.sub-content-section');
    const accordionHeaderButtons = document.querySelectorAll('.accordion-header-button');
    const headerElement = document.querySelector('header');
    const backToTopButton = document.getElementById('back-to-top');
    let lastFocusedElement = null;

    // --- Search Feature Elements & State ---
    const searchInputs = document.querySelectorAll('.search-input');
    const searchTriggerButtons = document.querySelectorAll('.search-trigger-button');
    const clearSearchButtons = document.querySelectorAll('.clear-search-button');
    
    const searchStatusContainer = document.getElementById('search-status-container');
    const searchNavigationContainer = document.getElementById('search-navigation-container');
    const prevResultButton = document.getElementById('prev-result-button');
    const nextResultButton = document.getElementById('next-result-button');
    const searchResultIndicator = document.getElementById('search-result-indicator');
    const searchableContentContainer = document.getElementById('searchable-content');

    let originalContentState = new Map(); // Stores original innerHTML of elements before highlighting
    let foundMatches = []; // Stores {element: HTMLElement, originalHTML: string} for each match
    let currentMatchIndex = -1; // Index of the currently active search result

    // Constants for search
    const MIN_QUERY_LENGTH = 2;
    const HIGHLIGHT_CLASS = 'search-highlight';
    const ACTIVE_HIGHLIGHT_CLASS = 'search-highlight-active';
    const SEARCH_ELEMENT_SELECTORS = 'p, li, h2, h3, h4, h5, td, th'; // Elements to search within

    /**
     * Sets the active content section and updates navigation links.
     * @param {string} targetId - The ID of the content section to activate.
     * @param {boolean} isMobileContext - Whether the call is from a mobile navigation link.
     * @param {boolean} scrollToTarget - Whether to scroll to the activated section.
     * @param {boolean} focusTarget - Whether to focus on the heading of the activated section.
     */
    function setActiveSection(targetId, isMobileContext = false, scrollToTarget = true, focusTarget = true) {
        contentSections.forEach(section => {
            const isActive = section.id === targetId;
            section.classList.toggle('active', isActive);
            section.setAttribute('aria-hidden', String(!isActive));
        });

        // Update desktop nav links
        navLinks.forEach(link => {
            const isActive = link.dataset.target === targetId;
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
        // Update mobile nav links
        mobileNavLinks.forEach(link => {
            const isActive = link.dataset.target === targetId;
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
        
        // Close mobile menu if open
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
                const offsetPosition = elementPosition - headerHeight - 20; // 20px offset

                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                
                if (focusTarget) {
                    // Try to focus on the main heading of the section
                    const sectionHeading = targetElement.querySelector('h2, h3, h4');
                    if (sectionHeading) {
                        sectionHeading.setAttribute('tabindex', '-1'); // Make it focusable
                        sectionHeading.focus({ preventScroll: true }); // Prevent additional scroll
                    }
                }
            }
        }
    }

    // Event listeners for general navigation links
    allNavLinkTypes.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;
            if (targetId) {
                const isMobile = link.classList.contains('mobile-nav-link');
                setActiveSection(targetId, isMobile);
                // If it's an in-page link (e.g., "Mulai Pelajari"), ensure main nav also updates
                if (link.closest('.content-section') && !isMobile) {
                     navLinks.forEach(navL => {
                        const isActive = navL.dataset.target === targetId;
                        navL.classList.toggle('active', isActive);
                        navL.setAttribute('aria-current', isActive ? 'page' : 'false');
                    });
                }
                 // Update URL hash for direct linking and history
                if (history.pushState) {
                    history.pushState(null, null, `#${targetId}`);
                } else {
                    window.location.hash = targetId;
                }
            }
        });
    });

    // Mobile menu toggle
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            lastFocusedElement = document.activeElement; // Store element that had focus before opening menu
            const isExpanded = mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('block', !isExpanded);
            mobileMenuButton.setAttribute('aria-expanded', String(!isExpanded));
            if (!isExpanded) { // If menu is opened
                mobileMenu.querySelector('a, button')?.focus(); // Focus first focusable item in menu
            }
        });
    }
    
    /**
     * Toggles the display of sub-content sections linked to "proses-card" elements.
     * @param {HTMLElement} cardElement - The "proses-card" element that was clicked.
     * @param {boolean} scrollTo - Whether to scroll to the sub-content.
     * @param {boolean} focusOnContent - Whether to focus on the heading of the sub-content.
     */
    function toggleProsesCard(cardElement, scrollTo = true, focusOnContent = true) {
        const subTargetId = cardElement.dataset.subtarget;
        const targetSubSection = document.getElementById(subTargetId);
        let wasActive = targetSubSection ? targetSubSection.classList.contains('active') : false;

        // Close other sub-sections and deselect other cards
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
        
        // Close any open accordions within the sub-section that is about to be hidden or toggled
        document.querySelectorAll('.accordion-item.active').forEach(openItem => {
            if (!targetSubSection || !targetSubSection.contains(openItem) || (targetSubSection.contains(openItem) && wasActive)) {
                const accordionButton = openItem.querySelector('.accordion-header-button');
                openItem.classList.remove('active');
                if (accordionButton) {
                     accordionButton.setAttribute('aria-expanded', 'false');
                }
            }
        });

        if (targetSubSection) {
            if (wasActive) { // If it was active, deactivate it
                targetSubSection.classList.remove('active');
                targetSubSection.setAttribute('aria-hidden', 'true');
                cardElement.classList.remove('selected');
                cardElement.setAttribute('aria-expanded', 'false');
            } else { // If it was not active, activate it
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
                        subSectionHeading.setAttribute('tabindex', '-1');
                        subSectionHeading.focus({ preventScroll: true });
                    }
                }
            }
        }
    }
    
    // Event listeners for "proses-card" elements
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
     * Toggles the display of accordion content.
     * @param {HTMLElement} button - The accordion header button that was clicked.
     */
    function toggleAccordionItem(button) {
        const item = button.closest('.accordion-item');
        const isCurrentlyExpanded = button.getAttribute('aria-expanded') === 'true';

        // Optional: Close other accordions in the same parent container
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
    }

    // Event listeners for accordion header buttons
    accordionHeaderButtons.forEach(button => {
        button.addEventListener('click', () => toggleAccordionItem(button));
    });

    // Initial page load: set active section based on hash or default to 'beranda'
    function initializePage() {
        const initialTargetId = window.location.hash ? window.location.hash.substring(1) : 'beranda';
        const sectionExists = Array.from(contentSections).some(s => s.id === initialTargetId);
        setActiveSection(sectionExists ? initialTargetId : 'beranda', false, false, false); // Don't scroll or focus on initial load for better UX
    }
    initializePage();

    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
        const targetId = window.location.hash ? window.location.hash.substring(1) : 'beranda';
        const sectionExistsPop = Array.from(contentSections).some(s => s.id === targetId);
        setActiveSection(sectionExistsPop ? targetId : 'beranda', false, true, true);
    });

    // Back to Top Button functionality
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) { // Show button after scrolling 300px
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

    // --- Enhanced Search Feature Logic ---

    /**
     * Clears all search highlights from the content.
     */
    function clearAllHighlights() {
        // Remove active highlight first
        const activeHighlighted = searchableContentContainer.querySelector(`.${ACTIVE_HIGHLIGHT_CLASS}`);
        if (activeHighlighted) {
            activeHighlighted.classList.remove(ACTIVE_HIGHLIGHT_CLASS);
            // Re-apply normal highlight if it was also normally highlighted
            if (activeHighlighted.classList.contains(HIGHLIGHT_CLASS.split(' ')[0])) { // Check primary class
                 // No action needed if it's meant to remain highlighted
            } else if (originalContentState.has(activeHighlighted)) {
                // If it was only active-highlighted, restore original
                activeHighlighted.innerHTML = originalContentState.get(activeHighlighted);
            }
        }
        
        // Restore original content for all previously highlighted elements
        originalContentState.forEach((originalHTML, element) => {
            element.innerHTML = originalHTML;
        });
        originalContentState.clear();
    }

    /**
     * Resets the entire search state (inputs, messages, highlights, navigation).
     */
    function resetSearchState() {
        searchInputs.forEach(input => input.value = '');
        clearSearchButtons.forEach(btn => btn.classList.add('hidden'));
        searchStatusContainer.innerHTML = '';
        searchNavigationContainer.classList.add('hidden');
        searchResultIndicator.textContent = '';
        clearAllHighlights();
        foundMatches = [];
        currentMatchIndex = -1;
    }

    /**
     * Updates the search status message.
     * @param {number} count - The number of matches found.
     * @param {string} query - The search query.
     */
    function updateSearchStatusMessage(count, query) {
        if (query.trim().length < MIN_QUERY_LENGTH && query.trim().length > 0) {
            searchStatusContainer.innerHTML = `<p class="text-sm text-gray-600 bg-gray-100 p-3 rounded-md">Masukkan minimal ${MIN_QUERY_LENGTH} karakter untuk memulai pencarian.</p>`;
            searchNavigationContainer.classList.add('hidden');
            return;
        }
        if (count > 0) {
            searchStatusContainer.innerHTML = `<p class="text-green-700 bg-green-50 p-3 rounded-md">Ditemukan ${count} hasil untuk "<strong>${escapeHTML(query)}</strong>".</p>`;
            searchNavigationContainer.classList.remove('hidden');
        } else if (query.trim().length >= MIN_QUERY_LENGTH) {
            searchStatusContainer.innerHTML = `<p class="text-red-700 bg-red-50 p-3 rounded-md">Tidak ada hasil ditemukan untuk "<strong>${escapeHTML(query)}</strong>".</p>`;
            searchNavigationContainer.classList.add('hidden');
        } else {
            searchStatusContainer.innerHTML = ''; // Clear message if query is too short or empty
            searchNavigationContainer.classList.add('hidden');
        }
    }
    
    /**
     * Escapes HTML special characters to prevent XSS.
     * @param {string} str - The string to escape.
     * @returns {string} The escaped string.
     */
    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[match];
        });
    }

    /**
     * Reveals a hidden element by activating its parent sections, sub-sections, and accordions.
     * @param {HTMLElement} element - The element to reveal.
     */
    function revealElement(element) {
        if (!element) return;

        // Activate parent content section
        const parentContentSection = element.closest('.content-section');
        if (parentContentSection && !parentContentSection.classList.contains('active')) {
            setActiveSection(parentContentSection.id, false, false, false); // No scroll/focus yet
        }

        // Activate parent sub-content section (e.g., Alur Proses details)
        const parentSubContent = element.closest('.sub-content-section');
        if (parentSubContent && !parentSubContent.classList.contains('active')) {
            const card = document.querySelector(`.proses-card[data-subtarget="${parentSubContent.id}"]`);
            if (card) toggleProsesCard(card, false, false); // No scroll/focus yet
        }
        
        // Open parent accordion item
        const parentAccordionItem = element.closest('.accordion-item');
        if (parentAccordionItem && !parentAccordionItem.classList.contains('active')) {
            const accordionButton = parentAccordionItem.querySelector('.accordion-header-button');
            if (accordionButton) toggleAccordionItem(accordionButton);
        }
    }

    /**
     * Navigates to a specific search result.
     * @param {number} index - The index of the result in the foundMatches array.
     */
    function navigateToResult(index) {
        if (index < 0 || index >= foundMatches.length) return;

        // Remove active highlight from previous match
        if (currentMatchIndex !== -1 && foundMatches[currentMatchIndex]) {
            const prevMatchElement = foundMatches[currentMatchIndex].element;
            prevMatchElement.classList.remove(ACTIVE_HIGHLIGHT_CLASS);
            // Ensure it still has the normal highlight if it's part of the search
            if (!prevMatchElement.classList.contains(HIGHLIGHT_CLASS.split(' ')[0])) {
                 prevMatchElement.classList.add(HIGHLIGHT_CLASS);
            }
        }
        
        currentMatchIndex = index;
        const currentMatch = foundMatches[currentMatchIndex];
        const targetElement = currentMatch.element;

        revealElement(targetElement); // Ensure the element is visible

        // Add active highlight to current match
        targetElement.classList.remove(HIGHLIGHT_CLASS); // Remove normal highlight first
        targetElement.classList.add(ACTIVE_HIGHLIGHT_CLASS);

        // Scroll to the element
        setTimeout(() => { // Delay to allow content to reveal
            const headerHeight = headerElement ? headerElement.offsetHeight : 70;
            const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerHeight - 30; // Extra offset for better visibility
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            targetElement.focus({ preventScroll: true });
        }, 150); // Adjust delay if needed

        // Update navigation indicator and button states
        searchResultIndicator.textContent = `${currentMatchIndex + 1} dari ${foundMatches.length}`;
        prevResultButton.disabled = currentMatchIndex === 0;
        nextResultButton.disabled = currentMatchIndex === foundMatches.length - 1;
    }

    /**
     * Executes the search based on the query.
     * @param {string} query - The search term.
     */
    function executeSearch(query) {
        clearAllHighlights();
        foundMatches = [];
        currentMatchIndex = -1;

        const trimmedQuery = query.trim();
        if (trimmedQuery.length < MIN_QUERY_LENGTH) {
            updateSearchStatusMessage(0, trimmedQuery); // Show "min characters" message or clear
            searchNavigationContainer.classList.add('hidden');
            return;
        }

        const searchTerm = trimmedQuery.toLowerCase();
        const elementsToSearch = searchableContentContainer.querySelectorAll(SEARCH_ELEMENT_SELECTORS);
        const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'); // Escape special chars

        elementsToSearch.forEach(element => {
            // Store original content if not already stored for this search session
            // This check is important if executeSearch is called multiple times without full reset
             if (!originalContentState.has(element)) {
                originalContentState.set(element, element.innerHTML);
            }
            
            const originalHTML = originalContentState.get(element); // Use stored original for consistent replacement
            const textContent = element.textContent.toLowerCase();

            if (textContent.includes(searchTerm)) {
                let matchFoundInElement = false;
                const newHTML = originalHTML.replace(regex, match => {
                    matchFoundInElement = true;
                    return `<mark class="${HIGHLIGHT_CLASS}">${match}</mark>`;
                });

                if (matchFoundInElement) {
                    element.innerHTML = newHTML;
                    foundMatches.push({ element: element, originalHTML: originalHTML });
                }
            }
        });

        updateSearchStatusMessage(foundMatches.length, trimmedQuery);

        if (foundMatches.length > 0) {
            searchNavigationContainer.classList.remove('hidden');
            navigateToResult(0); // Navigate to the first result
        } else {
            searchNavigationContainer.classList.add('hidden');
        }
    }
    
    /**
     * Initializes all search-related event listeners.
     */
    function initializeSearchListeners() {
        searchInputs.forEach(input => {
            const clearButton = input.parentElement.querySelector('.clear-search-button');
            input.addEventListener('input', () => {
                if (input.value.trim() !== '') {
                    clearButton?.classList.remove('hidden');
                } else {
                    clearButton?.classList.add('hidden');
                    // Optionally reset search if input is cleared completely
                    // resetSearchState(); // Or just clear highlights and message
                    clearAllHighlights();
                    searchStatusContainer.innerHTML = '';
                    searchNavigationContainer.classList.add('hidden');
                }
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    executeSearch(input.value);
                }
            });
        });

        searchTriggerButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('.search-input');
                executeSearch(input.value);
            });
        });

        clearSearchButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('.search-input');
                input.value = '';
                button.classList.add('hidden');
                resetSearchState();
                input.focus();
            });
        });

        prevResultButton.addEventListener('click', () => {
            if (currentMatchIndex > 0) {
                navigateToResult(currentMatchIndex - 1);
            }
        });

        nextResultButton.addEventListener('click', () => {
            if (currentMatchIndex < foundMatches.length - 1) {
                navigateToResult(currentMatchIndex + 1);
            }
        });
    }

    initializeSearchListeners();

    // Update copyright year
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});