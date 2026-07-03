// backend/discord/bot.js
// Discord bot using discord.js v14. Registers message commands and delegates
// to discordService for all data formatting. Designed to never crash the
// backend: missing token / Supabase failure / unknown command all degrade
// gracefully.

const { Client, GatewayIntentBits } = require('discord.js');
const discordService = require('../services/discordService');

let client = null;

function startBot() {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    // eslint-disable-next-line no-console
    console.log('[discord] No DISCORD_TOKEN set — bot disabled (backend continues normally).');
    return null;
  }

  try {
    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    client.once('ready', () => {
      // eslint-disable-next-line no-console
      console.log(`[discord] Bot online as ${client.user.tag}`);
    });

    client.on('messageCreate', async (message) => {
      try {
        if (message.author.bot) return;
        const content = message.content.trim();
        if (!content.startsWith('!')) return;

        const [cmd, ...args] = content.slice(1).split(/\s+/);
        const command = cmd.toLowerCase();
        const arg = args.join(' ').trim();

        switch (command) {
          case 'status': {
            const reply = await discordService.buildStatusMessage();
            await message.reply(reply);
            break;
          }
          case 'room': {
            const reply = await discordService.buildRoomMessage(arg);
            await message.reply(reply);
            break;
          }
          case 'usage': {
            const reply = await discordService.buildUsageMessage();
            await message.reply(reply);
            break;
          }
          case 'alerts': {
            const reply = await discordService.buildAlertsMessage();
            await message.reply(reply);
            break;
          }
          case 'help': {
            await message.reply(
              [
                '**OfficePulse commands:**',
                '`!status` — total ON devices, total power, room-wise summary',
                '`!room drawing` | `!room work1` | `!room work2` — room detail',
                '`!usage` — current power + active devices + insight',
                '`!alerts` — current alerts (or "no alerts" message)',
              ].join('\n')
            );
            break;
          }
          default:
            // Ignore unknown commands silently (don't spam channels).
            break;
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[discord] message handler error:', err.message);
        try {
          await message.reply('⚠️ Something went wrong while processing that command.');
        } catch {
          /* swallow */
        }
      }
    });

    client.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('[discord] client error:', err.message);
    });

    client.login(token);
    return client;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[discord] Failed to start bot:', err.message);
    return null;
  }
}

function stopBot() {
  if (client) {
    client.destroy();
    client = null;
  }
}

module.exports = { startBot, stopBot };
