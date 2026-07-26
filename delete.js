const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Memulai proses pembersihan data...');

    // 1. Hapus semua data application yang memiliki userId > 1
    const deleteApplications = prisma.application.deleteMany({
      where: {
        userId: {
          gt: 1, // gt artinya "greater than" (lebih besar dari 1)
        },
      },
    });

    // 2. Hapus semua user yang memiliki id > 1
    const deleteUsers = prisma.user.deleteMany({
      where: {
        id: {
          gt: 1,
        },
      },
    });

    // Jalankan kedua perintah di atas secara berurutan dalam satu transaksi
    const [appsResult, usersResult] = await prisma.$transaction([
      deleteApplications,
      deleteUsers,
    ]);

    console.log(`\n✅ BERHASIL MEMBERSIHKAN DATA:`);
    console.log(`- Jumlah data Application yang dihapus: ${appsResult.count}`);
    console.log(`- Jumlah data User yang dihapus: ${usersResult.count}`);

  } catch (error) {
    console.error('❌ Terjadi kesalahan saat menghapus data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();



