import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

export default async function EditItemPage({ 
  params 
}: { 
  params: { id: string; itemId: string } 
}) {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // Get stack and verify ownership
  const { data: stack } = await supabase
    .from('stacks')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!stack || stack.user_id !== session?.user?.id) {
    redirect('/dashboard/stacks')
  }

  // Get item
  const { data: item } = await supabase
    .from('stack_items')
    .select('*')
    .eq('id', params.itemId)
    .eq('stack_id', params.id)
    .single()

  if (!item) {
    redirect(`/dashboard/stacks/${params.id}`)
  }

  async function updateItem(formData: FormData) {
    'use server'

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      redirect('/auth/login')
    }

    // Get form data
    const type = formData.get('type') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const dosage = formData.get('dosage') as string
    const frequency = formData.get('frequency') as string
    const timing = formData.get('timing') as string
    const imageFile = formData.get('image') as File

    let image_url = item.image_url

    // Upload new image if provided
    if (imageFile && imageFile.size > 0) {
      // Delete old image if exists
      if (item.image_url) {
        const oldPath = item.image_url.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('stack-items')
            .remove([`${session.user.id}/${params.id}/${oldPath}`])
        }
      }

      // Upload new image
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${session.user.id}/${params.id}/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('stack-items')
        .upload(filePath, imageFile)

      if (!uploadError && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('stack-items')
          .getPublicUrl(filePath)
        
        image_url = publicUrl
      }
    }

    // Update item
    const { error } = await supabase
      .from('stack_items')
      .update({
        type,
        name,
        description,
        dosage: dosage || null,
        frequency: frequency || null,
        timing: timing || null,
        image_url,
      })
      .eq('id', params.itemId)
      .eq('stack_id', params.id)

    if (error) {
      console.error('Error updating item:', error)
      return
    }

    redirect(`/dashboard/stacks/${params.id}`)
  }

  return (
    <div className="py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Edit Item in {stack.name}</h2>
        <p className="text-muted-foreground">
          Update the details of your stack item
        </p>
      </div>

      <div className="max-w-2xl">
        <form action={updateItem} className="space-y-8">
          {/* Type Selection */}
          <div className="space-y-4">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
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
                    defaultChecked={item.type === type.value}
                    className="peer sr-only"
                    required
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
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="name"
                name="name"
                defaultValue={item.name}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="description"
                name="description"
                defaultValue={item.description || ''}
              />
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
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="dosage"
                name="dosage"
                defaultValue={item.dosage || ''}
                placeholder="e.g., 5000 IU, 2 capsules, 1 scoop"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="frequency"
              >
                Frequency
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="frequency"
                name="frequency"
                defaultValue={item.frequency || ''}
                placeholder="e.g., Daily, Twice daily, As needed"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="timing"
              >
                Timing
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="timing"
                name="timing"
                defaultValue={item.timing || ''}
                placeholder="e.g., Morning, With meals, Before bed"
              />
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
            {item.image_url && (
              <div className="mb-2">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              name="image"
              id="image"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-sm text-muted-foreground">
              Upload a new image to replace the existing one (optional)
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
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-black"
            >
              Update Item
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 