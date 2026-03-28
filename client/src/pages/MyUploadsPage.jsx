import { useState, useEffect } from 'react'
import { getMyUploads } from '../api/index.js'
import MaterialCard from '../components/ui/MaterialCard.jsx'
import { useMaterialStore } from '../store/materialStore.js'

export default function MyUploadsPage() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const { removeMaterial } = useMaterialStore()

  useEffect(() => {
    getMyUploads().then(r=>setMaterials(r.data.materials)).catch(console.error).finally(()=>setLoading(false))
  }, [])

  const handleRemove = (id) => { setMaterials(p=>p.filter(m=>m._id!==id)); removeMaterial(id) }

  return (
    <div>
      <div style={{marginBottom:24}}>
        <h2 style={{fontSize:24,fontWeight:800,marginBottom:4}}>My uploads</h2>
        <p style={{color:'var(--text3)',fontSize:14}}>{materials.length} material{materials.length!==1?'s':''} uploaded by you</p>
      </div>
      {loading ? <div className="spinner" /> : materials.length===0 ? (
        <div className="empty-state">
          <h3>No uploads yet</h3>
          <p>Start contributing to help your juniors!</p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
          {materials.map(m=>(
            <MaterialCard key={m._id} material={m} showDelete onDelete={()=>handleRemove(m._id)} />
          ))}
        </div>
      )}
    </div>
  )
}
