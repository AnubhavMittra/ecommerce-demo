import React, { useEffect } from 'react'
import { useFilter } from '@/features/filters/FilterContext'

interface FetchResponse {
  products: Product[]
}

interface Product {
  category: string
}

const Sidebar = () => {

  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, minPrice, setMinPrice, maxPrice, setMaxPrice, keyword, setKeyword } = useFilter()


  const [categories, setCategories] = React.useState<string[]>([])
  const [keywords] = React.useState<string[]>([
    "Apple",
    "Watch",
    "Fashion",
    "Trending",
    "Shoes",
    "Clothing"
  ])

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numericValue = value ? parseFloat(value) : undefined
    setMinPrice(numericValue)
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numericValue = value ? parseFloat(value) : undefined
    setMaxPrice(numericValue)
  }

  const handleRadioChangeCategories = (category: string) => {
    setSelectedCategory(category);
    setKeyword(''); 
  }

  const handleKeywordClick = (keyword: string) => {
    setKeyword(keyword);
    setSelectedCategory(''); 
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setMinPrice(undefined)
    setMaxPrice(undefined)
    setKeyword('')
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/v1/products')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data : FetchResponse = await response.json()
        const uniqueCategories = Array.from(new Set(data.products.map((product: Product) => product.category)))
        setCategories(uniqueCategories)
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    fetchCategories()
  }, [])
  return (
    <div className="w-64 p-5 h-screen">
      <h1 className="text-2xl font-bold mb-10 mt-4">Filters</h1>
      <section>
        <input type="text" className='border-w rounded px-2 sm:mb-0' placeholder='Search Products' value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

        <div className="flex justify-center items-center">
          <input type="text" className='border-2 mr-3 px-5 py-3 mb-3 w-full' placeholder='Min' value={minPrice ?? ''} onChange={handleMinPriceChange} />
          <input type="text" className='border-2 mr-3 px-5 py-3 mb-3 w-full' placeholder='Max' value={maxPrice ?? ''} onChange={handleMaxPriceChange}/>
        </div>

        {/* Categories */}
        <div className="mb-5"><h2 className="text-xl font-semibold mb-3">Categories</h2></div>
        {
          categories.map((category, index) => (
            <label key={index} className="block mb-2">
              <input type="radio" name="category" value={category} className="mr-2 w-[16px] h-[16px]" onChange={() => handleRadioChangeCategories(category)} checked={selectedCategory === category} />
              {category}
              </label>
          )
        )}
      </section>
      <section>
        <div className="mb-5 mt-4">
          <h2 className="text-xl font-semibold mb-3">Keywords</h2>
          <div>
            {keywords.map((keyword, index) => (
              <button key={index} className="block mb-3 px-4 py-2 w-full text-left border rounded hover:bg-gray-200" onClick={() => handleKeywordClick(keyword)}>
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </section>
      <button onClick={handleResetFilters} className='w-full mb-[4rem] py-2 bg-black text-white rounded mt-5'>Reset Filters</button>
    </div>
  )
}

export default Sidebar