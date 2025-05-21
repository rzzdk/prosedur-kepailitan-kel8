/**
 * Prosedur Kepailitan Interactive Application
 * Main JavaScript file
 */

// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const prosesCards = document.querySelectorAll('.proses-card');
const subContentSections = document.querySelectorAll('.sub-content-section');
const backToTopButton = document.getElementById('back-to-top');
const searchInput = document.getElementById('search-input');
const progressBar = document.querySelector('.progress-bar');
const progressText = document.querySelector('.progress-text');
const quizModal = document.getElementById('quiz-modal');
const openQuizBtn = document.getElementById('open-quiz-btn');
const closeQuizBtn = document.getElementById('close-quiz');
const submitQuizBtn = document.getElementById('submit-quiz');
const quizContent = document.getElementById('quiz-content');

// Global Variables
let visitedSections = new Set();
let totalSections = contentSections.length;
let loadedSections = [];
let searchResults = [];
let currentSearchTerm = '';

// =======================================================
// Navigation and Section Management
// =======================================================

/**
 * Set the active section and update URL hash
 * @param {string} targetId - The ID of the section to activate
 */
function setActiveSection(targetId) {
    try {
        // First hide all sections
        contentSections.forEach(section => {
            section.classList.remove('active');
            section.setAttribute('aria-hidden', 'true');
        });

        // Then show the target section
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.setAttribute('aria-hidden', 'false');
            
            // Update the URL hash without scrolling
            history.pushState(null, null, `#${targetId}`);
            
            // Update nav links
            navLinks.forEach(link => {
                const isActive = link.dataset.target === targetId;
                link.classList.toggle('active', isActive);
                link.setAttribute('aria-current', isActive ? 'page' : 'false');
            });
            
            // Close mobile menu if open
            if (mobileMenu.classList.contains('block')) {
                toggleMobileMenu();
            }
            
            // Track visited sections for progress bar
            trackProgress(targetId);
            
            // Lazy load section content if needed
            if (!loadedSections.includes(targetId)) {
                loadSectionContent(targetId);
            }
            
            // Scroll to top of the section
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            console.error(`Section with ID "${targetId}" not found`);
        }
    } catch (error) {
        console.error('Error in setActiveSection:', error);
    }
}

/**
 * Toggle mobile menu visibility
 */
function toggleMobileMenu() {
    const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
    
    mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('block');
}

/**
 * Load content for a section if it hasn't been loaded yet
 * This function demonstrates lazy loading capability
 * @param {string} sectionId - The ID of the section to load
 */
function loadSectionContent(sectionId) {
    // In a real application, this might fetch content from an API
    // For now, we just mark it as loaded
    loadedSections.push(sectionId);
}

// =======================================================
// Progress Tracking
// =======================================================

/**
 * Track user progress through the content
 * @param {string} sectionId - The ID of the section being viewed
 */
function trackProgress(sectionId) {
    visitedSections.add(sectionId);
    updateProgressIndicator();
}

/**
 * Update the progress bar and text
 */
function updateProgressIndicator() {
    const progress = Math.round((visitedSections.size / totalSections) * 100);
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;
    
    // Save progress to localStorage
    localStorage.setItem('pailitProgress', JSON.stringify([...visitedSections]));
}

/**
 * Restore progress from localStorage if available
 */
function restoreProgress() {
    try {
        const savedProgress = localStorage.getItem('pailitProgress');
        if (savedProgress) {
            const parsed = JSON.parse(savedProgress);
            visitedSections = new Set(parsed);
            updateProgressIndicator();
        }
    } catch (error) {
        console.error('Error restoring progress:', error);
        // Reset progress if there's an error
        localStorage.removeItem('pailitProgress');
        visitedSections = new Set();
    }
}

// =======================================================
// Accordion Functionality
// =======================================================

/**
 * Initialize accordion items with proper ARIA attributes
 */
