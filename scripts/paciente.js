document.addEventListener("DOMContentLoaded",()=>{
    let logout = document.getElementById('logout')

    logout.addEventListener("click",function(){
        fetch('/logout',{
          method:'POST',
          headers:{
            'Content-Type': 'application/json'
          },
        })
        .then(response =>{
          if(response.ok){
            window.location.href = '/'
          }else{
            console.log("Error al cerrar sesion")
          }
        })
        .catch(error=>{
          console.log('Error:',error)
        })
      })
  
})

