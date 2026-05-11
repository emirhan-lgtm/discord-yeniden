require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, PermissionsBitField } = require('discord.js');

// Railway için sağlık kontrolü
const http = require('http');
http.createServer((req, res) => res.end('Bot Aktif!')).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const commands = [
    { name: 'kanal_kilitle', description: 'Kanalı kilitler', options: [{ name: 'kanal', type: 7, description: 'Kanal', required: true }] },
    { name: 'ban', description: 'Yasaklar', options: [{ name: 'kullanici', type: 6, description: 'Kişi', required: true }, { name: 'sebep', type: 3, description: 'Sebep' }] },
    { name: 'avatar', description: 'Avatarı gösterir', options: [{ name: 'kullanici', type: 6, description: 'Kişi' }] },
    { name: 'afk', description: 'AFK modu', options: [{ name: 'sebep', type: 3, description: 'Sebep' }] },
    { name: 'anket', description: 'Anket yapar', options: [{ name: 'soru', type: 3, description: 'Soru', required: true }, { name: 's1', type: 3, description: '1. Şık', required: true }, { name: 's2', type: 3, description: '2. Şık', required: true }] }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

client.on('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log(`${client.user.tag} aktif ve komutlar yüklendi!`);
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName, options } = interaction;

    if (commandName === 'kanal_kilitle') {
        const kanal = options.getChannel('kanal');
        await kanal.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
        await interaction.reply({ content: '🔒 Kanal kilitlendi.', ephemeral: true });
    }
    if (commandName === 'ban') {
        const user = options.getUser('kullanici');
        await interaction.guild.members.ban(user.id);
        await interaction.reply(`🔨 ${user.tag} yasaklandı.`);
    }
    if (commandName === 'avatar') {
        const user = options.getUser('kullanici') || interaction.user;
        await interaction.reply(user.displayAvatarURL({ dynamic: true, size: 1024 }));
    }
    if (commandName === 'afk') {
        await interaction.reply(`${interaction.user} artık AFK.`);
    }
    if (commandName === 'anket') {
        const m = await interaction.reply({ content: `📊 **${options.getString('soru')}**\n1️⃣ ${options.getString('s1')}\n2️⃣ ${options.getString('s2')}`, fetchReply: true });
        await m.react('1️⃣'); await m.react('2️⃣');
    }
});

client.login(process.env.TOKEN);
  