function initAccordions() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach((item, index) => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        
        // Generate unique IDs if they don't exist
        if (!content.id) {
            content.id = `accordion-content-${index}`;
        }
        
        // Set ARIA attributes
        header.setAttribute('aria-controls', content.id);
        header.setAttribute('aria-expanded', 'false');
        content.setAttribute('aria-hidden', 'true');
        
        // Add event listeners
        header.addEventListener('click', () => toggleAccordion(item));
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleAccordion(item);
            }
        });
    });
}

/**
 * Toggle an accordion's state
 * @param {HTMLElement} item - The accordion item to toggle
 */
function toggleAccordion(item) {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    const isExpanded = header.getAttribute('aria-expanded') === 'true';
    
    // Toggle the expanded state
    header.setAttribute('aria-expanded', !isExpanded);
    content.setAttribute('aria-hidden', isExpanded);
    
    // Toggle the active class
    item.classList.toggle('active');
}

// =======================================================
// Process Cards (Tab Panel) Functionality
// =======================================================

/**
 * Initialize process cards as tab panels
 */
function initProcessCards() {
    prosesCards.forEach((card) => {
        const subTargetId = card.dataset.subtarget;
        const subSection = document.getElementById(subTargetId);
        
        if (subSection) {
            // Set initial ARIA states
            card.setAttribute('aria-expanded', 'false');
            card.setAttribute('aria-controls', subTargetId);
            subSection.setAttribute('aria-hidden', 'true');
            
            // Add event listeners
            card.addEventListener('click', () => toggleSubSection(card));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSubSection(card);
                }
            });
        }
    });
}

/**
 * Toggle a sub-section's visibility
 * @param {HTMLElement} card - The process card that controls the sub-section
 */
