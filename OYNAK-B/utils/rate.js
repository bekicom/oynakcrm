exports.getUsdRate = async () => {
    try {
        const response = await fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/");
        if (!response.ok) {
            throw new Error("Valyuta ma'lumotlarini olishda xatolik");
        }

        const data = await response.json();
        const usd = data.find((item) => item.Ccy === "USD");

        return Number(usd?.Rate || 0);
    } catch (error) {
        console.error("USD kursini olishda xatolik:", error.message);
        return 0;
    }
};
