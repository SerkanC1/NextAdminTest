import sql from "mssql";
import { connectToDB } from "./utils";

// Stored procedure kullanarak kullanıcı arama yapan fonksiyon
// Stored procedure offset ve fetch eklendi pagination için

// ALTER PROC [dbo].[SpLoginUserSearch_1]
// (
//   @item VARCHAR(10),
//   @offset INT,
//   @fetch INT
// )
// AS
// BEGIN
//   SET NOCOUNT ON;

//   -- Toplam kullanıcı sayısını alıyoruz
//   SELECT COUNT(*) AS TotalCount
//   INTO #TotalCount
//   FROM Users
//   WHERE UserName LIKE '%' + @item + '%' OR NameSurname LIKE '%' + @item + '%';

//   -- Sayfalama ile kullanıcıları döndüren sorgu
//   SELECT *
//   FROM Users
//   WHERE UserName LIKE '%' + @item + '%' OR NameSurname LIKE '%' + @item + '%'
//   ORDER BY CreateDate
//   OFFSET @offset ROWS
//   FETCH NEXT @fetch ROWS ONLY;

//   -- Toplam kullanıcı sayısını döndürüyoruz
//   SELECT * FROM #TotalCount;

//   DROP TABLE #TotalCount;
// END

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
//

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

// Stored procedure kullanarak ürün arama yapan fonksiyon
// Stored procedure offset ve fetch eklendi pagination için
//
// CREATE PROC [dbo].[SpItemGetAll_Donem_V3_Next]
// (
//   @item VARCHAR(50) = null, -- Hepsinde ara
//   @itemcode VARCHAR(50) = null,
//   @itemname VARCHAR(50) = null,
//   @type VARCHAR(50) = null,
//   @brand VARCHAR(50) = null,
//   @DonemID INT,
//   @offset INT,
//   @fetch INT
// )
// AS
// BEGIN
//   SET NOCOUNT ON;

//   -- Toplam kayıt sayısını hesaplama
//   SELECT COUNT(*) AS TotalCount
//   INTO #TotalCount
//   FROM Items AS i
//   LEFT JOIN Categories AS BRAND ON i.BrandID = BRAND.ID AND BRAND.GroupID = 6
//   LEFT JOIN Categories AS TYPE_ ON i.ItemTypeID = TYPE_.ID AND TYPE_.GroupID = 5
//   LEFT JOIN Categories AS UNIT ON i.UnitID = UNIT.ID AND UNIT.GroupID = 7
//   LEFT JOIN Categories AS CURP ON i.PurchaseCurrencyID = CURP.ID AND CURP.GroupID = 8
//   LEFT JOIN Categories AS CURS ON i.SalesCurrencyID = CURS.ID AND CURS.GroupID = 8
//   WHERE
//     (@itemcode IS NULL OR i.ItemCode LIKE '%' + @itemcode + '%') AND
//     (@itemname IS NULL OR i.ItemName LIKE '%' + @itemname + '%') AND
//     (@type IS NULL OR TYPE_.CategoryTitle LIKE '%' + @type + '%') AND
//     (@brand IS NULL OR BRAND.CategoryTitle LIKE '%' + @brand + '%') AND
//     (@item IS NULL OR i.ItemCode LIKE '%' + @item + '%' OR i.ItemName LIKE '%' + @item + '%' OR TYPE_.CategoryTitle LIKE '%' + @item + '%' OR BRAND.CategoryTitle LIKE '%' + @item + '%');

