import React,{useEffect,useState} from "react"
import Sidebar from "../../components/Sidebar"
import API from "../../utils/api"
import {toast} from "react-toastify"

export default function ServiceMembers(){

const [users,setUsers] = useState([])
const [loading,setLoading] = useState(true)

const load = async()=>{

try{

const r = await API.get("/admin/service-users")

setUsers(r.data.users || [])

}catch(err){

console.log(err)
setUsers([])

}finally{

setLoading(false)

}

}

useEffect(()=>{load()},[])

const del = async(id)=>{

try{

await API.delete(`/admin/service-users/${id}`)

toast.success("User removed")

load()

}catch{

toast.error("Delete failed")

}

}

return(

<div className="layout">

<Sidebar/>

<div className="main-content">

<div className="top-bar">
<h2>👷 Service Members ({users.length})</h2>
</div>

<div className="page-content">

{loading ? (

<div className="loading-screen">
<div className="spinner"></div>
</div>

) : users.length===0 ? (

<div className="empty-state">
<div className="empty-icon">👷</div>
<h3>No service members found</h3>
</div>

) : (

<div className="card">

<div className="table-container">

<table>

<thead>

<tr>
<th>Username</th>
<th>Email</th>
<th>Team</th>
<th>Action</th>
</tr>

</thead>

<tbody>

{users.map(u=>(

<tr key={u.id}>

<td style={{fontWeight:600}}>
{u.username}
</td>

<td>
{u.email}
</td>

<td>
<span className="badge badge-assigned">
{u.team}
</span>
</td>

<td>

<button
className="btn btn-danger"
style={{fontSize:12,padding:"5px 12px"}}
onClick={()=>del(u.id)}
>
Delete
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)}

</div>

</div>

</div>

)

}