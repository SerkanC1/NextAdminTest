import sql from "mssql";
import { connectToDB } from "./utils";

// Stored procedure kullanarak tüm kullanıcıları getiren fonksiyon
export const spLoginUsersGet = async () => {
  try {
    await connectToDB(); // Veritabanı bağlantısını kontrol et ve aç
    const request = new sql.Request(); // Yeni bir SQL isteği oluştur

    // Stored procedure çalıştır
    const result = await request.execute("SpLoginUsersGet");

    return result.recordset;
  } catch (err) {
    throw new Error("Failed to fetch users!");
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
