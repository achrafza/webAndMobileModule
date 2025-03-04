// DOM Elements
const nameElement = document.getElementById('name');
const themeToggle = document.getElementById('theme-toggle');
const navLinks = document.querySelectorAll('nav ul li a');
const skillLevels = document.querySelectorAll('.skill-level');
const header = document.querySelector('header');

// Typing effect for the name
const fullName = nameElement.textContent;
nameElement.textContent = '';

let i = 0;
function typeWriter() {
  if (i < fullName.length) {
    nameElement.textContent += fullName.charAt(i);
    i++;
    setTimeout(typeWriter, 100);
  }
}

// Start the typing effect when the page loads
document.addEventListener('DOMContentLoaded', () => {
  typeWriter();
  animateSkillBars();
});

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  
  // Change the icon based on the theme
  if (document.body.classList.contains('dark-theme')) {
    themeToggle.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  } else {
    themeToggle.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  }
});

// Check for saved theme preference
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-theme');
  themeToggle.textContent = '☀️';
}

// Smooth scrolling for navigation links
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    window.scrollTo({
      top: targetSection.offsetTop - 80, // Account for fixed header
      behavior: 'smooth'
    });
    
    // Update active link
    navLinks.forEach(link => link.classList.remove('active'));
    this.classList.add('active');
  });
});

// Animate skill bars on scroll
function animateSkillBars() {
  skillLevels.forEach(skill => {
    const width = skill.style.width;
    skill.style.width = '0';
    
    setTimeout(() => {
      skill.style.width = width;
    }, 300);
  });
}

// Update active navigation link based on scroll position
window.addEventListener('scroll', () => {
  const scrollPosition = window.scrollY;
  
  // Add shadow to header on scroll
  if (scrollPosition > 10) {
    header.style.boxShadow = 'var(--shadow-lg)';
  } else {
    header.style.boxShadow = 'var(--shadow)';
  }
  
  // Update active nav link
  const sections = document.querySelectorAll('section');
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
});