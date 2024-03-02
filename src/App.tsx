import "./styles.css";
import { ProductInformation, Company, Review, User } from "./lib/types";
import { getProducts, getUsers, getReviews, getCompanies } from "./lib/api";
import { useEffect, useState, FC } from "react";
import Card from "./Card";



const App: FC = () => {
  const [products, setProducts] = useState<ProductInformation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const [
          fetchedProducts,
          fetchedUsers,
          fetchedReviews,
          fetchedCompanies,
        ] = await Promise.all([
          getProducts(),
          getUsers(),
          getReviews(),
          getCompanies(),
        ]);

        const companiesMapOfId: { [key: string]: Company } = {};
        fetchedCompanies.forEach((company) => {
          companiesMapOfId[company.id] = company;
        });

        const reviewsMapOfId: { [key: string]: Review } = {};
        fetchedReviews.forEach((review) => {
          reviewsMapOfId[review.id] = review;
        });

        const updatedProducts: ProductInformation[] = fetchedProducts.map(
            (product) => {
              const user: User | undefined = fetchedUsers.find(
                  (user) => user.id === reviewsMapOfId[product.reviewIds[0]]?.userId
              );
              return {
                id: product.id,
                name: product.name,
                description: product.description,
                reviews: product.reviewIds.map((reviewId) => ({
                  id: reviewId,
                  text: reviewsMapOfId[reviewId]?.text || "Без отзыва",
                  user: user || { id: "-1", name: "Без имени" },
                })),
                company: companiesMapOfId[product.companyId] || {
                  id: "-1",
                  name: "Без названия",
                  created: -1,
                  country: "Без страны",
                },
              };
            }
        );


        setProducts(updatedProducts);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
      <div>
        <h1>Список товаров:</h1>
        {isLoading && <div>Загрузка...</div>}
        {!isLoading &&
            products.map((p) => <Card key={p.id} product={p} />)}
      </div>
  );
};

export default App;
