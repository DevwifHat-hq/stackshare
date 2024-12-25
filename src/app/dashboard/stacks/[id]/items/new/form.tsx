'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

const ITEM_TYPES = [
  {
    value: 'supplement',
    label: 'Supplement',
    description: 'Vitamins, minerals, herbs, and other dietary supplements',
  },
  {
    value: 'food',
    label: 'Food',
    description: 'Specific foods, drinks, or recipes that are part of your stack',
  },
  {
    value: 'routine',
    label: 'Routine',
    description: 'Activities, exercises, or practices in your stack',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Any other items that don\'t fit the categories above',
  },
]

interface Props {
  params: { id: string }
  stack: {
    id: string
    name: string
  }
  createItem: (formData: FormData) => Promise<{ error?: string }>
}

export default function NewItemForm({ params, stack, createItem }: Props) {
  const [validFields, setValidFields] = useState({
    type: false,
    name: false,
    description: false,
    dosage: false,
    frequency: false,
    timing: false,
  })

  const handleInputChange = (field: keyof typeof validFields, value: string) => {
    setValidFields(prev => ({
      ...prev,
      [field]: value.length >= (field === 'name' ? 2 : 3)
    }))
  }

  return (
    <div className="py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Add Item to {stack.name}</h2>
        <p className="text-muted-foreground">
          Add a new item to your stack
        </p>
      </div>

      <div className="max-w-2xl">
        <form action={createItem} className="space-y-8">
          {/* Type Selection */}
          <div className="space-y-4">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ITEM_TYPES.map((type) => (
                <label
                  key={type.value}
                  className="relative flex cursor-pointer rounded-lg border bg-card p-4 hover:bg-accent"
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    className="peer sr-only"
                    required
                    onChange={() => handleInputChange('type', type.value)}
                  />
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold">{type.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {type.description}
                    </div>
                  </div>
                  <div className="absolute right-4 top-4 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border peer-checked:bg-primary peer-checked:text-primary-foreground">
                    <div className="h-2 w-2 rounded-full bg-background peer-checked:bg-background" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="name"
              >
                Name
              </label>
              <div className="relative">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="name"
                  name="name"
                  placeholder="Vitamin D3"
                  required
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {validFields.name && (
                  <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="description"
              >
                Description
              </label>
              <div className="relative">
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="description"
                  name="description"
                  placeholder="Description of the item and its benefits"
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
                {validFields.description && (
                  <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="dosage"
              >
                Dosage
              </label>
              <div className="relative">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="dosage"
                  name="dosage"
                  placeholder="e.g., 5000 IU, 2 capsules, 1 scoop"
                  onChange={(e) => handleInputChange('dosage', e.target.value)}
                />
                {validFields.dosage && (
                  <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="frequency"
              >
                Frequency
              </label>
              <div className="relative">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="frequency"
                  name="frequency"
                  placeholder="e.g., Daily, Twice daily, As needed"
                  onChange={(e) => handleInputChange('frequency', e.target.value)}
                />
                {validFields.frequency && (
                  <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="timing"
              >
                Timing
              </label>
              <div className="relative">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="timing"
                  name="timing"
                  placeholder="e.g., Morning, With meals, Before bed"
                  onChange={(e) => handleInputChange('timing', e.target.value)}
                />
                {validFields.timing && (
                  <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="image"
            >
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              name="image"
              id="image"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-sm text-muted-foreground">
              Upload an image of your item (optional)
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <a
              href={`/dashboard/stacks/${params.id}`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Cancel
            </a>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 