import { useEffect } from 'react'
import MaterialCard from '../components/ui/MaterialCard.jsx'
import { useSavedStore } from '../store/savedStore.js'

export default function SavedPage() {
  const { materials, loading, fetchSaved } = useSavedStore()

  useEffect(() => {
    fetchSaved(true)
  }, [fetchSaved])

  return (
    <div>
      <div style={{marginBottom:24}}>
        <h2 style={{fontSize:24,fontWeight:800,marginBottom:4}}>Saved materials</h2>
        <p style={{color:'var(--text3)',fontSize:14}}>{materials.length} material{materials.length!==1?'s':''} saved</p>
      </div>
      {loading ? <div className="spinner" /> : materials.length===0 ? (
        <div className="empty-state">
          <h3>Nothing saved yet</h3>
          <p>Click the ♡ Save button on any material to bookmark it here</p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
          {materials.map(m=><MaterialCard key={m._id} material={m} />)}
        </div>
      )}
    </div>
  )
}
