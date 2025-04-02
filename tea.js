require('dotenv').config();
const { ethers } = require('ethers');

// Konfigurasi
const RPC_URL = process.env.RPC_URL || "https://tea-sepolia.g.alchemy.com/public"; // Ganti ke Sepolia Testnet
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const TOTAL_TRANSACTIONS_PER_DAY = 200;
let transactionsDone = 0;

// Fungsi untuk membuat alamat acak
function generateRandomAddress() {
    return ethers.Wallet.createRandom().address;
}

// Fungsi untuk mengecek gas fee secara real-time
async function checkGasFee() {
    const gasPrice = await provider.getFeeData();
    const estimatedGasFee = gasPrice.gasPrice * BigInt(21000);
    console.log(`Gas Price: ${ethers.formatUnits(gasPrice.gasPrice, 'gwei')} Gwei`);
    console.log(`Estimated Gas Fee: ${ethers.formatEther(estimatedGasFee)} TEA`);
}

// Fungsi untuk mengirim transaksi dengan jumlah tetap 0.001 TEA
async function sendTransaction() {
    if (transactionsDone >= TOTAL_TRANSACTIONS_PER_DAY) {
        console.log("Batas transaksi harian telah tercapai!");
        return;
    }
    
    try {
        const recipient = generateRandomAddress();
        const balance = await provider.getBalance(wallet.address);
        const gasPrice = await provider.getFeeData();
        const estimatedGasFee = gasPrice.gasPrice * BigInt(21000);
        const amount = ethers.parseEther("0.001");

        if (balance < amount + estimatedGasFee) {
            console.log("Saldo tidak cukup untuk mengirim!");
            return;
        }

        const tx = await wallet.sendTransaction({
            to: recipient,
            value: amount,
            gasPrice: gasPrice.gasPrice
        });

        transactionsDone++;
        console.log(`Mengirim 0.001 TEA ke ${recipient} | Transaksi ke-${transactionsDone} hari ini`);
        console.log(`Tx Hash: ${tx.hash}`);

        await tx.wait();
    } catch (error) {
        console.error("Error:", error);
    }
}

// Fungsi untuk menjadwalkan transaksi pada jam acak sepanjang hari
function scheduleTransactions() {
    for (let i = 0; i < TOTAL_TRANSACTIONS_PER_DAY; i++) {
        const delay = Math.floor(Math.random() * 86400000); // Random dalam 24 jam (ms)
        setTimeout(sendTransaction, delay);
    }
}

// Jalankan pengecekan gas fee sebelum transaksi
checkGasFee();

// Jalankan transaksi dengan jadwal acak
scheduleTransactions();
