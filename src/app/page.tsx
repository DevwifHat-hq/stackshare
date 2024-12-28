import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Users, Star } from 'lucide-react'

type Stack = {
  id: string
  name: string
  description: string
  created_at: string
  views: number
  likes: number
  user_profiles: {
    full_name: string
    avatar_url: string | null
  } | null
  stack_categories: Array<{
    categories: {
      id: string
      name: string
      slug: string
    } | null
  }> | null
}

async function getFeaturedContent() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  const { data: featuredStacks } = await supabase
    .from('stacks')
    .select(`
      id,
      name,
      description,
      created_at,
      views,
      likes,
      user_profiles (
        full_name,
        avatar_url
      ),
      stack_categories (
        categories (
          id,
          name,
          slug
        )
      )
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(3)

  return {
    categories: categories || [],
    featuredStacks: (featuredStacks as any[] || []).map(stack => ({
      ...stack,
      user_profiles: Array.isArray(stack.user_profiles) ? stack.user_profiles[0] : null,
      stack_categories: stack.stack_categories?.map((sc: any) => ({
        categories: sc.categories
      })) || null
    })) as Stack[]
  }
}

export default async function HomePage() {
  const { categories, featuredStacks } = await getFeaturedContent()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <Link href="/dashboard/discover" className="inline-flex space-x-6">
                <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
                  What's new
                </span>
                <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                  <span>Just shipped v1.0</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Discover and Share Biohacking Stacks
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Explore curated collections of supplements, routines, and practices. Learn from the community and optimize your performance.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/dashboard/discover"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </Link>
              <Link 
                href="/dashboard/discover" 
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600 transition-colors"
              >
                Browse stacks <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <img
                src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png"
                alt="App screenshot"
                width={2432}
                height={1442}
                className="w-[76rem] rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Browse by Category</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Explore stacks organized by their primary focus and benefits
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
            {categories?.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-x-4">
                  <h3 className="text-lg font-semibold leading-8 text-gray-900">{category.name}</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Stacks Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Featured Stacks</h2>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              Discover the latest and most popular stacks from our community
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {featuredStacks?.map((stack) => (
              <article key={stack.id} className="flex max-w-xl flex-col items-start justify-between">
                <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime={stack.created_at} className="text-gray-500">
                    {new Date(stack.created_at).toLocaleDateString()}
                  </time>
                  {stack.stack_categories?.[0]?.categories && (
                    <Link
                      href={`/categories/${stack.stack_categories[0].categories.slug}`}
                      className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                    >
                      {stack.stack_categories[0].categories.name}
                    </Link>
                  )}
                </div>
                <div className="group relative">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                    <Link href={`/dashboard/stacks/${stack.id}`}>
                      <span className="absolute inset-0" />
                      {stack.name}
                    </Link>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{stack.description}</p>
                </div>
                <div className="relative mt-8 flex items-center gap-x-4">
                  {stack.user_profiles?.avatar_url ? (
                    <img src={stack.user_profiles.avatar_url} alt="" className="h-10 w-10 rounded-full bg-gray-50" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="text-sm leading-6">
                    <p className="font-semibold text-gray-900">
                      <span className="absolute inset-0" />
                      {stack.user_profiles?.full_name || 'Anonymous'}
                    </p>
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-x-4 text-gray-500">
                    <div className="flex items-center gap-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{stack.views}</span>
                    </div>
                    <div className="flex items-center gap-x-1">
                      <Star className="h-4 w-4" />
                      <span>{stack.likes}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
