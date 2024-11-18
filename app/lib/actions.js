import sql from "mssql";
import bcrypt from "bcrypt";
import { connectToDB } from "./utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const insertUser = async (formData) => {
  "use server";
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
