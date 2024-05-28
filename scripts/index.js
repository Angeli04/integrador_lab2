const login = document.getElementById("login")
const register = document.getElementById("register")

login.addEventListener("click",()=>{
        window.location.href = 'http://localhost:3000/principal'
})

register.addEventListener("click",()=>{
        window.location.href = 'http://localhost:3000/register'
})