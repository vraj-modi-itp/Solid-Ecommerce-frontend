let simulatedDatabase = [];

export const initializeDatabase = async () => {
  const response = await fetch('https://fakestoreapi.com/products');
  if (!response.ok) throw new Error('Failed to fetch products');
  const data = await response.json();
  
  simulatedDatabase = [];
  // Replicate to reach 800+ items as per performance requirements 
  for (let i = 0; i < 40; i++) {
    data.forEach((item) => {
      simulatedDatabase.push({
        ...item,
        id: `${item.id}-${i}`, 
        price: Number((item.price + (Math.random() * 5)).toFixed(2)), 
        title: `${item.title} (Batch ${i + 1})`
      });
    });
  }
};

export const fetchPage = async (pageIndex, pageSize = 20) => {
  await new Promise(resolve => setTimeout(resolve, 150));
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;
  return {
    data: simulatedDatabase.slice(startIndex, endIndex),
    hasMore: endIndex < simulatedDatabase.length
  };
};

// CRITICAL FIX: Ensure this exact name is exported for ProductDetail.jsx
export const fetchProductById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 150));
  const product = simulatedDatabase.find(p => String(p.id) === String(id));
  if (!product) throw new Error('Product not found');
  return product;
};

export const getCategories = async () => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return [...new Set(simulatedDatabase.map(item => item.category))];
};