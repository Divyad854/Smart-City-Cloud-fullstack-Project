import React,{useState,useEffect} from "react" 
import Sidebar from "../../components/Sidebar"
import API from "../../utils/api"
import { toast } from "react-toastify"

export default function Teams(){

const [teams,setTeams] = useState([])
const [name,setName] = useState("")

const load = async()=>{

try{

const r = await API.get("/teams")

setTeams(r.data.teams || [])

}catch(err){

console.error(err)
setTeams([])

}

}

useEffect(()=>{load()},[])

const add = async()=>{

if(!name.trim()) return toast.error("Enter team name")

try{

await API.post("/teams/admin/team",{name})

toast.success("Team added")

setName("")

load()

}catch{

toast.error("Failed to add team")

}

}

const del = async(id)=>{

try{

await API.delete(`/teams/admin/team/${id}`)

toast.success("Team deleted")

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

<h2>👥 Teams ({teams.length})</h2>

</div>

<div className="page-content">

<div className="card" style={{marginBottom:20}}>

<div style={{display:"flex",gap:10}}>

<input
value={name}
onChange={(e)=>setName(e.target.value)}
placeholder="Add new team..."
style={{
flex:1,
padding:"8px 12px",
border:"1.5px solid #e2e8f0",
borderRadius:8,
fontSize:14
}}
/>

<button
className="btn btn-primary"
onClick={add}
>
Add Team
</button>

</div>

</div>

{teams.length===0 ? (

<div className="empty-state">

<div className="empty-icon">👥</div>

<h3>No teams found</h3>

</div>

) : (

<div className="card">

<div className="table-container">

<table>

<thead>

<tr>

<th>#</th>
<th>Team Name</th>
<th>Action</th>

</tr>

</thead>

<tbody>

{teams.map((t,index)=>(

<tr key={t}>

<td style={{color:"#718096",fontSize:13}}>
{index+1}
</td>

<td style={{fontWeight:600}}>
{t}
</td>

<td>

<button
className="btn btn-danger"
style={{
fontSize:12,
padding:"5px 12px"
}}
onClick={()=>del(t)}
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