function toggleSubSection(card) {
    const subTargetId = card.dataset.subtarget;
    const targetSubSection = document.getElementById(subTargetId);
    
    if (!targetSubSection) return;
    
    const isExpanded = card.getAttribute('aria-expanded') === 'true';
    
    // Close all other sub-sections within the alur-proses section
    subContentSections.forEach(subSection => {
        if (subSection.id !== subTargetId && subSection.closest('#alur-proses')) {
            subSection.classList.remove('active');
            subSection.setAttribute('aria-hidden', 'true');
            
            // Find and update the controlling card
            const controllingCard = [...prosesCards].find(c => c.dataset.subtarget === subSection.id);
            if (controllingCard) {
                controllingCard.setAttribute('aria-expanded', 'false');
                controllingCard.setAttribute('aria-selected', 'false');
            }
        }
    });
    
    // Toggle the target sub-section
    targetSubSection.classList.toggle('active', !isExpanded);
    targetSubSection.setAttribute('aria-hidden', isExpanded);
    
    // Update the card's ARIA attributes
    card.setAttribute('aria-expanded', !isExpanded);
    card.setAttribute('aria-selected', !isExpanded);
    
    // Scroll to the sub-section if it's now visible
    if (!isExpanded) {
        setTimeout(() => {
            targetSubSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

// =======================================================
// Search Functionality
// =======================================================

/**
 * Perform search across content
 * @param {string} term - The search term
 */
function performSearch(term) {
    if (!term || term.length < 2) {
        resetSearch();
        return;
    }
    
    // Normalize search term
    const normalizedTerm = term.toLowerCase().trim();
    currentSearchTerm = normalizedTerm;
    
    // Reset previous results
    searchResults = [];
    
    // Search in each section
    contentSections.forEach(section => {
        const sectionId = section.id;
        const sectionTitle = section.querySelector('h2')?.textContent || '';
        const sectionContent = section.textContent;
        
        if (sectionContent.toLowerCase().includes(normalizedTerm)) {
            // Find all matches in this section
            const matches = findMatches(section, normalizedTerm);
            
            if (matches.length > 0) {
                searchResults.push({
                    sectionId,
                    sectionTitle,
                    matches
                });
            }
        }
    });
    
    displaySearchResults();
}

/**
 * Find all matches in a section
 * @param {HTMLElement} section - The section to search in
 * @param {string} term - The normalized search term
 * @returns {Array} - Array of match objects
 */
function findMatches(section, term) {
    const matches = [];
    
    // Find matches in headers
    section.querySelectorAll('h2, h3, h4, h5').forEach(header => {
        if (header.textContent.toLowerCase().includes(term)) {
            matches.push({
                element: header,
                text: header.textContent,
                isHeader: true
            });
        }
    });
    
    // Find matches in paragraphs
    section.querySelectorAll('p').forEach(paragraph => {
        if (paragraph.textContent.toLowerCase().includes(term)) {
            matches.push({
                element: paragraph,
                text: paragraph.textContent,
                isHeader: false
            });
        }
    });
    
    // Find matches in list items
    section.querySelectorAll('li').forEach(item => {
        if (item.textContent.toLowerCase().includes(term)) {
            matches.push({
                element: item,
                text: item.textContent,
                isHeader: false
            });
        }
    });
    
    return matches;
}

/**
 * Display search results
 */
function displaySearchResults() {
    // Create a temporary search results section
    let resultsSection = document.getElementById('search-results');
    
    if (!resultsSection) {
        resultsSection = document.createElement('section');
        resultsSection.id = 'search-results';
        resultsSection.className = 'content-section';
        document.getElementById('main-content').appendChild(resultsSection);
    }
    
    // Clear previous results
    resultsSection.innerHTML = '';
    
    // Create results header
    const resultsHeader = document.createElement('div');
    resultsHeader.className = 'bg-white p-6 rounded-lg shadow';
    
    if (searchResults.length > 0) {
        resultsHeader.innerHTML = `
            <h2 class="text-2xl font-semibold mb-4 text-indigo-700">Hasil Pencarian untuk "${currentSearchTerm}"</h2>
            <p class="mb-6">Ditemukan ${searchResults.length} bagian yang cocok.</p>
            <div id="results-container"></div>
        `;
        
        resultsSection.appendChild(resultsHeader);
        const resultsContainer = document.getElementById('results-container');
        
        // Add each result
        searchResults.forEach(result => {
            const resultCard = document.createElement('div');
            resultCard.className = 'bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4';
            
            // Create header with link to section
            resultCard.innerHTML = `
                <h3 class="text-lg font-semibold text-indigo-600 mb-2">
                    <a href="#${result.sectionId}" class="section-link" data-target="${result.sectionId}">${result.sectionTitle}</a>
                </h3>
                <div class="match-excerpts"></div>
            `;
            
            const excerptContainer = resultCard.querySelector('.match-excerpts');
            
            // Add first 3 match excerpts
            result.matches.slice(0, 3).forEach(match => {
                const excerpt = document.createElement('p');
                excerpt.className = 'mb-2 text-sm';
                
                // Highlight the match term in the excerpt
                const highlightedText = highlightTerm(match.text, currentSearchTerm);
                excerpt.innerHTML = highlightedText;
                
                excerptContainer.appendChild(excerpt);
            });
            
            resultsContainer.appendChild(resultCard);
        });
        
        // Add event listeners to section links
        document.querySelectorAll('.section-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.dataset.target;
                setActiveSection(targetId);
                resetSearch();
            });
        });
    } else {
        resultsHeader.innerHTML = `
            <h2 class="text-2xl font-semibold mb-4 text-indigo-700">Hasil Pencarian untuk "${currentSearchTerm}"</h2>
            <p class="mb-6">Tidak ditemukan hasil yang cocok. Silakan coba kata kunci lain.</p>
        `;
        resultsSection.appendChild(resultsHeader);
    }
    
    // Show the results section
    contentSections.forEach(section => {
        section.classList.remove('active');
        section.setAttribute('aria-hidden', 'true');
    });
    
    resultsSection.classList.add('active');
    resultsSection.setAttribute('aria-hidden', 'false');
}

/**
 * Highlight search term in text
 * @param {string} text - The text to highlight in
 * @param {string} term - The term to highlight
 * @returns {string} - HTML with highlighted term
 */
function highlightTerm(text, term) {
    if (!term) return text;
    
    // Create a regex that matches the term (case insensitive)
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    
    // Replace matches with highlighted version
    return text.replace(regex, '<span class="bg-yellow-200 font-semibold">$1</span>');
}

/**
 * Reset search and return to normal navigation
 */
function resetSearch() {
    currentSearchTerm = '';
    searchResults = [];
    
    // Remove the search results section if it exists
    const resultsSection = document.getElementById('search-results');
    if (resultsSection) {
        resultsSection.remove();
    }
    
    // Clear the search input
    searchInput.value = '';
}

// =======================================================
// Quiz Functionality
// =======================================================

// Quiz questions data
const quizQuestions = [
    {
        question: "Apa definisi kepailitan menurut Pasal 1 angka 1 UU Kepailitan & PKPU?",
        options: [
            "Kondisi tidak mampu membayar utang yang telah jatuh tempo",
            "Sita umum atas semua kekayaan Debitor Pailit yang pengurusan dan pemberesannya dilakukan oleh Kurator",
            "Penundaan pembayaran utang atas permohonan Debitor",
            "Mekanisme penjualan aset Debitor untuk membayar utang"
        ],
        correctAnswer: 1, // Index of correct answer (0-based)
        explanation: "Menurut Pasal 1 angka 1 UU Kepailitan & PKPU, kepailitan adalah sita umum atas semua kekayaan Debitor Pailit yang pengurusan dan pemberesannya dilakukan oleh Kurator di bawah pengawasan Hakim Pengawas."
    },
    {
        question: "Apa saja syarat materiil untuk mengajukan permohonan pailit?",
        options: [
            "Memiliki utang minimal Rp1 miliar yang telah jatuh waktu",
            "Debitor berada dalam keadaan tidak membayar utang yang telah jatuh waktu",
            "Adanya dua atau lebih Kreditor dan tidak membayar lunas sedikitnya satu utang yang telah jatuh waktu",
            "Terbukti adanya itikad buruk dari Debitor untuk menghindari pembayaran utang"
        ],
        correctAnswer: 2,
        explanation: "Syarat materiil pengajuan permohonan pailit menurut Pasal 2 ayat (1) UU Kepailitan adalah adanya Debitor yang mempunyai dua atau lebih Kreditor dan tidak membayar lunas sedikitnya satu utang yang telah jatuh waktu dan dapat ditagih."
    },
    {
        question: "Siapa saja yang dapat mengajukan permohonan pailit?",
        options: [
            "Hanya Kreditor saja",
            "Debitor, Kreditor, Kejaksaan, Bank Indonesia/OJK, dan Menteri Keuangan (untuk kasus tertentu)",
            "Pengadilan Niaga secara ex officio",
            "Kurator yang ditunjuk oleh Kreditor"
        ],
        correctAnswer: 1,
        explanation: "Pihak yang dapat mengajukan permohonan pailit adalah Debitor sendiri, satu atau lebih Kreditor, Kejaksaan (demi kepentingan umum), Bank Indonesia/OJK (untuk bank/lembaga jasa keuangan), dan Menteri Keuangan/OJK (untuk perusahaan asuransi, dana pensiun, BUMN tertentu)."
    },
    {
        question: "Apa perbedaan utama antara Kepailitan dan PKPU?",
        options: [
            "Tidak ada perbedaan, keduanya adalah proses yang sama",
            "Kepailitan fokus pada pemberesan aset, PKPU fokus pada restrukturisasi utang",
            "Kepailitan hanya dapat diajukan oleh Kreditor, PKPU hanya oleh Debitor",
            "Kepailitan berakhir dalam 60 hari, PKPU bisa berlangsung hingga 1 tahun"
        ],
        correctAnswer: 1,
        explanation: "Perbedaan utama adalah Kepailitan fokus pada likuidasi aset debitor untuk pembayaran utang, sementara PKPU bertujuan untuk restrukturisasi utang melalui rencana perdamaian agar usaha dapat dilanjutkan."
    },
    {
        question: "Dalam proses kepailitan, apa yang dimaksud dengan Kreditor Separatis?",
        options: [
            "Kreditor yang memiliki hak istimewa berdasarkan undang-undang",
            "Kreditor yang memiliki piutang yang dijamin dengan hak kebendaan",
            "Kreditor yang tidak memiliki jaminan dan menerima pelunasan secara proporsional",
            "Kreditor yang utangnya harus dilunasi terlebih dahulu sebelum kreditor lain"
        ],
        correctAnswer: 1,
        explanation: "Kreditor Separatis adalah kreditor yang piutangnya dijamin dengan hak kebendaan seperti gadai, fidusia, hak tanggungan, dan hipotek. Mereka memiliki hak untuk mengeksekusi sendiri objek jaminannya, terlepas dari proses kepailitan."
    }
];

/**
 * Initialize and display the quiz modal
 */
function showQuiz() {
    // Clear previous content
    quizContent.innerHTML = '';
    
    // Create quiz HTML
    quizQuestions.forEach((q, index) => {
        const questionContainer = document.createElement('div');
        questionContainer.className = 'quiz-question';
        questionContainer.dataset.index = index;
        
        // Create question header
        const questionHeader = document.createElement('h4');
        questionHeader.className = 'text-lg font-semibold mb-2';
        questionHeader.textContent = `${index + 1}. ${q.question}`;
        
        // Create options container
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'quiz-options';
        
        // Add options
        q.options.forEach((option, optIndex) => {
            const optionElem = document.createElement('div');
            optionElem.className = 'quiz-option';
            optionElem.dataset.questionIndex = index;
            optionElem.dataset.optionIndex = optIndex;
            
            optionElem.innerHTML = `
                <input type="radio" name="question-${index}" id="q${index}-opt${optIndex}" class="mr-2">
                <label for="q${index}-opt${optIndex}">${option}</label>
            `;
            
            // Add event listener
            optionElem.addEventListener('click', () => {
                // Select this option
                document.querySelectorAll(`.quiz-option[data-question-index="${index}"]`).forEach(opt => {
                    opt.classList.remove('selected');
                });
                optionElem.classList.add('selected');
                
                // Check the radio button
                const radio = optionElem.querySelector('input[type="radio"]');
                radio.checked = true;
            });
            
            optionsContainer.appendChild(optionElem);
        });
        
        // Assemble question container
        questionContainer.appendChild(questionHeader);
        questionContainer.appendChild(optionsContainer);
        
        // Add feedback container (will be shown after submission)
        const feedbackContainer = document.createElement('div');
        feedbackContainer.className = 'quiz-feedback hidden';
        feedbackContainer.id = `feedback-${index}`;
        questionContainer.appendChild(feedbackContainer);
        
        quizContent.appendChild(questionContainer);
    });
    
    // Show the modal
    quizModal.classList.remove('hidden');
    quizModal.classList.add('flex');
    setTimeout(() => {
        quizModal.classList.add('active');
    }, 50);
}

/**
 * Hide the quiz modal
 */
function hideQuiz() {
    quizModal.classList.remove('active');
    setTimeout(() => {
        quizModal.classList.add('hidden');
        quizModal.classList.remove('flex');
    }, 300);
}

/**
 * Check quiz answers and provide feedback
 */
function checkQuizAnswers() {
    let score = 0;
    
    quizQuestions.forEach((q, index) => {
        const selectedOption = document.querySelector(`.quiz-option.selected[data-question-index="${index}"]`);
        const feedbackContainer = document.getElementById(`feedback-${index}`);
        
        // Reset feedback
        feedbackContainer.innerHTML = '';
        feedbackContainer.classList.remove('hidden', 'correct', 'incorrect');
        
        if (selectedOption) {
            const selectedIndex = parseInt(selectedOption.dataset.optionIndex);
            const isCorrect = selectedIndex === q.correctAnswer;
            
            if (isCorrect) {
                score++;
                feedbackContainer.classList.add('correct');
                feedbackContainer.innerHTML = `
                    <p class="font-semibold text-green-600">✓ Benar!</p>
                    <p>${q.explanation}</p>
                `;
            } else {
                feedbackContainer.classList.add('incorrect');
                feedbackContainer.innerHTML = `
                    <p class="font-semibold text-red-600">✗ Kurang tepat</p>
                    <p>Jawaban yang benar: ${q.options[q.correctAnswer]}</p>
                    <p>${q.explanation}</p>
                `;
            }
            
            feedbackContainer.classList.remove('hidden');
        } else {
            feedbackContainer.classList.add('incorrect');
            feedbackContainer.innerHTML = `
                <p class="font-semibold text-red-600">✗ Tidak dijawab</p>
                <p>Jawaban yang benar: ${q.options[q.correctAnswer]}</p>
                <p>${q.explanation}</p>
            `;
            feedbackContainer.classList.remove('hidden');
        }
    });
    
    // Show final score at the top
    const scoreContainer = document.createElement('div');
    scoreContainer.className = 'bg-indigo-50 p-4 rounded-lg mb-4 text-center';
    scoreContainer.innerHTML = `
        <h3 class="text-xl font-bold text-indigo-700">Skor: ${score}/${quizQuestions.length}</h3>
        <p>${getScoreFeedback(score, quizQuestions.length)}</p>
    `;
    
    quizContent.insertBefore(scoreContainer, quizContent.firstChild);
    
    // Disable the submit button
    submitQuizBtn.disabled = true;
    submitQuizBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    // Save quiz result to localStorage
    saveQuizResult(score, quizQuestions.length);
}

/**
 * Get feedback message based on score
 * @param {number} score - User's score
 * @param {number} total - Total possible score
 * @returns {string} - Feedback message
 */
function getScoreFeedback(score, total) {
    const percentage = (score / total) * 100;
    
    if (percentage >= 80) {
        return "Sangat baik! Anda telah memahami konsep dasar kepailitan dengan baik.";
    } else if (percentage >= 60) {
        return "Cukup baik! Anda memiliki pemahaman yang cukup tentang kepailitan.";
    } else {
        return "Silakan pelajari kembali materi kepailitan untuk meningkatkan pemahaman Anda.";
    }
}

/**
 * Save quiz result to localStorage
 * @param {number} score - User's score
 * @param {number} total - Total possible score
 */
function saveQuizResult(score, total) {
    localStorage.setItem('pailkitQuizScore', JSON.stringify({
        score,
        total,
        timestamp: new Date().toISOString()
    }));
}

// =======================================================
// Back to Top Button Functionality
// =======================================================

/**
 * Show back to top button when user has scrolled down
 */
function toggleBackToTopButton() {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.remove('hidden');
    } else {
        backToTopButton.classList.add('hidden');
    }
}

