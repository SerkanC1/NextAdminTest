//app/dashboard/users/[id]/page.jsx
import { updateUser } from "@/app/lib/actions";
import { getUserByID } from "@/app/lib/data";
import styles from "@/app/ui/dashboard/users/singleUser/singleUser.module.css";
import Image from "next/image";

const SingleUserPage = async ({ params }) => {
  const { id } = params;
  const user = await getUserByID(id); // Kullanıcı bilgilerini almak için bir fonksiyon kullanın
  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
          <Image src={user.img || "/noavatar.png"} alt={user.NameSurname} fill />
        </div>
        {user.UserName}
      </div>
      <div className={styles.formContainer}>
        <form action={updateUser} className={styles.form}>
          <input type="hidden" name="id" value={user.ID} />
          <label>Username</label>
          <input type="text" name="username" defaultValue={user.UserName} />
          <label>Password</label>
          <input type="password" name="password" placeholder="Enter new password or leave blank"/>
          <label>Name Surname</label>
          <input
            type="text"
            name="namesurname"
            defaultValue={user.NameSurname}
          />
          <label>Is Admin?</label>
          <select name="isAdmin" defaultValue={user.Admin_ ? "true" : "false"}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <label>Is Active?</label>
          <select name="isActive" defaultValue={user.Active ? "true" : "false"}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <button type="submit">Update</button>
        </form>
      </div>
    </div>
  );
};

export default SingleUserPage;
