const backendURL = 'https://global-vote.onrender.com';


// ====== APP STATE ======
let hasVoted = localStorage.getItem('hasVoted') === 'true';
let userEmail = localStorage.getItem('userEmail') || null;
let voteCounts = JSON.parse(localStorage.getItem('voteCounts')) || {};

// Country data
const countries = [
            { code: 'af', name: 'Afghanistan' },
            { code: 'al', name: 'Albania' },
            { code: 'dz', name: 'Algeria' },
            { code: 'ad', name: 'Andorra' },
            { code: 'ao', name: 'Angola' },
            { code: 'ag', name: 'Antigua and Barbuda' },
            { code: 'ar', name: 'Argentina' },
            { code: 'am', name: 'Armenia' },
            { code: 'au', name: 'Australia' },
            { code: 'at', name: 'Austria' },
            { code: 'az', name: 'Azerbaijan' },
            { code: 'bs', name: 'Bahamas' },
            { code: 'bh', name: 'Bahrain' },
            { code: 'bd', name: 'Bangladesh' },
            { code: 'bb', name: 'Barbados' },
            { code: 'by', name: 'Belarus' },
            { code: 'be', name: 'Belgium' },
            { code: 'bz', name: 'Belize' },
            { code: 'bj', name: 'Benin' },
            { code: 'bt', name: 'Bhutan' },
            { code: 'bo', name: 'Bolivia' },
            { code: 'ba', name: 'Bosnia and Herzegovina' },
            { code: 'bw', name: 'Botswana' },
            { code: 'br', name: 'Brazil' },
            { code: 'bn', name: 'Brunei' },
            { code: 'bg', name: 'Bulgaria' },
            { code: 'bf', name: 'Burkina Faso' },
            { code: 'bi', name: 'Burundi' },
            { code: 'cv', name: 'Cabo Verde' },
            { code: 'kh', name: 'Cambodia' },
            { code: 'cm', name: 'Cameroon' },
            { code: 'ca', name: 'Canada' },
            { code: 'cf', name: 'Central African Republic' },
            { code: 'td', name: 'Chad' },
            { code: 'cl', name: 'Chile' },
            { code: 'cn', name: 'China' },
            { code: 'co', name: 'Colombia' },
            { code: 'km', name: 'Comoros' },
            { code: 'cg', name: 'Congo' },
            { code: 'cr', name: 'Costa Rica' },
            { code: 'ci', name: 'Côte d\'Ivoire' },
            { code: 'hr', name: 'Croatia' },
            { code: 'cu', name: 'Cuba' },
            { code: 'cy', name: 'Cyprus' },
            { code: 'cz', name: 'Czechia' },
            { code: 'dk', name: 'Denmark' },
            { code: 'dj', name: 'Djibouti' },
            { code: 'dm', name: 'Dominica' },
            { code: 'do', name: 'Dominican Republic' },
            { code: 'ec', name: 'Ecuador' },
            { code: 'eg', name: 'Egypt' },
            { code: 'sv', name: 'El Salvador' },
            { code: 'gq', name: 'Equatorial Guinea' },
            { code: 'er', name: 'Eritrea' },
            { code: 'ee', name: 'Estonia' },
            { code: 'sz', name: 'Eswatini' },
            { code: 'et', name: 'Ethiopia' },
            { code: 'fj', name: 'Fiji' },
            { code: 'fi', name: 'Finland' },
            { code: 'fr', name: 'France' },
            { code: 'ga', name: 'Gabon' },
            { code: 'gm', name: 'Gambia' },
            { code: 'ge', name: 'Georgia' },
            { code: 'de', name: 'Germany' },
            { code: 'gh', name: 'Ghana' },
            { code: 'gr', name: 'Greece' },
            { code: 'gd', name: 'Grenada' },
            { code: 'gt', name: 'Guatemala' },
            { code: 'gn', name: 'Guinea' },
            { code: 'gw', name: 'Guinea-Bissau' },
            { code: 'gy', name: 'Guyana' },
            { code: 'ht', name: 'Haiti' },
            { code: 'hn', name: 'Honduras' },
            { code: 'hu', name: 'Hungary' },
            { code: 'is', name: 'Iceland' },
            { code: 'in', name: 'India' },
            { code: 'id', name: 'Indonesia' },
            { code: 'ir', name: 'Iran' },
            { code: 'iq', name: 'Iraq' },
            { code: 'ie', name: 'Ireland' },
            { code: 'il', name: 'Israel' },
            { code: 'it', name: 'Italy' },
            { code: 'jm', name: 'Jamaica' },
            { code: 'jp', name: 'Japan' },
            { code: 'jo', name: 'Jordan' },
            { code: 'kz', name: 'Kazakhstan' },
            { code: 'ke', name: 'Kenya' },
            { code: 'ki', name: 'Kiribati' },
            { code: 'kp', name: 'North Korea' },
            { code: 'kr', name: 'South Korea' },
            { code: 'kw', name: 'Kuwait' },
            { code: 'kg', name: 'Kyrgyzstan' },
            { code: 'la', name: 'Laos' },
            { code: 'lv', name: 'Latvia' },
            { code: 'lb', name: 'Lebanon' },
            { code: 'ls', name: 'Lesotho' },
            { code: 'lr', name: 'Liberia' },
            { code: 'ly', name: 'Libya' },
            { code: 'li', name: 'Liechtenstein' },
            { code: 'lt', name: 'Lithuania' },
            { code: 'lu', name: 'Luxembourg' },
            { code: 'mg', name: 'Madagascar' },
            { code: 'mw', name: 'Malawi' },
            { code: 'my', name: 'Malaysia' },
            { code: 'mv', name: 'Maldives' },
            { code: 'ml', name: 'Mali' },
            { code: 'mt', name: 'Malta' },
            { code: 'mh', name: 'Marshall Islands' },
            { code: 'mr', name: 'Mauritania' },
            { code: 'mu', name: 'Mauritius' },
            { code: 'mx', name: 'Mexico' },
            { code: 'fm', name: 'Micronesia' },
            { code: 'md', name: 'Moldova' },
            { code: 'mc', name: 'Monaco' },
            { code: 'mn', name: 'Mongolia' },
            { code: 'me', name: 'Montenegro' },
            { code: 'ma', name: 'Morocco' },
            { code: 'mz', name: 'Mozambique' },
            { code: 'mm', name: 'Myanmar' },
            { code: 'na', name: 'Namibia' },
            { code: 'nr', name: 'Nauru' },
            { code: 'np', name: 'Nepal' },
            { code: 'nl', name: 'Netherlands' },
            { code: 'nz', name: 'New Zealand' },
            { code: 'ni', name: 'Nicaragua' },
            { code: 'ne', name: 'Niger' },
            { code: 'ng', name: 'Nigeria' },
            { code: 'mk', name: 'North Macedonia' },
            { code: 'no', name: 'Norway' },
            { code: 'om', name: 'Oman' },
            { code: 'pk', name: 'Pakistan' },
            { code: 'pw', name: 'Palau' },
            { code: 'pa', name: 'Panama' },
            { code: 'pg', name: 'Papua New Guinea' },
            { code: 'py', name: 'Paraguay' },
            { code: 'pe', name: 'Peru' },
            { code: 'ph', name: 'Philippines' },
            { code: 'pl', name: 'Poland' },
            { code: 'pt', name: 'Portugal' },
            { code: 'qa', name: 'Qatar' },
            { code: 'ro', name: 'Romania' },
            { code: 'ru', name: 'Russia' },
            { code: 'rw', name: 'Rwanda' },
            { code: 'kn', name: 'Saint Kitts and Nevis' },
            { code: 'lc', name: 'Saint Lucia' },
            { code: 'vc', name: 'Saint Vincent and the Grenadines' },
            { code: 'ws', name: 'Samoa' },
            { code: 'sm', name: 'San Marino' },
            { code: 'st', name: 'Sao Tome and Principe' },
            { code: 'sa', name: 'Saudi Arabia' },
            { code: 'sn', name: 'Senegal' },
            { code: 'rs', name: 'Serbia' },
            { code: 'sc', name: 'Seychelles' },
            { code: 'sl', name: 'Sierra Leone' },
            { code: 'sg', name: 'Singapore' },
            { code: 'sk', name: 'Slovakia' },
            { code: 'si', name: 'Slovenia' },
            { code: 'sb', name: 'Solomon Islands' },
            { code: 'so', name: 'Somalia' },
            { code: 'za', name: 'South Africa' },
            { code: 'ss', name: 'South Sudan' },
            { code: 'es', name: 'Spain' },
            { code: 'lk', name: 'Sri Lanka' },
            { code: 'sd', name: 'Sudan' },
            { code: 'sr', name: 'Suriname' },
            { code: 'se', name: 'Sweden' },
            { code: 'ch', name: 'Switzerland' },
            { code: 'sy', name: 'Syria' },
            { code: 'tw', name: 'Taiwan' },
            { code: 'tj', name: 'Tajikistan' },
            { code: 'tz', name: 'Tanzania' },
            { code: 'th', name: 'Thailand' },
            { code: 'tl', name: 'Timor-Leste' },
            { code: 'tg', name: 'Togo' },
            { code: 'to', name: 'Tonga' },
            { code: 'tt', name: 'Trinidad and Tobago' },
            { code: 'tn', name: 'Tunisia' },
            { code: 'tr', name: 'Turkey' },
            { code: 'tm', name: 'Turkmenistan' },
            { code: 'tv', name: 'Tuvalu' },
            { code: 'ug', name: 'Uganda' },
            { code: 'ua', name: 'Ukraine' },
            { code: 'ae', name: 'United Arab Emirates' },
            { code: 'gb', name: 'United Kingdom' },
            { code: 'us', name: 'United States' },
            { code: 'uy', name: 'Uruguay' },
            { code: 'uz', name: 'Uzbekistan' },
            { code: 'vu', name: 'Vanuatu' },
            { code: 'va', name: 'Vatican City' },
            { code: 've', name: 'Venezuela' },
            { code: 'vn', name: 'Vietnam' },
            { code: 'ye', name: 'Yemen' },
            { code: 'zm', name: 'Zambia' },
            { code: 'zw', name: 'Zimbabwe' }
        ];


