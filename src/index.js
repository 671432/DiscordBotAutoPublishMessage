//some other stuff I don't know if neccesearry but probably, but I don't know enough about discord bots

//auto publisher logic

const publishschema = require("./Schemas.js/autopublish");
client.on(Events.MessageCreate, async (message) => {
  if (message.channel.type !== ChannelType.GuildAnnouncement) return;
  if (message.author.bot) return;
  if (message.content.startsWith(".")) return;
  else {
    const data = await publishschema.findOne({ Guild: message.guild.id });

    if (!data) return;
    if (!data.Channel.includes(message.channel.id)) return;

    try {
      message.crosspost();
    } catch (e) {
      return;
    }
  }
});
