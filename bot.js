// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
require("dotenv").config();
const Query = require("minecraft-query");
const dayjs = require("dayjs");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions] });

var message;

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	const refresh = new ButtonBuilder()
		.setCustomId("refresh")
		.setLabel("Refresh")
		.setStyle(ButtonStyle.Success)
	
	const row = new ActionRowBuilder()
		.addComponents(refresh);

	getStatus().then(status => {
		client.channels.cache.get(process.env.CHANNEL).bulkDelete(10, true);
		client.channels.cache.get(process.env.CHANNEL).send({
			content: status,
			components: [row]
		}).then((msg) => {
			message = msg;
		});
	});
});

client.on("interactionCreate", async (interaction) => {
	if (interaction.isButton()) {
		interaction.deferUpdate()
		
		getStatus().then(status => {
			message.edit(status);
		});
	}
})

function getStatus() {
	return new Promise((resolve, reject) => {
		const q = new Query({host: process.env.IP, port: 25565, timeout: 7500});

		q.fullStat().then(data => {
			let status = "Server is **online**!\n"
			status += data.online_players + "/" + data.max_players + " players.\n"
			for (i in data.players) {
				status += data.players[i] + "\n"
			}
			date = dayjs().format("dddd MMMM D");
			time = dayjs().format("h:mm:ss a");
			status += "Last updated " + date + " at " + time;
			resolve(status)
	
			q.close();
		}).catch(() => {
			resolve("Server is **offline**.");
		})
	})

}

// Log in to Discord with your client's token
client.login(process.env.TOKEN);