import sql from "mssql";
import { connectToDB } from "./utils";

// Stored procedure kullanarak kullanıcı arama yapan fonksiyon
export const spLoginUserSearch_1 = async (item, page = 1) => {
  const ITEM_PER_PAGE = 2;

  try {
    await connectToDB(); // Veritabanı bağlantısını kontrol et ve aç
    const request = new sql.Request(); // Yeni bir SQL isteği oluştur

    // Parametreleri ekle
    const truncatedItem = item.slice(0, 10); // @item parametresini 10 karakter ile sınırlandırıyoruz.
    const offset = (page - 1) * ITEM_PER_PAGE;

    request.input("item", sql.VarChar(10), truncatedItem); // @item parametresini ekliyoruz
    request.input("offset", sql.Int, offset); // @offset parametresini ekliyoruz
    request.input("fetch", sql.Int, ITEM_PER_PAGE); // @fetch parametresini ekliyoruz

    // Stored procedure çalıştır ve sonuçları al
    const result = await request.execute("SpLoginUserSearch_1");

    const count = result.recordsets[1][0].TotalCount; // Toplam kullanıcı sayısını alıyoruz
    const users = result.recordsets[0]; // Kullanıcı listesini alıyoruz

    return { count, users }; // Toplam kullanıcı sayısı ve kullanıcı listesini döndürüyoruz
  } catch (err) {
    throw new Error("Failed to execute spLoginUserSearch_1! - " + err.message);
  }
};

// // Stored procedure kullanarak tüm kullanıcıları getiren fonksiyon
// // Şimdilik kullanılmadığı için kapattım.
// export const spLoginUsersGet = async () => {
//   try {
//     await connectToDB(); // Veritabanı bağlantısını kontrol et ve aç
//     const request = new sql.Request(); // Yeni bir SQL isteği oluştur

//     // Stored procedure çalıştır
//     const result = await request.execute("SpLoginUsersGet");

//     return result.recordset;
//   } catch (err) {
//     throw new Error("Failed to spLoginUsersGet! - " + err.message);
//   }
// };

// Stored procedure kullanarak kullanıcı arama yapan fonksiyon
// Stored procedure offset ve fetch eklendi pagination için
// USE [STEDB]
// GO
// /****** Object:  StoredProcedure [dbo].[SpLoginUserSearch]    Script Date: 17.11.2024 17:20:57 ******/
// SET ANSI_NULLS ON
// GO
// SET QUOTED_IDENTIFIER ON
// GO

// --KULLANICI ARAMA
// ALTER PROC [dbo].[SpLoginUserSearch]
// (
// @item VARCHAR(10),
// @offset INT,
// @fetch INT
// )
// AS
// BEGIN
// SELECT        *
// FROM           Users
// WHERE        UserName LIKE '%'+@item+'%' or NameSurname LIKE '%'+@item+'%'
// ORDER BY CreateDate
// OFFSET @offset ROWS
// FETCH NEXT @fetch ROWS ONLY
// END

// Stored procedure kullanarak kullanıcı arama yapan fonksiyon
export const spLoginUserSearch = async (item, page = 1) => {
  const ITEM_PER_PAGE = 2;

  try {
    await connectToDB(); // Veritabanı bağlantısını kontrol et ve aç
    const request = new sql.Request(); // Yeni bir SQL isteği oluştur

    // Toplam kullanıcı sayısını alıyoruz
    const countResult = await request.query(`
      SELECT COUNT(*) AS TotalCount 
      FROM Users 
      WHERE UserName LIKE '%' + '${item.slice(
        0,
        10
      )}' + '%' OR NameSurname LIKE '%' + '${item.slice(0, 10)}' + '%'
    `);
    const count = countResult.recordset[0].TotalCount; // Toplam kullanıcı sayısını alıyoruz

    // Parametreleri ekle
    const truncatedItem = item.slice(0, 10); // @item parametresini 10 karakter ile sınırlıyoruz.
    const offset = (page - 1) * ITEM_PER_PAGE;

    request.input("item", sql.VarChar(10), truncatedItem); // @item parametresini ekliyoruz
    request.input("offset", sql.Int, offset); // @offset parametresini ekliyoruz
    request.input("fetch", sql.Int, ITEM_PER_PAGE); // @fetch parametresini ekliyoruz

    // Stored procedure çalıştır ve sonuçları al
    const result = await request.execute("SpLoginUserSearch");
    const users = result.recordset; // Kullanıcı listesini alıyoruz

    return { count, users }; // Toplam kullanıcı sayısı ve kullanıcı listesini döndürüyoruz
  } catch (err) {
    throw new Error("Failed to execute spLoginUserSearch! - " + err.message);
  }
};

// Tüm kullanıcıları getiren fonksiyon
export const fetchAllUsers = async () => {
  try {
    await connectToDB(); // Veritabanı bağlantısını kontrol et ve aç
    const request = new sql.Request(); // Yeni bir SQL isteği oluştur

    // Tüm kullanıcıları sorgulayan SQL komutu
    const result = await request.query(`
      SELECT * FROM Users
    `);

    // Kullanıcıları döndür
    console.log("Tüm kullanıcılar getirildi.");
    return result.recordset; // Kullanıcıların bulunduğu dizi döndürülür
  } catch (err) {
    console.error("Kullanıcılar getirilemedi:", err);
    throw new Error("Failed to fetch users!");
  }
};

// Kullanıcıyı ID ile getiren fonksiyon
export const fetchUser = async (id) => {
  try {
    await connectToDB(); // Bağlantıyı kontrol et ve aç
    const request = new sql.Request(); // Yeni bir SQL isteği oluştur

    // ID parametresini güvenli bir şekilde kullanarak sorgu yap
    request.input("id", sql.Int, id); // ID'nin Int türünde olduğunu varsayıyoruz

    const result = await request.query(`
        SELECT * FROM Users WHERE id = @id
      `);

    // Kullanıcıyı döndür
    if (result.recordset.length > 0) {
      return result.recordset[0]; // İlk kaydı döndür
    } else {
      throw new Error("Kullanıcı bulunamadı!");
    }
  } catch (err) {
    console.error("Kullanıcı getirilemedi:", err);
    throw new Error("Failed to fetch user!");
  }
};
