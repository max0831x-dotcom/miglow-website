const fades = document.querySelectorAll('.fade');

window.addEventListener('scroll', () => {
 fades.forEach(el => {
 const top = el.getBoundingClientRect().top;
 if(top < window.innerHeight - 100){
 el.classList.add('show');
 }
 });
});
