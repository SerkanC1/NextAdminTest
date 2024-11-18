import { deleteUser } from "@/app/lib/actions";
import { spLoginUserSearch_1 } from "@/app/lib/data";
import Image from "next/image";
import Link from "next/link";
import styles from "@/app/ui/dashboard/users/users.module.css";
import Search from "@/app/ui/dashboard/search/search";
import Pagination from "@/app/ui/dashboard/pagination/pagination";

const UsersPage = async ({ searchParams }) => {
  const q = searchParams?.q || ""; // Arama sorgusunu URL'den alıyoruz
  const page = searchParams?.page || 1; // Sayfa numarasını URL'den alıyoruz
  const { count, users } = await spLoginUserSearch_1(q, page); // Arama parametresini kullanarak kullanıcıları getiriyoruz

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
                    src={user.img || "/noavatar.png"}
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
                    <button className={`${styles.button} ${styles.view}`}>
                      View
                    </button>
                  </Link>
                  <form action={deleteUser}>
                    <input type="hidden" name="id" value={user.ID} />
                    <button className={`${styles.button} ${styles.delete}`}>
                      Delete
                    </button>
                  </form>
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

export default UsersPage;
