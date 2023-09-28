fetch("/addtocart",{
    method:"post",
    headers:{"content-Type":'application/json'},
    body:JSON.stringify({
        name:"bibin"
    })

}).then(res=>{
    console.log(res.json())
})