// Initialize vote counts if empty
if (Object.keys(voteCounts).length === 0) {
    countries.forEach(country => {
        voteCounts[country.name] = 0;
    });
    localStorage.setItem('voteCounts', JSON.stringify(voteCounts));
}

// ====== DOM ELEMENTS ======
const liveRankingsEl = document.getElementById('liveRankings');
const countriesGridEl = document.getElementById('countriesGrid');
const voteTotalEl = document.getElementById('voteTotal');
const emailModal = document.getElementById('emailModal');
const submitEmailBtn = document.getElementById('submitEmail');
const getTicketBtn = document.getElementById('getTicketBtn');
const heroVoteBtn = document.getElementById('heroVoteBtn');

function showEmailModal() {
    if (userEmail) {
        alert("You already have a vote!");
        return;
    }
    emailModal.style.display = 'flex';
}

// ====== INITIALIZE APP ======
document.addEventListener('DOMContentLoaded', () => {
    fetch(`${backendURL}/votes`)
        .then(res => res.json())
        .then(data => {
            voteCounts = data;
            renderCountries();
            updateLiveRankings();
            updateVoteDisplay();

            if (hasVoted) {
                disableVoting();
            }
        });

    // Event listeners
    getTicketBtn.addEventListener('click', showEmailModal);
    heroVoteBtn.addEventListener('click', showEmailModal);
    submitEmailBtn.addEventListener('click', verifyEmail);
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            emailModal.style.display = 'none';
        });
    });

    // Navigation
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();
    
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                e.preventDefault();
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});


