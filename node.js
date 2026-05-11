const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// Komutlar listesi
const commands = [
    {
        name: 'kanal_kilitle',
        description: 'Belirtilen kanalı kilitler.',
        options: [{ name: 'kanal', type: 7, description: 'Kilitlenecek kanal', required: true }]
    },
    {
        name: 'ban',
        description: 'Kullanıcıyı yasaklar.',
        options: [
            { name: 'kullanici', type: 6, description: 'Yasaklanacak kişi', required: true },
            { name: 'sebep', type: 3, description: 'Yasaklama sebebi', required: false }
        ]
    },
    {
        name: 'afk',
        description: 'AFK moduna geçer.',
        options: [{ name: 'sebep', type: 3, description: 'Neden AFK olduğunuzu yazın', required: false }]
    },
    {
        name: 'avatar',
        description: 'Kullanıcının avatarını gösterir.',
        options: [{ name: 'kullanici', type: 6, description: 'Avatarı bakılacak kişi', required: false }]
    },
    {
        name: 'anket',
        description: 'Bir anket oluşturur.',
        options: [
            { name: 'soru', type: 3, description: 'Anket sorusu', required: true },
            { name: 'secenek_1', type: 3, description: '1. Seçenek', required: true },
            { name: 'secenek_2', type: 3, description: '2. Seçenek', required: true }
        ]
    }
];

// Slash Komutlarını Kaydetme
const rest = new REST({ version: '10' }).setToken('BOT_TOKEN_BURAYA');

(async () => {
    try {
        console.log('Slash komutları yükleniyor...');
        await rest.put(Routes.applicationCommands('BOT_ID_BURAYA'), { body: commands });
        console.log('Komutlar başarıyla kaydedildi.');
    } catch (error) {
        console.error(error);
    }
})();

// Komut İşleyicisi (Interaction Create)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options } = interaction;

    // --- KANAL KİLİTLE ---
    if (commandName === 'kanal_kilitle') {
        const kanal = options.getChannel('kanal');
        await kanal.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
        return interaction.reply({ content: `${kanal} başarıyla kilitlendi!`, ephemeral: true });
    }

    // --- BAN ---
    if (commandName === 'ban') {
        const user = options.getUser('kullanici');
        const sebep = options.getString('sebep') || 'Sebep belirtilmedi';
        await interaction.guild.members.ban(user, { reason: sebep });
        return interaction.reply(`${user.tag} yasaklandı. Sebep: ${sebep}`);
    }

    // --- AVATAR ---
    if (commandName === 'avatar') {
        const user = options.getUser('kullanici') || interaction.user;
        return interaction.reply({ content: `${user.tag} adlı kullanıcının avatarı: ${user.displayAvatarURL({ dynamic: true, size: 1024 })}` });
    }

    // --- AFK ---
    if (commandName === 'afk') {
        const sebep = options.getString('sebep') || 'Belirtilmedi';
        return interaction.reply(`${interaction.user}, artık **${sebep}** sebebiyle AFK!`);
    }

    // --- ANKET ---
    if (commandName === 'anket') {
        const soru = options.getString('soru');
        const s1 = options.getString('secenek_1');
        const s2 = options.getString('secenek_2');
        const mesaj = await interaction.reply({ content: `**ANKET: ${soru}**\n1️⃣: ${s1}\n2️⃣: ${s2}`, fetchReply: true });
        mesaj.react('1️⃣');
        mesaj.react('2️⃣');
    }
});

client.login('BOT_TOKEN_BURAYA');
