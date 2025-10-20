const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");
const publishschema = require("../../Schemas.js/autopublish");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("auto")
    .setDescription("Setup and disable your auto publisher system")
    .addSubcommand((command) =>
      command
        .setName("publisher-add")
        .setDescription("Adds a channel to the auto publisher channel list")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel you want to auto publish")
            .addChannelTypes(ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("publisher-remove")
        .setDescription("Remove a channel from the auto publisher list")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel you want to remove from the list")
            .addChannelTypes(ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({
        content: "You dont have perms to manage the auto publish system",
        ephemeral: true,
      });

    const sub = interaction.options.getSubcommand();
    const channel = await interaction.options.getChannel("channel");

    switch (sub) {
      case "publisher-add":
        const data = await publishschema.findOne({
          Guild: interaction.guild.id,
        });

        const embed = new EmbedBuilder()
          .setColor("Blue")
          .setDescription(
            " All messages sent in $(channel) will be auto published!"
          );

        if (!data) {
          await interaction.reply({ embeds: [embed], ephemeral: true });

          await publishschema.create({
            Guild: interaction.guild.id,
            Channel: [],
          });

          await publishschema.updateOne(
            { Guild: interaction.guild.id },
            { $push: { Channel: channel.id } }
          );
        } else {
          if (data.Channel.includes(channel.id))
            return await interaction.reply({
              content:
                "The channel you selected has already been setup for auto publishing",
              ephemeral: true,
            });

          await publishschema.updateOne(
            { Guild: interaction.guild.id },
            { $push: { Channel: channel.id } }
          );
          await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        break;
      case "publisher-remove":
        const data1 = await publishschema.findOne({
          Guild: interaction.guild.id,
        });

        if (!data1) {
          return await interaction.reply({
            content: "YOU have not added any channels to the publisher system!",
            ephemeral: true,
          });
        } else {
          if (!data1 || !data1.Channel.includes(channel.id))
            return await interaction.reply({
              content:
                "That channel is not currently in your auto publish list.",
              ephemeral: true,
            });
          else {
            const embed = new EmbedBuilder()
              .setColor("Blue")
              .setDescription(
                ` ${channel} has been removed off of your auto publish list `
              );

            await interaction.reply({ embeds: [embed], ephemeral: true });
            await publishschema.updateOne(
              { Guild: interaction.guild.id },
              { $pull: { Channel: channel.id } }
            );
          }
        }
    }
  },
};
