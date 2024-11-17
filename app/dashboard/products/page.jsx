import { spItemGetAll_Donem_V3_Next } from "@/app/lib/data";
import Image from "next/image";
import Link from "next/link";
import styles from "@/app/ui/dashboard/products/products.module.css";
import Search from "@/app/ui/dashboard/search/search";
import Pagination from "@/app/ui/dashboard/pagination/pagination";

const ProductsPage = async ({ searchParams }) => {
  const q = searchParams?.q || ""; // Arama sorgusunu URL'den alıyoruz
  const page = searchParams?.page || 1; // Sayfa numarasını URL'den alıyoruz
  const { count, items } = await spItemGetAll_Donem_V3_Next(
    q,
    "",
    "",
    "",
    "",
    54,
    page
  ); // Arama parametresini kullanarak kullanıcıları getiriyoruz

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for a product..." />
        <Link href="/dashboard/products/add">
          <button className={styles.addButton}>Add New</button>
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Ürün Kodu</td>
            <td>Ürün Adı</td>
            <td>Price</td>
            <td>Stock</td>
            <td>Fonksiyon</td>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.ID}>
              <td>
                <div className={styles.item}>
                  <Image
                    src="/noproduct.jpg"
                    alt={item.Code}
                    width={40}
                    height={40}
                    className={styles.productImage}
                  />
                  {item.ItemCode}
                </div>
              </td>
              <td>{item.ItemName}</td>
              <td>
                {item.SalesPrice}
                &nbsp;&nbsp;
                {item.SalesCurrency}
              </td>
              <td>{item.StockAmounts}</td>
              <td>
                <div className={styles.buttons}>
                  <Link href={`/dashboard/products/${item.ID}`}>
                    <button className={`${styles.button} ${styles.view}`}>
                      View
                    </button>
                  </Link>
                  <button className={`${styles.button} ${styles.delete}`}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination count={count} />
    </div>
  );
};

export default ProductsPage;
