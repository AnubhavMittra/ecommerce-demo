import React, { useEffect, useState } from 'react'
import { useFilter } from '@/features/filters/FilterContext'
import { Tally2, Tally3 } from 'lucide-react'
import axios from 'axios'
import ItemCard from '@/components/ui/ItemCard'

const MainContent = () => {

  const { searchQuery, selectedCategory, minPrice, maxPrice, keyword } = useFilter()

  const [products, setProducts] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const itemsPerPage = 8

  useEffect(() => {
    const isFiltering = Boolean(
      searchQuery || selectedCategory || minPrice !== undefined || maxPrice !== undefined || (keyword && keyword.trim() !== '')
    );

    if (isFiltering) {
      if (keyword && keyword.trim() !== '') {
        axios.get(`http://localhost:8081/api/v1/products?q=${encodeURIComponent(keyword)}`)
          .then(response => {
            setProducts(response.data.products || response.data || []);
          })
          .catch(error => {
            console.error('Error fetching products:', error);
          });
      } else {
        axios.get('http://localhost:8081/api/v1/products?limit=100')
          .then(response => {
            setProducts(response.data.products || response.data || []);
          })
          .catch(error => {
            console.error('Error fetching products:', error);
          });
      }
    } else {
      let url = `http://localhost:8081/api/v1/products?limit=${itemsPerPage}&skip=${(currentPage - 1) * itemsPerPage}`;
      axios.get(url)
        .then(response => {
          setProducts(response.data.products || response.data || []);
        })
        .catch(error => {
          console.error('Error fetching products:', error);
        });
    }
  }, [currentPage, searchQuery, selectedCategory, minPrice, maxPrice, keyword]);

  useEffect(() => {
    setFilteredProducts(getFilteredProducts());
  }, [products, searchQuery, selectedCategory, minPrice, maxPrice, filter])


  const getFilteredProducts = () => {
    let filteredProducts = products;

    if (searchQuery) {
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filteredProducts = filteredProducts.filter(product =>
        product.category === selectedCategory
      );
    }

    if (minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product =>
        product.price >= minPrice
      );
    }

    if (maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product =>
        product.price <= maxPrice
      );
    }

    switch (filter) {
        case 'cheap':
            filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'expensive':
            filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
            filteredProducts = filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        default:
            filteredProducts
    }

    console.log('Filtered products:', filteredProducts);

    return filteredProducts;
  }

  const paginatedProducts = (() => {
    const isFiltering = Boolean(
      searchQuery || selectedCategory || minPrice !== undefined || maxPrice !== undefined || (keyword && keyword.trim() !== '')
    );
    if (isFiltering) {
      const startIdx = (currentPage - 1) * itemsPerPage;
      return filteredProducts.slice(startIdx, startIdx + itemsPerPage);
    }
    return filteredProducts;
  })();

  const isFiltering = Boolean(
    searchQuery || selectedCategory || minPrice !== undefined || maxPrice !== undefined || (keyword && keyword.trim() !== '')
  );
  const totalFiltered = isFiltering ? filteredProducts.length : 100;
  const totalPages = Math.ceil(totalFiltered / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  }

  const getPaginationButtons = () => {
    const buttons: number[] = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    if(currentPage - 2 < 1) {
      endPage = Math.min(totalPages, endPage + (2 - (currentPage - 1)));
    }
    if(currentPage + 2 > totalPages) {
      startPage = Math.max(1, startPage - ((currentPage + 2) - totalPages)); // Math.min(1, startPage - (2 - currentPage - totalPages));
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(i);
    }
    return buttons
 }

  return (
    <section className="xl:w-[55rem] lg:w-[55rem] sm:w-[40rem] xs:w-[20rem] p-5">
        <div className="mb-5">
            <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="relative mb-5 mt-5">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="border px-4 py-2 rounded-full flex items-center">
                        <Tally3 className="mr-2" />
                        {filter === 'all' ? 'All Products' : filter.charAt(0).toUpperCase() + filter.slice(1)}  
                    </button>
                    {dropdownOpen && (
                        <div className="absolute bg-white border border-gray-300 rounded mt-2 w-full sm:w-40">
                            <button onClick={() => { setFilter('cheap'); setDropdownOpen(false) }} className="block px-4 py-2 hover:bg-gray-200 w-full text-left">Cheap</button>
                            <button onClick={() => { setFilter('expensive'); setDropdownOpen(false) }} className="block px-4 py-2 hover:bg-gray-200 w-full text-left">Expensive</button>
                            <button onClick={() => { setFilter('popular'); setDropdownOpen(false)}} className="block px-4 py-2 hover:bg-gray-200 w-full text-left">Popular</button>
                        </div>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-4 sm:grids-3 md:grid-cols-4 gap-5">
                    {paginatedProducts.map((product) => (
                        <ItemCard key={product.id} id={product.id} title={product.title} image={product.thumbnail} price={product.price}/>
                    ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-5">

                <button className="border px-4 py-2 mx-2 rounded-full" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                <div className="flex flex-wrap justify-center">
                    {getPaginationButtons().map((page) => (
                        <button
                            key={page}
                            className={`border px-4 py-2 mx-1 rounded-full ${currentPage === page ? 'bg-black text-white' : ''}`}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </button>
                    ))}
                </div>
                <button className="border px-4 py-2 mx-2 rounded-full" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
        </div>
    </section>
  )
}

export default MainContent
