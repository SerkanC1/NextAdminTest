import { spLoginUserSearch } from "@/app/lib/data";
import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Search from "@/app/ui/dashboard/search/search";
import styles from "@/app/ui/dashboard/users/users.module.css";
import Image from "next/image";
import Link from "next/link";

const UsersPage = async ({ searchParams }) => {
  const q = searchParams?.q || ""; // Arama sorgusunu URL'den alıyoruz
  const page = searchParams?.page || 1; // Sayfa numarasını URL'den alıyoruz

  const users = await spLoginUserSearch(q); // Arama parametresini kullanarak kullanıcıları getiriyoruz

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for a user..." />
        <Link href="/dashboard/users/add">
          <button className={styles.addButton}>Add New</button>
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Ad/Soyad</td>
            <td>Kullanıcı Adı</td>
            <td>Oluşturma Zamanı</td>
            <td>Son Giriş Zamanı</td>
            <td>Son Çıkış Zamanı</td>
            <td>Yönetici</td>
            <td>Durumu</td>
            <td>Online</td>
            <td>Fonksiyon</td>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.ID}>
              <td>
                <div className={styles.user}>
                  <Image
                    src="/noavatar.png"
                    alt={user.NameSurname}
                    width={40}
                    height={40}
                    className={styles.userImage}
                  />
                  {user.NameSurname}
                </div>
              </td>
              <td>{user.UserName}</td>
              <td>{new Date(user.CreateDate).toLocaleString()}</td>
              <td>{new Date(user.LastActive).toLocaleString()}</td>
              <td>{new Date(user.LastLogout).toLocaleString()}</td>
              <td>{user.Admin_ ? "Yönetici" : "Kullanıcı"}</td>
              <td>{user.Active ? "Aktif" : "Pasif"}</td>
              <td>{user.IsLogin ? "Evet" : "Hayır"}</td>
              <td>
                <div className={styles.buttons}>
                  <Link href={`/dashboard/users/${user.ID}`}>
                    <button className={`${styles.button} ${styles.view}`}>View</button>
                  </Link>
                  <button className={`${styles.button} ${styles.delete}`}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination currentPage={page} />
    </div>
  );
};

export default UsersPage;
