import { useEffect } from "react"
import axios from "axios"


function SellerProduct() {
  useEffect(()=>{
    const token = localStorage.getItem("token")
    axios.get("http://localhost:8000/api/seller/products",{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    .then((res)=>{})
    .catch((err)=>{})
  },[])
  return (
    <div>
      <h1>Seller Products</h1>
    </div>
  )
}

export default SellerProduct

