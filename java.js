var info = ["Software Developer","Frontend Developer","Problem Solver","Tech Enthusiast"];
var index = 0;
var speed = 100;
var pause = 2000;
var deletingSpeed = 50;
let charIndex = 0;
let isDeleting = false;

function type() {
    const name = info[index];
    const t_elem = document.getElementById('typing-text');

    if (isDeleting) {
        t_elem.textContent = name.substring(0, charIndex - 1);
        charIndex--;
    } else {
        t_elem.textContent = name.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeedVar = isDeleting ? deletingSpeed : speed;

    if (!isDeleting && charIndex === name.length)
    {
        typeSpeedVar = pause;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) 
    {
        isDeleting = false;
        index = (index + 1) % info.length;
        typeSpeedVar = 500;
    }

    setTimeout(type, typeSpeedVar);
}
document.addEventListener("DOMContentLoaded", type);