/**
 * Scroll to top of page
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// =======================================================
// Event Listeners
// =======================================================

// Navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.dataset.target;
        setActiveSection(targetId);
    });
    
    // Keyboard accessibility
    link.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const targetId = link.dataset.target;
            setActiveSection(targetId);
        }
    });
});

// Mobile menu
mobileMenuButton.addEventListener('click', toggleMobileMenu);

// Search functionality
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        performSearch(searchInput.value);
    }
});

searchInput.addEventListener('input', () => {
    if (searchInput.value.length === 0) {
        resetSearch();
    }
});

// Back to top button
backToTopButton.addEventListener('click', scrollToTop);
window.addEventListener('scroll', toggleBackToTopButton);

// Quiz modal
openQuizBtn.addEventListener('click', showQuiz);
closeQuizBtn.addEventListener('click', hideQuiz);
submitQuizBtn.addEventListener('click', checkQuizAnswers);

// =======================================================
// Initialization
// =======================================================

/**
 * Initialize the application
 */
function init() {
    // Set initial section based on URL hash
    const hash = window.location.hash.substring(1);
    
    if (hash && document.getElementById(hash)) {
        setActiveSection(hash);
    } else {
        setActiveSection('beranda');
    }
    
    // Initialize accordions with ARIA attributes
    initAccordions();
    
    // Initialize process cards
    initProcessCards();
    
    // Restore progress from localStorage
    restoreProgress();
    
    // Hide back to top button initially
    backToTopButton.classList.add('hidden');
    
    // Watch for hash changes
    window.addEventListener('hashchange', () => {
        const newHash = window.location.hash.substring(1);
        if (newHash && document.getElementById(newHash)) {
            setActiveSection(newHash);
        }
    });
    
    console.log('Application initialized successfully');
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
