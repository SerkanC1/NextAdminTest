-- Stored procedure kullanarak kullanıcı arama yapan fonksiyon
-- Stored procedure offset ve fetch eklendi pagination için
CREATE PROC [dbo].[SpLoginUserSearch_1]
(
  @item VARCHAR(10),
  @offset INT,
  @fetch INT
)
AS
BEGIN
  SET NOCOUNT ON;

  -- Toplam kullanıcı sayısını alıyoruz
  SELECT COUNT(*) AS TotalCount
  INTO #TotalCount
  FROM Users
  WHERE UserName LIKE '%' + @item + '%' OR NameSurname LIKE '%' + @item + '%';

  -- Sayfalama ile kullanıcıları döndüren sorgu
  SELECT *
  FROM Users
  WHERE UserName LIKE '%' + @item + '%' OR NameSurname LIKE '%' + @item + '%'
  ORDER BY CreateDate
  OFFSET @offset ROWS
  FETCH NEXT @fetch ROWS ONLY;

  -- Toplam kullanıcı sayısını döndürüyoruz
  SELECT * FROM #TotalCount;

  DROP TABLE #TotalCount;
END


-- Stored procedure kullanarak ürün arama yapan fonksiyon
-- Stored procedure offset ve fetch eklendi pagination için
CREATE PROC [dbo].[SpItemGetAll_Donem_V3_Next]
(
  @item VARCHAR(50) = null, -- Hepsinde ara
  @itemcode VARCHAR(50) = null,
  @itemname VARCHAR(50) = null,
  @type VARCHAR(50) = null,
  @brand VARCHAR(50) = null,
  @DonemID INT,
  @offset INT,
  @fetch INT
)
AS
BEGIN
  SET NOCOUNT ON;

  -- Toplam kayıt sayısını hesaplama
  SELECT COUNT(*) AS TotalCount
  INTO #TotalCount
  FROM Items AS i
  LEFT JOIN Categories AS BRAND ON i.BrandID = BRAND.ID AND BRAND.GroupID = 6
  LEFT JOIN Categories AS TYPE_ ON i.ItemTypeID = TYPE_.ID AND TYPE_.GroupID = 5
  LEFT JOIN Categories AS UNIT ON i.UnitID = UNIT.ID AND UNIT.GroupID = 7
  LEFT JOIN Categories AS CURP ON i.PurchaseCurrencyID = CURP.ID AND CURP.GroupID = 8
  LEFT JOIN Categories AS CURS ON i.SalesCurrencyID = CURS.ID AND CURS.GroupID = 8
  WHERE
    (@itemcode IS NULL OR i.ItemCode LIKE '%' + @itemcode + '%') AND
    (@itemname IS NULL OR i.ItemName LIKE '%' + @itemname + '%') AND
    (@type IS NULL OR TYPE_.CategoryTitle LIKE '%' + @type + '%') AND
    (@brand IS NULL OR BRAND.CategoryTitle LIKE '%' + @brand + '%') AND
    (@item IS NULL OR i.ItemCode LIKE '%' + @item + '%' OR i.ItemName LIKE '%' + @item + '%' OR TYPE_.CategoryTitle LIKE '%' + @item + '%' OR BRAND.CategoryTitle LIKE '%' + @item + '%');

  -- Sayfalama ile veri çekme
  SELECT
    i.ID,
    i.ItemCode,
    i.ItemName,
    TYPE_.CategoryTitle AS Type,
    BRAND.CategoryTitle AS Brand,
    UNIT.CategoryTitle AS Unit,
    i.PurchasePrice,
    CURP.CategoryTitle AS PurchaseCurrency,
    i.SalesPrice,
    CURS.CategoryTitle AS SalesCurrency,
    i.Details,
    ISNULL((SELECT SUM(pl.Amount) FROM PackingLines pl LEFT JOIN Packings p ON p.ID = pl.PackingsID AND p.DonemID = @DonemID WHERE pl.ItemID = i.ID AND p.PackingTypeID = 41), 0) AS IRSALIYE_GIRIS_TOPLAM,
    ISNULL((SELECT SUM(pl.Amount) FROM PackingLines pl LEFT JOIN Packings p ON p.ID = pl.PackingsID AND p.DonemID = @DonemID WHERE pl.ItemID = i.ID AND p.PackingTypeID = 42), 0) AS IRSALIYE_CIKIS_TOPLAM,
    ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 51), 0) AS STOKDUZELTME_GIRIS_TOPLAM,
    ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 52), 0) AS STOKDUZELTME_CIKIS_TOPLAM,
    ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 53), 0) AS IMALAT_CIKIS_TOPLAM,
    ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 54), 0) AS AYLIKSAIR_CIKIS_TOPLAM,
    ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 112), 0) AS DEVIRFISI_TOPLAM,
    (
    --IRSALIYE_GIRIS_TOPLAM
    ISNULL((SELECT SUM(pl.Amount) FROM PackingLines pl LEFT JOIN Packings p ON p.ID = pl.PackingsID AND p.DonemID = @DonemID WHERE pl.ItemID = i.ID AND p.PackingTypeID = 41), 0)
    )
    -
    (
    --IRSALIYE_CIKIS_TOPLAM
    ISNULL((SELECT SUM(pl.Amount) FROM PackingLines pl LEFT JOIN Packings p ON p.ID = pl.PackingsID AND p.DonemID = @DonemID WHERE pl.ItemID = i.ID AND p.PackingTypeID = 42), 0)
    )
    +
    (
    --STOKDUZELTME_GIRIS_TOPLAM
    ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 51), 0)
    )
    -
    (
    --STOKDUZELTME_CIKIS_TOPLAM
    ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 52), 0)
    )
    -
    (
    --IMALAT_CIKIS_TOPLAM
    ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 53), 0)
    )
    -
    (
    --AYLIKSAIR_CIKIS_TOPLAM
    ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 54), 0)
    )
    +
    (
    --DEVIRFISI_TOPLAM
    ISNULL((SELECT SUM(opl.Amount) FROM OtherPackingLines opl LEFT JOIN OtherPackings op ON op.ID = opl.PackingsID AND op.DonemID = @DonemID WHERE opl.ItemID = i.ID AND op.PackingTypeID = 112), 0)
    ) AS StockAmounts
  FROM Items AS i
  LEFT JOIN Categories AS BRAND ON i.BrandID = BRAND.ID AND BRAND.GroupID = 6
  LEFT JOIN Categories AS TYPE_ ON i.ItemTypeID = TYPE_.ID AND TYPE_.GroupID = 5
  LEFT JOIN Categories AS UNIT ON i.UnitID = UNIT.ID AND UNIT.GroupID = 7
  LEFT JOIN Categories AS CURP ON i.PurchaseCurrencyID = CURP.ID AND CURP.GroupID = 8
  LEFT JOIN Categories AS CURS ON i.SalesCurrencyID = CURS.ID AND CURS.GroupID = 8
  WHERE
    (@itemcode IS NULL OR i.ItemCode LIKE '%' + @itemcode + '%') AND
    (@itemname IS NULL OR i.ItemName LIKE '%' + @itemname + '%') AND
    (@type IS NULL OR TYPE_.CategoryTitle LIKE '%' + @type + '%') AND
    (@brand IS NULL OR BRAND.CategoryTitle LIKE '%' + @brand + '%') AND
    (@item IS NULL OR i.ItemCode LIKE '%' + @item + '%' OR i.ItemName LIKE '%' + @item + '%' OR TYPE_.CategoryTitle LIKE '%' + @item + '%' OR BRAND.CategoryTitle LIKE '%' + @item + '%')
  ORDER BY i.ItemCode
  OFFSET @offset ROWS
  FETCH NEXT @fetch ROWS ONLY;

  -- Toplam kayıt sayısını döndürme
  SELECT * FROM #TotalCount;

  DROP TABLE #TotalCount;
END

GO 

--KULLANICI EKLE 
ALTER PROC [dbo].[SpLoginUserInsert]
(
@UserName VARCHAR(20),
@Password NVARCHAR(255),  --hash için yapıldı.
@NameSurname VARCHAR(50),
--@CreateDate DATETIME,
@Admin BIT,
@Active BIT
)
AS
BEGIN
INSERT INTO Users (UserName,Password_,NameSurname,CreateDate,Admin_,Active)
VALUES(@UserName,@Password,@NameSurname,getdate(),@Admin,@Active)
END

GO

--KULLANICI DÜZENLE
ALTER PROC [dbo].[SpLoginUserUpdate]
(
@ID INT,
@UserName VARCHAR(20),
@Password NVARCHAR(255), --hash için yapıldı.
@NameSurname VARCHAR(50),
@Admin BIT,
@Active BIT
)
AS
BEGIN
UPDATE Users SET
UserName=@UserName,
Password_= @Password,
NameSurname= @NameSurname,
Admin_ = @Admin,
Active = @Active
WHERE ID=@ID
END

GO

--Hash'lenmiş şifreyi saklamak için. 
ALTER TABLE DeletedUsersLog
ALTER COLUMN Password_ NVARCHAR(255);