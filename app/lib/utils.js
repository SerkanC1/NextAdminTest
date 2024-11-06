import sql from 'mssql';

const connection = {};

export const connectToDB = async () => {
  try {
    // Zaten bağlıysa tekrar bağlanma
    if (connection.isConnected) return;

    // Bağlantı ayarları
    const sqlConfig = {
      user: process.env.DB_USER,
      password: process.env.DB_PWD,
      database: process.env.DB_NAME,
      server: process.env.DB_SERVER,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
      },
      options: {
        encrypt: false, // Azure için true
        trustServerCertificate: false // Yerel geliştirme için true olabilir
      }
    };

    // Bağlantıyı başlat
    const pool = await sql.connect(sqlConfig);
    connection.isConnected = pool.connected; // MSSQL bağlantı durumu

    console.log('MSSQL bağlantısı başarılı');
  } catch (error) {
    console.error('MSSQL bağlantı hatası:', error);
    throw new Error(error);
  }
};
