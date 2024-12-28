'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { addStackItem } from './actions'

const ITEM_TYPES = [
  { label: 'Supplement', value: 'supplement' },
  { label: 'Medication', value: 'medication' },
  { label: 'Exercise', value: 'exercise' },
  { label: 'Diet', value: 'diet' },
  { label: 'Habit', value: 'habit' },
  { label: 'Other', value: 'other' }
]

export function NewItemForm({ stackId }: { stackId: string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      type: formData.get('type') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string || '',
      dosage: formData.get('dosage') as string || null,
      frequency: formData.get('frequency') as string || null,
      timing: formData.get('timing') as string || null,
    }

    try {
      await addStackItem(stackId, data)
      toast.success('Item added successfully')
      router.push(`/dashboard/stacks/${stackId}`)
      router.refresh()
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add item. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="type" className="block text-sm font-medium mb-2">
          Type
        </label>
        <select
          id="type"
          name="type"
          required
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">Select a type</option>
          {ITEM_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="Enter name"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Enter description"
          className="w-full px-3 py-2 border rounded-md resize-none"
          rows={4}
        />
      </div>

      <div>
        <label htmlFor="dosage" className="block text-sm font-medium mb-2">
          Dosage
        </label>
        <input
          type="text"
          id="dosage"
          name="dosage"
          placeholder="e.g., 500mg"
          className="w-full px-3 py-2 border rounded-md"
        />
        <p className="mt-1 text-sm text-gray-500">
          Optional: Specify the dosage if applicable
        </p>
      </div>

      <div>
        <label htmlFor="frequency" className="block text-sm font-medium mb-2">
          Frequency
        </label>
        <input
          type="text"
          id="frequency"
          name="frequency"
          placeholder="e.g., Once daily"
          className="w-full px-3 py-2 border rounded-md"
        />
        <p className="mt-1 text-sm text-gray-500">
          Optional: How often should this be taken/done?
        </p>
      </div>

      <div>
        <label htmlFor="timing" className="block text-sm font-medium mb-2">
          Timing
        </label>
        <input
          type="text"
          id="timing"
          name="timing"
          placeholder="e.g., Morning with breakfast"
          className="w-full px-3 py-2 border rounded-md"
        />
        <p className="mt-1 text-sm text-gray-500">
          Optional: When should this be taken/done?
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'Adding...' : 'Add Item'}
      </button>
    </form>
  )
} 