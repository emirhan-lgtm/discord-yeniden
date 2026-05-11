require('dotenv').config(); // Küçük 'r' ile düzeltildi

const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    PermissionsBitField,
    EmbedBuilder // Daha güzel görünümler için eklendi
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const commands = [
    {
        name: 'kanal_kilitle',
        description: 'Belirtilen kanalı kilitler.',
        options: [
            {
                name: 'kanal',
                description: 'Kilitlenecek kanal',
                type: 7,
                required: true
            }
        ]
    },
    {
        name: 'ban',
        description: 'Kullanıcıyı yasaklar.',
        options: [
            {
                name: 'kullanici',
                description: 'Yasaklanacak kullanıcı',
                type: 6,
                required: true
            },
            {
                name: 'sebep',
                description: 'Ban sebebi',
                type: 3,
                required: false
            }
        ]
    },
    {
        name: 'avatar',
        description: 'Kullanıcının avatarını gösterir.',
        options: [
            {
                name: 'kullanici',
                description: 'Kullanıcı',
                type: 6,
                required: false
            }
        ]
    },
    {
        name: 'afk',
        description: 'AFK moduna geçersin.',
        options: [
            {
                name: 'sebep',
                description: 'AFK sebebi',
                type: 3,
                required: false
            }
        ]
    },
    {
        name: 'anket',
        description: 'Anket oluşturur.',
        options: [
            {
                name: 'soru',
                description: 'Anket sorusu',
                type: 3,
                required: true
            },
            {
                name: 'secenek_1',
                description: '1. seçenek',
                type: 3,
                required: true
            },
            {
                name: 'secenek_2',
                description: '2. seçenek',
                type: 3,
                required: true
            }
        ]
    }
];

// Slash Komutlarını Kaydetme Fonksiyonu
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

async function registerCommands() {
    try {
        if (!process.env.TOKEN || !process.env.CLIENT_ID) {
            return console.error("HATA: TOKEN veya CLIENT_ID ayarlanmamış!");
        }
        console.log('Slash komutları yükleniyor...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('Komutlar başarıyla yüklendi.');
    } catch (error) {
        console.error("Komut yükleme hatası:", error);
    }
}

client.on('ready', () => {
    console.log(`${client.user.tag} aktif ve göreve hazır!`);
    registerCommands(); // Bot açıldığında komutları kaydeder
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options } = interaction;

    // --- Kanal Kilitle ---
    if (commandName === 'kanal_kilitle') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: '❌ Bu komut için `Kanalları Yönet` yetkin yok.', ephemeral: true });
        }

        const kanal = options.getChannel('kanal');
        await kanal.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
        return interaction.reply({ content: `🔒 ${kanal} kanalı başarıyla kilitlendi.`, ephemeral: true });
    }

    // --- Ban ---
    if (commandName === 'ban') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: '❌ Kullanıcıları yasaklama yetkin yok.', ephemeral: true });
        }

        const user = options.getUser('kullanici');
        const sebep = options.getString('sebep') || 'Sebep belirtilmedi';

        try {
            await interaction.guild.members.ban(user.id, { reason: sebep });
            return interaction.reply(`🔨 **${user.tag}** yasaklandı. \n**Sebep:** ${sebep}`);
        } catch (e) {
            return interaction.reply({ content: "❌ Bu kullanıcıyı yasaklayamıyorum (Yetkim yetersiz olabilir).", ephemeral: true });
        }
    }

    // --- Avatar ---
    if (commandName === 'avatar') {
        const user = options.getUser('kullanici') || interaction.user;
        const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });
        return interaction.reply(`🖼️ **${user.tag}** kullanıcısının avatarı:\n${avatarUrl}`);
    }

    // --- AFK ---
    if (commandName === 'afk') {
        const sebep = options.getString('sebep') || 'Belirtilmedi';
        return interaction.reply(`${interaction.user}, artık **${sebep}** sebebiyle AFK modunda.`);
    }

    // --- Anket ---
    if (commandName === 'anket') {
        const soru = options.getString('soru');
        const s1 = options.getString('secenek_1');
        const s2 = options.getString('secenek_2');

        const mesaj = await interaction.reply({
            content: `📊 **ANKET: ${soru}**\n\n1️⃣ ${s1}\n2️⃣ ${s2}`,
            fetchReply: true
        });

        await mesaj.react('1️⃣');
        await mesaj.react('2️⃣');
    }
});

client.login(process.env.TOKEN);
