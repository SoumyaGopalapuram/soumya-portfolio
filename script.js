// mobile menu toggle
const menuBtn = document.getElementById('menuBtn')
const nav = document.getElementById('nav')

menuBtn.addEventListener('click', () => {
  nav.classList.toggle('open')
})

// close menu when a link is clicked
nav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => nav.classList.remove('open'))
})

// dynamic year
document.getElementById('year').textContent = new Date().getFullYear()
