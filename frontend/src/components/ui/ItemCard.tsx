import React from 'react'
import { Link } from 'react-router-dom';
import { useCart } from '@/features/cart';

interface ItemCardProps {
  id: string;
  title: string;
  image: string;
  price: number;
}

const ItemCard: React.FC<ItemCardProps> = ({id, title, image, price}) => {
  const { addToCart } = useCart();
  return (
    <div className='border p-4 rounded'>
        <Link to={`/product/${id}`} className='block'>
            <img src={image} alt={title} className='w-full h-32 object-cover mb-2' />
            <h2 className='font-bold'>{title}</h2>
            <p className='text-gray-700'>${price.toFixed(2)}</p>
        </Link>
    </div>
  )
}

export default ItemCard