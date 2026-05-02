function toggleMenu(){
 const menu = document.getElementById('menu');
 menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function openLogin(){
 document.getElementById('loginModal').style.display = 'block';
}

function closeLogin(){
 document.getElementById('loginModal').style.display = 'none';
}