// ====== TICKET ANIMATION FUNCTIONS ======
function showTicketAnimation() {
    // Create confetti
    for (let i = 0; i < 100; i++) {
        createConfetti();
    }
    
    // Show ticket
    const ticket = document.getElementById('ticketAnimation');
    ticket.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        ticket.style.display = 'none';
        alert("Email verified! You can now vote.");
    }, 3000);
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    // Random properties
    const colors = ['#4fc3f7', '#ff5252', '#4caf50', '#ffeb3b', '#9c27b0'];
    const left = Math.random() * 100;
    const animationDuration = 2 + Math.random() * 3;
    const delay = Math.random() * 5;
    const size = 5 + Math.random() * 10;
    
    // Apply styles
    confetti.style.left = `${left}vw`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.animationDuration = `${animationDuration}s`;
    confetti.style.animationDelay = `${delay}s`;
    
    // Add to body
    document.body.appendChild(confetti);
    
    // Remove after animation
    setTimeout(() => {
        confetti.remove();
    }, (animationDuration + delay) * 1000);
}


// ====== CORE FUNCTIONS ======
function renderCountries() {
    countriesGridEl.innerHTML = '';
    
    countries.forEach(country => {
        const countryCard = document.createElement('div');
        countryCard.className = 'country-card';
        countryCard.innerHTML = `
            <img src="https://flagcdn.com/w80/${country.code}.png" 
                 alt="${country.name}" 
                 class="country-card-flag">
            <div>${country.name}</div>
            <button class="vote-btn" 
                    data-country="${country.name}" 
                    data-code="${country.code}"
                    ${hasVoted ? 'disabled' : ''}>
                ${hasVoted ? 'Voted' : 'Vote'}
            </button>
        `;
        countriesGridEl.appendChild(countryCard);
    });

    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const countryName = this.getAttribute('data-country');
            if (!userEmail) {
                showEmailModal();
                return;
            }
            if (hasVoted) {
                alert("You've already voted!");
                return;
            }
            castVote(countryName);
        });
    });
}

