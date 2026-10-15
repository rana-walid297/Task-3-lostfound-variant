import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const CATEGORIES = ['electronics', 'clothing', 'documents', 'accessories', 'other']
const STATUSES = ['lost', 'found', 'claimed']
const defaults = { title: '', description: '', category: 'other', status: 'lost', location: '' }

export default function ItemForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // When editing (id is present), load the item and fill the form
  useEffect(() => {
    if (!id) {
      setForm(defaults)
      return
    }

    let active = true
    api.get(`/items/${id}`)
      .then(res => {
        if (!active) return
        const item = res.data.item
        if (item) {
          setForm({
            title: item.title || '',
            description: item.description || '',
            category: item.category || 'other',
            status: item.status || 'lost',
            location: item.location || ''
          })
        }
      })
      .catch(err => {
        if (!active) return
        setError(err?.response?.data?.message || 'Failed to load item')
      })

    return () => {
      active = false
    }
  }, [id])

  // Update form state on any input change
  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Submit new item (POST) or update existing item (PATCH)
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (id) {
        await api.patch(`/items/${id}`, form)
      } else {
        await api.post('/items', form)
      }
      nav('/items')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save item')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Report'} Item</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={onChange}
        />
        <select
          className="input"
          name="status"
          value={form.status}
          onChange={onChange}
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select
          className="input"
          name="category"
          value={form.category}
          onChange={onChange}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        <input
          className="input"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={onChange}
        />
        <textarea
          className="input"
          name="description"
          rows={3}
          placeholder="Description"
          value={form.description}
          onChange={onChange}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
