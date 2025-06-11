import axios from 'axios';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '@/features/cart/CartContext';
import { Product } from '@/types/product';


const ProductItem = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = React.useState<Product | null>(null);
    const [quantity, setQuantity] = React.useState(1);
    const { addToCart } = useCart();

    useEffect(() => {
       if (id) {
        axios.get<Product>(`http://localhost:8081/api/v1/products/${id}`).then(response => {
            setProduct(response.data);
        }
        ).catch(error => {
            console.error("Error fetching product:", error);
        }
        );
       } else {
        console.error("Product ID is not provided");
       }
    }, [id]);

    if (!product) {
        return <div>Loading...</div>;
    }
  return (
    <div className="p-5 w-[60%]">
        <button onClick={() => navigate(-1)} className="mb-5 px-4 py-2 bg-black text-white rounded">Back</button>
        <img src={product.images[0]} alt={product.title} className="w-[50%] h-auto mb-5" />
        <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
        <p className="mb-4 text-gray-700 w-[70%]">{product.description}</p>
        <div className="flex mb-4">
            <p>Price: ${product.price}</p>
            <p className="ml-10">Rating: {product.rating}</p>
        </div>
        <div className="flex items-center mb-4">
          <label className="mr-2 font-medium">Quantity:</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
            className="border rounded px-2 py-1 w-16"
          />
        </div>
        <button
          className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          onClick={() => addToCart({
            id: Number(product.id),
            title: product.title,
            image: product.images[0],
            price: product.price,
            quantity
          })}
        >
          Add to Cart
        </button>
    </div>

  )
}

export default ProductItem