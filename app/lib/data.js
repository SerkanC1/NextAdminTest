// lib/data.js
import sql from "mssql";
import { connectToDB } from "./utils";

// Stored procedure kullanarak kullanıcı arama yapan fonksiyon
// Stored procedure offset ve fetch eklendi pagination için
export const spLoginUserSearch_1 = async (item, page = 1) => {
  const ITEM_PER_PAGE = 10;

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

// Stored procedure kullanarak ürün arama yapan fonksiyon
// Stored procedure offset ve fetch eklendi pagination için
export const spItemGetAll_Donem_V3_Next = async (
  item,
  itemcode,
  itemname,
  type,
  brand,
  DonemID,
  page = 1
) => {
  const ITEM_PER_PAGE = 10;

  try {
    await connectToDB(); // Veritabanı bağlantısını kontrol et ve aç
    const request = new sql.Request(); // Yeni bir SQL isteği oluştur

    // Parametreleri ekle
    const truncatedItem = item.slice(0, 50); // @item parametresini 50 karakter ile sınırlandırıyoruz.
    const truncatedItemCode = itemcode.slice(0, 50);
    const truncatedItemName = itemname.slice(0, 50);
    const truncatedType = type.slice(0, 50);
    const truncatedBrand = brand.slice(0, 50);
    const offset = (page - 1) * ITEM_PER_PAGE;

    request.input("item", sql.VarChar(50), truncatedItem); // @item parametresini ekliyoruz
    request.input("itemcode", sql.VarChar(50), truncatedItemCode); // @itemcode parametresini ekliyoruz
    request.input("itemname", sql.VarChar(50), truncatedItemName); // @itemname parametresini ekliyoruz
    request.input("type", sql.VarChar(50), truncatedType); // @type parametresini ekliyoruz
    request.input("brand", sql.VarChar(50), truncatedBrand); // @brand parametresini ekliyoruz
    request.input("DonemID", sql.Int, DonemID); // @DonemID parametresini ekliyoruz
    request.input("offset", sql.Int, offset); // @offset parametresini ekliyoruz
    request.input("fetch", sql.Int, ITEM_PER_PAGE); // @fetch parametresini ekliyoruz

    // Stored procedure çalıştır ve sonuçları al
    const result = await request.execute("SpItemGetAll_Donem_V3_Next");

    const count = result.recordsets[1][0].TotalCount; // Toplam kayıt sayısını alıyoruz
    const items = result.recordsets[0]; // Item listesini alıyoruz

    return { count, items }; // Toplam kayıt sayısı ve item listesini döndürüyoruz
  } catch (err) {
    throw new Error(
      "Failed to execute SpItemGetAll_Donem_V3_Next! - " + err.message
    );
  } 
};

// Kullanıcıyı ID ile getiren fonksiyon
export const getUserByID = async (id) => {
  try {
    // Veritabanına bağlan
    await connectToDB();

    const request = new sql.Request();
    request.input("ID", sql.Int, id);

    // Stored procedure'ü çalıştır ve sonucu al
    const result = await request.execute("SpLoginUsersGetByID");

    const user = result.recordset[0];
    //console.log("User retrieved successfully:", user);

    return user;
  } catch (err) {
    console.error("Failed to retrieve user:", err.message);
    throw new Error("Failed to retrieve user!");
  } 
};