//   -- Sayfalama ile veri çekme
//   SELECT
//     i.ID,
//     i.ItemCode,
//     i.ItemName,
//     TYPE_.CategoryTitle AS Type,
//     BRAND.CategoryTitle AS Brand,
//     UNIT.CategoryTitle AS Unit,
//     i.PurchasePrice,
//     CURP.CategoryTitle AS PurchaseCurrency,
//     i.SalesPrice,
//     CURS.CategoryTitle AS SalesCurrency,
//     i.Details,
//     ISNULL((SELECT SUM(pl.Amount) FROM PackingLines pl LEFT JOIN Packings p ON p.ID = pl.PackingsID AND p.DonemID = @DonemID WHERE pl.ItemID = i.ID AND p.PackingTypeID = 41), 0) AS IRSALIYE_GIRIS_TOPLAM,
//     ISNULL((SELECT SUM(pl.Amount) FROM PackingLines pl LEFT JOIN Packings p ON p.ID = pl.PackingsID AND p.DonemID = @DonemID WHERE pl.ItemID = i.ID AND p.PackingTypeID = 42), 0) AS IRSALIYE_CIKIS_TOPLAM,
//     ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 51), 0) AS STOKDUZELTME_GIRIS_TOPLAM,
//     ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 52), 0) AS STOKDUZELTME_CIKIS_TOPLAM,
//     ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 53), 0) AS IMALAT_CIKIS_TOPLAM,
//     ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 54), 0) AS AYLIKSAIR_CIKIS_TOPLAM,
//     ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 112), 0) AS DEVIRFISI_TOPLAM,
//     (
//     --IRSALIYE_GIRIS_TOPLAM
//     ISNULL((SELECT SUM(pl.Amount) FROM PackingLines pl LEFT JOIN Packings p ON p.ID = pl.PackingsID AND p.DonemID = @DonemID WHERE pl.ItemID = i.ID AND p.PackingTypeID = 41), 0)
//     )
//     -
//     (
//     --IRSALIYE_CIKIS_TOPLAM
//     ISNULL((SELECT SUM(pl.Amount) FROM PackingLines pl LEFT JOIN Packings p ON p.ID = pl.PackingsID AND p.DonemID = @DonemID WHERE pl.ItemID = i.ID AND p.PackingTypeID = 42), 0)
//     )
//     +
//     (
//     --STOKDUZELTME_GIRIS_TOPLAM
//     ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 51), 0)
//     )
//     -
//     (
//     --STOKDUZELTME_CIKIS_TOPLAM
//     ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 52), 0)
//     )
//     -
//     (
//     --IMALAT_CIKIS_TOPLAM
//     ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 53), 0)
//     )
//     -
//     (
//     --AYLIKSAIR_CIKIS_TOPLAM
//     ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 54), 0)
//     )
//     +
//     (
//     --DEVIRFISI_TOPLAM
//     ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 112), 0)
//     ) AS StockAmounts
//   FROM Items AS i
//   LEFT JOIN Categories AS BRAND ON i.BrandID = BRAND.ID AND BRAND.GroupID = 6
//   LEFT JOIN Categories AS TYPE_ ON i.ItemTypeID = TYPE_.ID AND TYPE_.GroupID = 5
//   LEFT JOIN Categories AS UNIT ON i.UnitID = UNIT.ID AND UNIT.GroupID = 7
//   LEFT JOIN Categories AS CURP ON i.PurchaseCurrencyID = CURP.ID AND CURP.GroupID = 8
//   LEFT JOIN Categories AS CURS ON i.SalesCurrencyID = CURS.ID AND CURS.GroupID = 8
//   WHERE
//     (@itemcode IS NULL OR i.ItemCode LIKE '%' + @itemcode + '%') AND
//     (@itemname IS NULL OR i.ItemName LIKE '%' + @itemname + '%') AND
//     (@type IS NULL OR TYPE_.CategoryTitle LIKE '%' + @type + '%') AND
//     (@brand IS NULL OR BRAND.CategoryTitle LIKE '%' + @brand + '%') AND
//     (@item IS NULL OR i.ItemCode LIKE '%' + @item + '%' OR i.ItemName LIKE '%' + @item + '%' OR TYPE_.CategoryTitle LIKE '%' + @item + '%' OR BRAND.CategoryTitle LIKE '%' + @item + '%')
//   ORDER BY i.ItemCode
//   OFFSET @offset ROWS
//   FETCH NEXT @fetch ROWS ONLY;

//   -- Toplam kayıt sayısını döndürme
//   SELECT * FROM #TotalCount;

//   DROP TABLE #TotalCount;
// END
//
//

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
