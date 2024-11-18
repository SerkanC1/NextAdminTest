"use server";

import sql from "mssql";
import bcrypt from "bcrypt";
import { connectToDB } from "./utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserByID } from "./data";

// Hash için Users tablosunda @Password NVARCHAR(255) yapıldı.
// SpLoginUserInsert içinde de @Password NVARCHAR(255) yapıldı.
export const insertUser = async (formData) => {
  const { username, password, namesurname, isAdmin, isActive } =
    Object.fromEntries(formData);

  try {
    // Veritabanına bağlan
    await connectToDB();

    // Şifreyi hashleyin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const request = new sql.Request();
    request.input("UserName", sql.VarChar, username);
    request.input("Password", sql.VarChar, hashedPassword);
    request.input("NameSurname", sql.VarChar, namesurname);
    request.input("Admin", sql.Bit, isAdmin);
    request.input("Active", sql.Bit, isActive);

    // Stored procedure'ü çalıştır
    await request.execute("SpLoginUserInsert");

    console.log("User created successfully!");
  } catch (err) {
    console.error("Failed to create user:", err.message);
    throw new Error("Failed to create user!");
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
};

// Hash için Users tablosunda @Password NVARCHAR(255) yapıldı.
// SpLoginUserUpdate içinde de @Password NVARCHAR(255) yapıldı.
export const updateUser = async (formData) => {
  const { id, username, password, namesurname, isAdmin, isActive } =
    Object.fromEntries(formData);

  // Minimum ve maksimum karakter kontrolü
  const validateLength = (input, min, max) => {
    return input && input.length >= min && input.length <= max;
  };

  // Kullanıcı adı ve isim kontrolü
  if (!validateLength(username, 3, 20)) {
    throw new Error("Username must be between 3 and 20 characters long.");
  }
  if (!validateLength(namesurname, 3, 50)) {
    throw new Error("Name Surname must be between 3 and 50 characters long.");
  }

  try {
    // Veritabanına bağlan
    await connectToDB();

    // Şifreyi güncellenip güncellenmediğini kontrol edin
    let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);

      // Şifre uzunluğu kontrolü
      if (!validateLength(password, 3, 255)) {
        throw new Error("Password must be between 3 and 255 characters long.");
      }
    } else {
      // Eğer şifre güncellenmiyorsa mevcut şifreyi kullan
      const existingUser = await getUserByID(id);
      hashedPassword = existingUser.Password_;
      //console.log("Existing user password used:", hashedPassword); // Mevcut şifreyi kontrol et
    }

    // hashedPassword kontrolü
    //console.log("Hashed Password: ", hashedPassword);

    // Güncellenen alanları belirleyin
    const updateFields = {
      username,
      password: hashedPassword,
      namesurname,
      isAdmin: isAdmin === "true", // String değerleri boolean değerlere dönüştür
      isActive: isActive === "true", // String değerleri boolean değerlere dönüştür
    };

    // Boş veya undefined değerleri silin
    Object.keys(updateFields).forEach(
      (key) =>
        (updateFields[key] === "" || updateFields[key] === undefined) &&
        delete updateFields[key]
    );

    const request = new sql.Request();
    request.input("ID", sql.Int, id);
    request.input("UserName", sql.VarChar, updateFields.username);
    request.input("Password", sql.NVarChar, updateFields.password); // Güncellenmiş satır
    request.input("NameSurname", sql.VarChar, updateFields.namesurname);
    request.input("Admin", sql.Bit, updateFields.isAdmin); // Kolon adıyla eşleştiğine emin olun
    request.input("Active", sql.Bit, updateFields.isActive);

    // Stored procedure'ü çalıştır
    await request.execute("SpLoginUserUpdate");

    console.log("User updated successfully!");
  } catch (err) {
    console.error("Failed to update user:", err.message);
    //console.error("Error details:", err);  // Hata detaylarını yazdır
    throw new Error("Failed to update user!");
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
};

// Delete user, deleteUserID daha sonra bakılacak kim silmiş?
export const deleteUser = async (formData) => {
  const { id, deleteUserID } = Object.fromEntries(formData);

  try {
    // Veritabanına bağlan
    await connectToDB();

    const request = new sql.Request();
    request.input("ID", sql.Int, id);
    request.input("DeleteUserID", sql.Int, deleteUserID);

    // Stored procedure'ü çalıştır
    await request.execute("SpLoginUserDelete");

    console.log("User deleted successfully!");
  } catch (err) {
    console.error("Failed to delete user:", err.message);
    console.log("Error: ", err);
    throw new Error("Failed to delete user!");
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
};

// insert item yapılacak