function updateLiveRankings() {
    liveRankingsEl.innerHTML = '';
    
    const rankedCountries = [...countries].sort((a, b) => {
        return (voteCounts[b.name] || 0) - (voteCounts[a.name] || 0);
    }).slice(0, 10);
    
    rankedCountries.forEach((country, index) => {
        const rank = index + 1;
        const votes = voteCounts[country.name] || 0;
        
        const rankItem = document.createElement('div');
        rankItem.className = 'ranking-item';
        rankItem.innerHTML = `
            <div class="rank${rank <= 3 ? ` rank-${rank}` : ''}">${rank}</div>
            <img src="https://flagcdn.com/w40/${country.code}.png" 
                 alt="${country.name}" 
                 class="country-flag">
            <div style="font-weight:bold;">${country.name}</div>
            <div class="country-votes">${votes} vote${votes !== 1 ? 's' : ''}</div>
        `;
        liveRankingsEl.appendChild(rankItem);
    });
}

function castVote(countryName) {
    if (hasVoted) return;

    const email = localStorage.getItem('userEmail');
    if (!email) {
        alert("Please enter your email or subscribe before voting.");
        return;
    }

    fetch(`${backendURL}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, country: countryName })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'error') {
            alert(data.message);
            return;
        }

        hasVoted = true;
        localStorage.setItem('hasVoted', 'true');

        // Fetch latest votes from backend after voting
        fetch(`${backendURL}/votes`)
          .then(res => res.json())
          .then(votesData => {
              voteCounts = votesData.votes || {};
              renderCountries();
              updateLiveRankings();
              updateVoteDisplay();
              disableVoting();
              alert(`Voted for ${countryName}!`);
          })
          .catch(err => {
              console.error('Failed to fetch updated votes:', err);
              updateLiveRankings();
              disableVoting();
              updateVoteDisplay();
              alert(`Voted for ${countryName}!`);
          });
    })
    .catch(err => {
        console.error("Vote failed:", err);
        alert("Vote failed. Please try again.");
    });
}


function verifyEmail() {
    const email = document.getElementById('userEmail').value.trim();
    const consent = document.getElementById('emailConsent').checked;

    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
    }
    if (!consent) {
        alert('Please agree to receive emails to continue.');
        return;
    }

    const submitBtn = document.getElementById('submitEmail');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    fetch(`${backendURL}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(err => { throw err; });
        }
        return res.json();
    })
    .then(data => {
        if (data.status === 'success') {
            userEmail = email;
            localStorage.setItem('userEmail', email);
            emailModal.style.display = 'none';
            showTicketAnimation();
        } else {
            throw new Error(data.message || 'Subscription failed');
        }
    })
    .catch(err => {
        console.error("Error:", err);
        alert(err.message || "An error occurred. Please try again.");
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get Voting Ticket';
    });
}


function disableVoting() {
    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.disabled = true;
        btn.textContent = '✓ Voted';
    });
    getTicketBtn.textContent = 'Already Voted';
    getTicketBtn.style.backgroundColor = '#666';
    heroVoteBtn.textContent = 'Already Voted';
    heroVoteBtn.style.backgroundColor = '#666';
    updateVoteDisplay(); // Ensure vote count updates
}

function updateVoteDisplay() {
    const voteCountElement = document.getElementById('voteTotal');
    voteCountElement.textContent = hasVoted ? '1' : '0';
    
    const voteContainer = voteCountElement.closest('.vote-count');
    if (hasVoted) {
        voteContainer.classList.add('has-voted');
        voteContainer.querySelector('.vote-text').textContent = 'Vote';
    } else {
        voteContainer.classList.remove('has-voted');
        voteContainer.querySelector('.vote-text').textContent = 'Votes';
    }
}

function updateActiveNav() {
    const scrollPosition = window.scrollY + 100;
    
    document.querySelectorAll('nav a').forEach(link => {
        const section = document.querySelector(link.getAttribute('href'));
        if (section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            link.classList.toggle(
                'active',
                scrollPosition >= sectionTop && 
                scrollPosition < sectionTop + sectionHeight
            );
        }
    });
}

fetch(`${backendURL}/votes`)
  .then(res => {
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  })
  .catch(err => {
    console.error('Failed to fetch votes:', err);
    // Fallback to local storage if API fails
    const localVotes = localStorage.getItem('voteCounts');
    if (localVotes) {
      voteCounts = JSON.parse(localVotes);
      renderCountries();
      updateLiveRankings();
    }
  });

window.addEventListener('DOMContentLoaded', () => {
    fetch(`${backendURL}/votes`)
        .then(res => res.json())
        .then(data => {
            voteCounts = data.votes || {};
            renderCountries();
            updateLiveRankings();
            updateVoteDisplay();
        })
        .catch(err => {
            console.error('Failed to fetch votes:', err);
        });
});
